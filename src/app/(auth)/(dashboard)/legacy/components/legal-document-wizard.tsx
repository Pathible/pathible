"use client";

import { pdf } from "@react-pdf/renderer";
import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Info,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { type BeneficiaryEntry, BeneficiaryList } from "@/components/beneficiary-list";
import { PersonPicker } from "@/components/person-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { flattenResponsesForPDF, type PersonReference } from "@/lib/person-utils";
import {
  getFriendlyRequirementsSummary,
  STATE_NAMES,
  type USState,
} from "@/lib/state-legal-requirements";
import { DocumentPreview } from "./document-preview";
import { LegalDocumentPDF } from "./legal-document-pdf";
import {
  DOCUMENT_META,
  type DocumentType,
  getStepsForDocumentType,
  type WizardField,
} from "./wizard-step-definitions";

interface LegalDocumentWizardProps {
  householdId: Id<"households">;
  documentId: Id<"legalDocuments">;
  onClose: () => void;
}

export function LegalDocumentWizard({
  householdId,
  documentId,
  onClose,
}: LegalDocumentWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<
    Record<string, string | boolean | PersonReference | BeneficiaryEntry[] | null>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Queries
  const document = useQuery(api.legalDocuments.get, {
    householdId,
    documentId,
  });
  const household = useQuery(api.households.get, { householdId });
  // Get current user's family member record for county/maritalStatus
  const currentUserFamilyMember = useQuery(api.persons.getCurrentUserAsFamilyMember, {
    householdId,
  });
  // Fetch financial assets for trust documents
  const financialAccounts = useQuery(
    api.financial.listAccounts,
    document?.documentType === "trust" ? { householdId } : "skip",
  );
  const properties = useQuery(
    api.financial.listProperties,
    document?.documentType === "trust" ? { householdId } : "skip",
  );
  const insurancePolicies = useQuery(
    api.financial.listInsurancePolicies,
    document?.documentType === "trust" ? { householdId } : "skip",
  );

  // Mutations
  const updateResponses = useMutation(api.legalDocuments.updateResponses);
  const markComplete = useMutation(api.legalDocuments.markComplete);
  const recordGeneration = useMutation(api.legalDocuments.recordGeneration);
  const syncPersonToSource = useMutation(api.persons.syncPersonToSource);

  // Get steps based on document type
  const steps = document ? getStepsForDocumentType(document.documentType as DocumentType) : [];
  const currentStepData = steps[currentStep];
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  // Initialize from existing responses, with familyMember and household defaults
  // IMPORTANT: Wait for currentUserFamilyMember query to resolve (not undefined)
  // before initializing to avoid race condition where county/maritalStatus aren't populated
  useEffect(() => {
    // currentUserFamilyMember is undefined while loading, null if not found, or the record if found
    // We must wait for the query to complete (not be undefined) before initializing
    const familyMemberQueryResolved = currentUserFamilyMember !== undefined;

    if (document && household && familyMemberQueryResolved && !hasInitialized) {
      try {
        const savedResponses = JSON.parse(document.responses || "{}");
        // Pre-populate defaults from familyMember and household if not already set
        const initialResponses = {
          ...savedResponses,
        };
        // Auto-fill county and maritalStatus from current user's family member record
        if (!savedResponses.county && currentUserFamilyMember?.county) {
          initialResponses.county = currentUserFamilyMember.county;
        }
        if (!savedResponses.maritalStatus && currentUserFamilyMember?.maritalStatus) {
          initialResponses.maritalStatus = currentUserFamilyMember.maritalStatus;
        }
        // Auto-fill Trust Name from household name for trust documents
        if (document.documentType === "trust" && !savedResponses.trustName && household.name) {
          initialResponses.trustName = `${household.name} Revocable Living Trust`;
        }
        setResponses(initialResponses);
      } catch {
        // If parsing fails, still try to use defaults
        const initialResponses: Record<string, string> = {};
        if (currentUserFamilyMember?.county) {
          initialResponses.county = currentUserFamilyMember.county;
        }
        if (currentUserFamilyMember?.maritalStatus) {
          initialResponses.maritalStatus = currentUserFamilyMember.maritalStatus;
        }
        // Auto-fill Trust Name from household name for trust documents
        if (document.documentType === "trust" && household.name) {
          initialResponses.trustName = `${household.name} Revocable Living Trust`;
        }
        setResponses(initialResponses);
      }
      setHasInitialized(true);
    }
  }, [document, currentUserFamilyMember, household, hasInitialized]);

  // Save responses
  const saveResponses = useCallback(async () => {
    if (!document) return;

    setIsSaving(true);
    try {
      await updateResponses({
        householdId,
        documentId,
        responses: JSON.stringify(responses),
        currentStep,
      });
    } catch (error) {
      console.error("Failed to save:", error);
      toast.error("Failed to save your progress");
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [document, householdId, documentId, responses, currentStep, updateResponses]);

  const handleFieldChange = (
    fieldId: string,
    value: string | boolean | PersonReference | BeneficiaryEntry[] | null,
  ) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }));

    // Sync PersonReference changes back to source records (familyMember or keyContact)
    // This ensures data consistency between legal documents and the family ecosystem
    if (value && typeof value === "object" && "sourceType" in value && "fullName" in value) {
      const personRef = value as PersonReference;

      // Only sync if there's a valid source ID to sync to
      if (
        (personRef.sourceType === "familyMember" && personRef.familyMemberId) ||
        (personRef.sourceType === "keyContact" && personRef.keyContactId)
      ) {
        // Fire-and-forget sync - don't block UI, but log errors
        syncPersonToSource({
          sourceType: personRef.sourceType,
          familyMemberId: personRef.familyMemberId as Id<"familyMembers"> | undefined,
          keyContactId: personRef.keyContactId as Id<"keyContacts"> | undefined,
          firstName: personRef.firstName,
          lastName: personRef.lastName,
          fullName: personRef.fullName,
          address: personRef.address,
          city: personRef.city,
          state: personRef.state,
          zipCode: personRef.zipCode,
          phone: personRef.phone,
          email: personRef.email,
          dateOfBirth: personRef.dateOfBirth,
        }).catch((error) => {
          console.error("Failed to sync person data to source:", error);
          // Don't show toast - this is a background sync, not user-initiated
        });
      }
    }
  };

  const handleNext = async () => {
    try {
      await saveResponses();
    } catch {
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete the document
      try {
        await markComplete({ householdId, documentId });
        toast.success("Document completed! You can now generate a PDF.");
      } catch (error) {
        console.error("Failed to complete:", error);
        toast.error("Failed to complete document");
      }
    }
  };

  const handleBack = async () => {
    try {
      await saveResponses();
    } catch {
      return;
    }

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = async () => {
    try {
      await saveResponses();
    } catch {
      // Still close even if save fails
    }
    onClose();
  };

  const handleExportPDF = async () => {
    if (!document) return;

    setIsExporting(true);
    try {
      // Save current responses first
      await saveResponses();

      // Flatten PersonReference objects to strings for PDF compatibility
      const flattenedResponses = flattenResponsesForPDF(responses);

      // Prepare PDF data
      const pdfData = {
        documentType: document.documentType as DocumentType,
        state: document.state,
        responses: flattenedResponses,
        userName: (flattenedResponses.fullName as string) || "User",
        generatedDate: new Date(),
      };

      // Generate PDF blob
      const blob = await pdf(<LegalDocumentPDF data={pdfData} />).toBlob();

      // Create download link
      const docMeta = DOCUMENT_META[document.documentType as DocumentType];
      const fileName = `${docMeta?.name || "Legal Document"}-${
        document.state
      }-DRAFT-${new Date().toISOString().split("T")[0]}.pdf`;

      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = fileName.toLowerCase().replace(/\s+/g, "-");
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Record generation in database
      await recordGeneration({ householdId, documentId });

      toast.success("PDF downloaded! Remember to have an attorney review it before signing.");
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Check if field should be visible based on dependencies
  const isFieldVisible = (field: WizardField): boolean => {
    if (!field.dependsOn) return true;
    return responses[field.dependsOn.field] === field.dependsOn.value;
  };

  // Loading state
  if (!document) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const docMeta = DOCUMENT_META[document.documentType as DocumentType];
  const Icon = docMeta?.icon || FileText;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{docMeta?.name || "Document"}</CardTitle>
                <CardDescription>
                  {STATE_NAMES[document.state as USState]} ({document.state})
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Toggle Preview Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLivePreview(!showLivePreview)}
                className="hidden lg:flex"
              >
                {showLivePreview ? (
                  <>
                    <PanelRightClose className="h-4 w-4 mr-2" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <PanelRightOpen className="h-4 w-4 mr-2" />
                    Show Preview
                  </>
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleClose} title="Close">
                <X className="h-5 w-5" />
                <span className="sr-only">Close wizard</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* State Requirements Info - Full width, under disclosure */}
      {document && currentStep === 0 && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent>
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                  What {STATE_NAMES[document.state as USState]} requires for this document
                </p>
                <ul className="space-y-2 text-blue-700 dark:text-blue-400">
                  {getFriendlyRequirementsSummary(
                    document.state as USState,
                    document.documentType === "trust"
                      ? "revocable_trust"
                      : document.documentType === "pour_over_will"
                        ? "will"
                        : (document.documentType as
                            | "will"
                            | "financial_poa"
                            | "healthcare_poa"
                            | "advance_directive"),
                  ).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content - Side by Side Layout */}
      <div className={`flex gap-6 ${showLivePreview ? "lg:flex-row" : ""} flex-col`}>
        {/* Left Panel - Wizard Form */}
        <div className={`space-y-4 ${showLivePreview ? "lg:w-1/2 xl:w-2/5" : "w-full"}`}>
          {/* Current Step */}
          {currentStepData && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline">Step {currentStep + 1}</Badge>
                  {document.status === "complete" && (
                    <Badge variant="secondary">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
                <CardDescription>{currentStepData.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentStepData.fields.filter(isFieldVisible).map((field) => (
                  <div key={field.id} className="space-y-2">
                    {field.type === "heading" && (
                      <h3 className="font-semibold text-lg pt-4">{field.label}</h3>
                    )}

                    {field.type === "info" && (
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border-amber-200 text-amber-900 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground">{field.helpText}</p>
                      </div>
                    )}

                    {field.type === "text" && (
                      <>
                        <Label htmlFor={field.id}>
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Input
                          id={field.id}
                          placeholder={field.placeholder}
                          value={(responses[field.id] as string) || ""}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        />
                        {field.helpText && (
                          <p className="text-xs text-muted-foreground">{field.helpText}</p>
                        )}
                      </>
                    )}

                    {field.type === "textarea" && (
                      <>
                        <Label htmlFor={field.id}>
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Textarea
                          id={field.id}
                          placeholder={field.placeholder}
                          value={(responses[field.id] as string) || ""}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          className="min-h-[100px]"
                        />
                        {field.helpText && (
                          <p className="text-xs text-muted-foreground">{field.helpText}</p>
                        )}
                      </>
                    )}

                    {field.type === "date" && (
                      <>
                        <Label htmlFor={field.id}>
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Input
                          id={field.id}
                          type="date"
                          value={(responses[field.id] as string) || ""}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        />
                      </>
                    )}

                    {field.type === "number" && (
                      <>
                        <Label htmlFor={field.id}>
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Input
                          id={field.id}
                          type="number"
                          placeholder={field.placeholder}
                          value={(responses[field.id] as string) || ""}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        />
                      </>
                    )}

                    {field.type === "select" && field.options && (
                      <>
                        <Label htmlFor={field.id}>
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        <Select
                          value={(responses[field.id] as string) || ""}
                          onValueChange={(value) => handleFieldChange(field.id, value)}
                        >
                          <SelectTrigger id={field.id}>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {field.helpText && (
                          <p className="text-xs text-muted-foreground">{field.helpText}</p>
                        )}
                      </>
                    )}

                    {field.type === "checkbox" && (
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id={field.id}
                          checked={(responses[field.id] as boolean) || false}
                          onCheckedChange={(checked) =>
                            handleFieldChange(field.id, checked === true)
                          }
                        />
                        <Label htmlFor={field.id} className="leading-relaxed cursor-pointer">
                          {field.label}
                        </Label>
                      </div>
                    )}

                    {field.type === "person" && (
                      <PersonPicker
                        householdId={householdId}
                        value={(responses[field.id] as PersonReference | null) ?? null}
                        onChange={(val) => handleFieldChange(field.id, val)}
                        label={field.label}
                        required={field.required}
                        helpText={field.helpText}
                        filterRelationships={field.personConfig?.filterRelationships}
                        excludeMinors={field.personConfig?.excludeMinors}
                        autoSelectRelationship={field.personConfig?.autoSelectRelationship}
                        autoSelectCurrentUser={field.personConfig?.autoSelectCurrentUser}
                      />
                    )}

                    {field.type === "beneficiaryList" && (
                      <BeneficiaryList
                        householdId={householdId}
                        value={(responses[field.id] as BeneficiaryEntry[]) || []}
                        onChange={(val) => handleFieldChange(field.id, val)}
                        label={field.label}
                        helpText={field.helpText}
                      />
                    )}

                    {field.type === "existingAssets" && (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-3">Your Recorded Assets</h4>
                          <p className="text-sm text-blue-700 mb-4">
                            These assets are already in your Pathible account. Reference them below
                            or add others.
                          </p>

                          {/* Properties */}
                          {properties && properties.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-blue-800 uppercase tracking-wide mb-1">
                                Real Estate ({properties.length})
                              </p>
                              <ul className="text-sm text-blue-700 space-y-1">
                                {properties.map((prop) => (
                                  <li key={prop._id} className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                    {prop.name}
                                    {prop.address && ` - ${prop.address}`}
                                    {prop.estimatedValue &&
                                      ` (Est. $${prop.estimatedValue.toLocaleString()})`}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Financial Accounts */}
                          {financialAccounts && financialAccounts.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-blue-800 uppercase tracking-wide mb-1">
                                Financial Accounts ({financialAccounts.length})
                              </p>
                              <ul className="text-sm text-blue-700 space-y-1">
                                {financialAccounts.map((acct) => (
                                  <li key={acct._id} className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                    {acct.institution} - {acct.name} ({acct.type})
                                    {acct.accountNumberLast4 && ` ****${acct.accountNumberLast4}`}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Insurance Policies */}
                          {insurancePolicies && insurancePolicies.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-blue-800 uppercase tracking-wide mb-1">
                                Insurance Policies ({insurancePolicies.length})
                              </p>
                              <ul className="text-sm text-blue-700 space-y-1">
                                {insurancePolicies.map((policy) => (
                                  <li key={policy._id} className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                    {policy.provider} - {policy.type.replace(/_/g, " ")}
                                    {policy.coverageAmount &&
                                      ` ($${policy.coverageAmount.toLocaleString()})`}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {(!properties || properties.length === 0) &&
                            (!financialAccounts || financialAccounts.length === 0) &&
                            (!insurancePolicies || insurancePolicies.length === 0) && (
                              <p className="text-sm text-blue-600 italic">
                                No assets recorded yet. You can add them in the Financial section of
                                the app, or enter them manually below.
                              </p>
                            )}
                        </div>
                        {field.helpText && (
                          <p className="text-xs text-muted-foreground">{field.helpText}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Navigation */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 0 || isSaving}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div className="flex gap-2">
                    {document.status === "complete" && (
                      <Button variant="outline" onClick={handleExportPDF} disabled={isExporting}>
                        {isExporting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        {isExporting ? "Generating..." : "Download PDF"}
                      </Button>
                    )}
                    <Button onClick={handleNext} disabled={isSaving}>
                      {isSaving ? (
                        "Saving..."
                      ) : currentStep === steps.length - 1 ? (
                        document.status === "complete" ? (
                          "Save Changes"
                        ) : (
                          "Complete Document"
                        )
                      ) : (
                        <>
                          Next
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Navigation */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Quick Navigation</span>
              </div>
              <div
                className={`grid gap-2 ${
                  showLivePreview
                    ? "grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
                }`}
              >
                {steps.map((step, index) => {
                  const isCurrent = index === currentStep;
                  const isCompleted = index < currentStep;

                  return (
                    <Button
                      key={step.id}
                      variant={isCurrent ? "default" : isCompleted ? "secondary" : "outline"}
                      size="sm"
                      className="justify-start"
                      onClick={async () => {
                        await saveResponses();
                        setCurrentStep(index);
                      }}
                      disabled={isSaving}
                    >
                      {isCompleted && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      <span className="truncate text-xs">{step.title}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Live Document Preview */}
        {showLivePreview && (
          <div className="hidden lg:block lg:w-1/2 xl:w-3/5">
            <Card className="sticky top-4 h-[calc(100vh-8rem)] overflow-hidden">
              <CardHeader className="pb-2 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Live Preview
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    Updates as you type
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-4rem)] overflow-auto">
                <DocumentPreview
                  documentType={document.documentType as DocumentType}
                  state={document.state}
                  responses={responses}
                  currentStepId={currentStepData?.id || ""}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      {/* Legal Disclosure - Above both wizard and preview */}
      <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            <span className="font-medium">Educational Document:</span> This document is for
            educational and informational purposes only. It does not constitute legal advice. Please
            consult with a qualified attorney licensed in your state before signing or relying on
            any legal document.
          </p>
        </div>
      </div>
    </div>
  );
}
