"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Edit,
  Eye,
  FileText,
  Heart,
  Info,
  Landmark,
  Loader2,
  Plus,
  ScrollText,
  Shield,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { flattenResponsesForPDF } from "@/lib/person-utils";
import { US_STATES } from "@/lib/state-legal-requirements";
import { LegalDisclaimerModal } from "./legal-disclaimer-modal";
import type { LegalDocumentPDFData } from "./legal-document-pdf";
import { PDFPreviewModal } from "./pdf-preview-modal";

type DocumentType =
  | "will"
  | "trust"
  | "pour_over_will"
  | "financial_poa"
  | "healthcare_poa"
  | "advance_directive";

interface LegalDocumentsSectionProps {
  householdId: Id<"households">;
}

// Document type metadata with icons
const DOCUMENT_TYPES: Record<
  DocumentType,
  {
    name: string;
    description: string;
    icon: typeof ScrollText;
    shortDescription: string;
  }
> = {
  will: {
    name: "Last Will and Testament",
    description:
      "Specifies how your assets will be distributed and names guardians for minor children",
    icon: ScrollText,
    shortDescription: "Asset distribution & guardians",
  },
  trust: {
    name: "Revocable Living Trust",
    description:
      "Holds assets during your lifetime and distributes them after death, avoiding probate",
    icon: Shield,
    shortDescription: "Avoid probate & manage assets",
  },
  pour_over_will: {
    name: "Pour-Over Will",
    description: "Companion to a trust that transfers any assets not in the trust at death",
    icon: FileText,
    shortDescription: "Trust companion document",
  },
  financial_poa: {
    name: "Durable Power of Attorney",
    description: "Authorizes someone to handle your financial affairs if you become incapacitated",
    icon: Landmark,
    shortDescription: "Financial decision-making",
  },
  healthcare_poa: {
    name: "Healthcare Power of Attorney",
    description: "Designates someone to make medical decisions on your behalf",
    icon: Heart,
    shortDescription: "Medical decision-making",
  },
  advance_directive: {
    name: "Advance Healthcare Directive",
    description: "Documents your wishes for end-of-life medical treatment",
    icon: ClipboardList,
    shortDescription: "End-of-life wishes",
  },
};

// Full order for display (all document types)
const ALL_DOCUMENT_TYPES: DocumentType[] = [
  "will",
  "trust",
  "pour_over_will",
  "financial_poa",
  "healthcare_poa",
  "advance_directive",
];

// Document types available for production release
// TODO: Gradually enable more document types as they are tested
const ENABLED_DOCUMENT_TYPES: DocumentType[] = [
  "will",
  // "trust",           // Coming soon - needs asset integration testing
  // "pour_over_will",  // Coming soon - depends on trust
  // "financial_poa",   // Coming soon
  // "healthcare_poa",  // Coming soon
  // "advance_directive", // Coming soon
];

// Use enabled types for display (filter to preserve order)
const DOCUMENT_ORDER: DocumentType[] = ALL_DOCUMENT_TYPES.filter((type) =>
  ENABLED_DOCUMENT_TYPES.includes(type),
);

export function LegalDocumentsSection({ householdId }: LegalDocumentsSectionProps) {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<Id<"legalDocuments"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<{
    data: LegalDocumentPDFData;
    name: string;
  } | null>(null);

  // Queries
  const profile = useQuery(api.profiles.get, isUserLoaded && user ? {} : "skip");
  const documents = useQuery(api.legalDocuments.list, { householdId });
  const stats = useQuery(api.legalDocuments.getStats, { householdId });

  // Mutations
  const createDocument = useMutation(api.legalDocuments.create);
  const removeDocument = useMutation(api.legalDocuments.remove);

  // Get user's state from profile, or default to CA
  const userState =
    profile?.state && US_STATES.includes(profile.state as (typeof US_STATES)[number])
      ? profile.state
      : null;

  const handleStartDocument = (docType: DocumentType) => {
    setSelectedDocType(docType);
    setShowDisclaimerModal(true);
  };

  const handleDisclaimerAccepted = async (state: string) => {
    if (!selectedDocType) return;

    try {
      const docId = await createDocument({
        householdId,
        documentType: selectedDocType,
        state,
      });

      setShowDisclaimerModal(false);
      toast.success(`Started ${DOCUMENT_TYPES[selectedDocType].name}`);
      // Navigate to the document editor page
      router.push(`/legacy/documents/${docId}`);
    } catch (error) {
      console.error("Failed to create document:", error);
      toast.error("Failed to start document. Please try again.");
    }
  };

  const handleEditDocument = (docId: Id<"legalDocuments">) => {
    // Navigate to the document editor page
    router.push(`/legacy/documents/${docId}`);
  };

  const handleDeleteDocument = async () => {
    if (!deletingDocument) return;

    setIsDeleting(true);
    try {
      await removeDocument({
        householdId,
        documentId: deletingDocument,
      });
      toast.success("Document deleted");
      setDeletingDocument(null);
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast.error("Failed to delete document. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePreviewDocument = (
    doc: {
      documentType: string;
      state: string;
      responses: string;
    },
    docName: string,
  ) => {
    try {
      const rawResponses = JSON.parse(doc.responses || "{}");
      // Flatten PersonReference objects to strings for PDF compatibility
      const flattenedResponses = flattenResponsesForPDF(rawResponses);
      const pdfData: LegalDocumentPDFData = {
        documentType: doc.documentType as LegalDocumentPDFData["documentType"],
        state: doc.state,
        responses: flattenedResponses,
        userName: (flattenedResponses.fullName as string) || user?.fullName || "User",
        generatedDate: new Date(),
      };
      setPreviewDocument({ data: pdfData, name: docName });
    } catch (error) {
      console.error("Failed to parse document responses:", error);
      toast.error("Failed to load document preview");
    }
  };

  // Loading state
  if (!isUserLoaded || documents === undefined || stats === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Create a map of existing documents by type
  const documentsByType = new Map(documents?.map((doc) => [doc.documentType, doc]));

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle>Legal Document Templates</CardTitle>
              <CardDescription>
                Create essential estate planning documents to protect your family
              </CardDescription>
            </div>
            {stats && stats.totalDocuments > 0 && (
              <Badge variant="default">
                {stats.completedDocuments}/{stats.totalDocuments} Complete
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Important Notice */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-300">
                For Educational Purposes Only
              </p>
              <p className="text-amber-700 dark:text-amber-400 mt-1">
                These templates help you understand estate planning concepts and organize your
                information. For legally binding documents, please consult with a qualified attorney
                in your state. Estate planning laws vary by state and change frequently. Use of
                these templates does not create an attorney-client relationship.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Cards Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        data-tour="legal-documents-grid"
      >
        {DOCUMENT_ORDER.map((docType) => {
          const meta = DOCUMENT_TYPES[docType];
          const Icon = meta.icon;
          const existingDoc = documentsByType.get(docType);

          return (
            <Card key={docType} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  {existingDoc && (
                    <Badge
                      variant={
                        existingDoc.status === "generated"
                          ? "default"
                          : existingDoc.status === "complete"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {existingDoc.status === "generated" && (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      )}
                      {existingDoc.status === "generated"
                        ? "Generated"
                        : existingDoc.status === "complete"
                          ? "Ready"
                          : "Draft"}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg mt-3">{meta.name}</CardTitle>
                <CardDescription className="text-sm">{meta.shortDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">{meta.description}</p>

                {existingDoc ? (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditDocument(existingDoc._id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {existingDoc.status === "draft" ? "Continue" : "Edit"}
                    </Button>
                    {(existingDoc.status === "complete" || existingDoc.status === "generated") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewDocument(existingDoc, meta.name)}
                        title="Preview document"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingDocument(existingDoc._id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleStartDocument(docType)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Start Document
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Info Card */}
      <Card className="bg-amber-50 border-amber-200 text-amber-900 ">
        <CardContent>
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Getting Started</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Each document guides you through the required information step by step</li>
                <li>Your progress is saved automatically as you go</li>
                <li>State-specific requirements are shown based on your location</li>
                <li>Download PDFs to review with an attorney or store for your records</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer Modal */}
      <LegalDisclaimerModal
        open={showDisclaimerModal}
        onOpenChange={setShowDisclaimerModal}
        documentType={selectedDocType}
        userState={userState}
        onAccept={handleDisclaimerAccepted}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingDocument} onOpenChange={() => setDeletingDocument(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this document and all its contents. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocument}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        open={!!previewDocument}
        onOpenChange={(open) => !open && setPreviewDocument(null)}
        documentData={previewDocument?.data ?? null}
        documentName={previewDocument?.name ?? ""}
      />
    </div>
  );
}
