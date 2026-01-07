"use client";

import { pdf } from "@react-pdf/renderer";
import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  FileText,
  Heart,
  Info,
  Landmark,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  ScrollText,
  Shield,
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

interface LegalDocumentWizardProps {
  householdId: Id<"households">;
  documentId: Id<"legalDocuments">;
  onClose: () => void;
}

type DocumentType =
  | "will"
  | "trust"
  | "pour_over_will"
  | "financial_poa"
  | "healthcare_poa"
  | "advance_directive";

// Document metadata
const DOCUMENT_META: Record<
  DocumentType,
  {
    name: string;
    icon: typeof ScrollText;
  }
> = {
  will: { name: "Last Will and Testament", icon: ScrollText },
  trust: { name: "Revocable Living Trust", icon: Shield },
  pour_over_will: { name: "Pour-Over Will", icon: FileText },
  financial_poa: { name: "Durable Power of Attorney", icon: Landmark },
  healthcare_poa: { name: "Healthcare Power of Attorney", icon: Heart },
  advance_directive: {
    name: "Advance Healthcare Directive",
    icon: ClipboardList,
  },
};

// Define wizard steps for each document type
interface WizardStep {
  id: string;
  title: string;
  description: string;
  fields: WizardField[];
}

interface PersonConfig {
  filterRelationships?: string[];
  excludeMinors?: boolean;
  autoSelectRelationship?: string;
  autoSelectCurrentUser?: boolean;
}

interface WizardField {
  id: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "select"
    | "checkbox"
    | "date"
    | "number"
    | "heading"
    | "info"
    | "person"
    | "personList"
    | "beneficiaryList"
    | "existingAssets";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  helpText?: string;
  dependsOn?: { field: string; value: string | boolean };
  personConfig?: PersonConfig;
}

// Will wizard steps
const WILL_STEPS: WizardStep[] = [
  {
    id: "personal",
    title: "Personal Information",
    description: "Your basic information for the will",
    fields: [
      {
        id: "testator",
        label: "Your Information",
        type: "person",
        required: true,
        helpText: "Pre-filled from your profile. Edit if needed.",
        personConfig: {
          autoSelectCurrentUser: true,
        },
      },
      {
        id: "county",
        label: "County of Residence",
        type: "text",
        required: true,
        helpText: "Required for legal documents in most states",
      },
      {
        id: "maritalStatus",
        label: "Marital Status",
        type: "select",
        required: true,
        options: [
          { value: "single", label: "Single" },
          { value: "married", label: "Married" },
          { value: "divorced", label: "Divorced" },
          { value: "widowed", label: "Widowed" },
          { value: "domestic_partnership", label: "Domestic Partnership" },
        ],
      },
      {
        id: "spouse",
        label: "Spouse/Partner",
        type: "person",
        dependsOn: { field: "maritalStatus", value: "married" },
        personConfig: {
          filterRelationships: ["spouse", "partner"],
          autoSelectRelationship: "spouse",
        },
      },
    ],
  },
  {
    id: "executor",
    title: "Executor",
    description: "Who will manage your estate after your passing",
    fields: [
      {
        id: "executorInfo",
        label: "",
        type: "info",
        helpText:
          "Your executor (also called personal representative) is responsible for gathering your assets, paying debts and taxes, and distributing property according to your wishes. Choose someone trustworthy and organized.",
      },
      {
        id: "executor",
        label: "Primary Executor",
        type: "person",
        required: true,
        helpText: "Must be 18 or older",
        personConfig: {
          excludeMinors: true,
        },
      },
      {
        id: "alternateExecutor",
        label: "Alternate Executor",
        type: "person",
        helpText: "Who should serve if the primary executor cannot or will not serve",
        personConfig: {
          excludeMinors: true,
        },
      },
      {
        id: "bondWaiver",
        label: "Waive executor bond requirement",
        type: "checkbox",
        helpText:
          "Waiving bond saves your estate money by not requiring the executor to post a surety bond. Recommended for trusted family members.",
      },
      {
        id: "executorCompensation",
        label: "Executor Compensation",
        type: "select",
        options: [
          { value: "statutory", label: "Statutory rate (state-determined)" },
          { value: "reasonable", label: "Reasonable compensation" },
          { value: "none", label: "No compensation (family member)" },
          { value: "specific", label: "Specific amount (specify below)" },
        ],
        helpText: "How should your executor be compensated for their work?",
      },
      {
        id: "executorCompensationAmount",
        label: "Specific Compensation Amount",
        type: "text",
        placeholder: "e.g., $5,000 or 2% of estate value",
        dependsOn: { field: "executorCompensation", value: "specific" },
      },
    ],
  },
  {
    id: "beneficiaries",
    title: "Beneficiaries",
    description: "Who will receive your assets",
    fields: [
      {
        id: "beneficiariesInfo",
        label: "",
        type: "info",
        helpText:
          "List the people or organizations who will inherit your assets. 'Per stirpes' means if a beneficiary predeceases you, their share passes to their descendants.",
      },
      {
        id: "residuaryBeneficiary",
        label: "Primary Beneficiary (receives remainder of estate)",
        type: "person",
        required: true,
        personConfig: {},
      },
      {
        id: "residuaryPercentage",
        label: "Percentage",
        type: "number",
        placeholder: "100",
      },
      {
        id: "additionalBeneficiaries",
        label: "Additional Beneficiaries",
        type: "beneficiaryList",
        helpText: "Add beneficiaries from your family or contacts, or enter names manually",
      },
      {
        id: "specificBequests",
        label: "Specific Gifts (items to specific people)",
        type: "textarea",
        placeholder:
          "My wedding ring to my daughter Sarah\nMy book collection to the local library",
        helpText: "List specific items and who should receive them",
      },
      {
        id: "contingentBeneficiary",
        label: "Final Contingent Beneficiary",
        type: "person",
        helpText:
          "Who receives your estate if ALL primary beneficiaries predecease you? Consider naming a charity.",
        personConfig: {},
      },
      {
        id: "perStirpes",
        label: "Distribute per stirpes (to descendants if beneficiary predeceases)",
        type: "checkbox",
        helpText: "If checked, a deceased beneficiary's share passes to their children/descendants",
      },
      {
        id: "survivalPeriod",
        label: "Survival Period Requirement",
        type: "select",
        options: [
          { value: "30", label: "30 days (recommended)" },
          { value: "60", label: "60 days" },
          { value: "90", label: "90 days" },
          { value: "0", label: "No survival period required" },
        ],
        helpText:
          "Beneficiaries must survive you by this period to inherit. This prevents complex probate if you die close in time to a beneficiary.",
      },
    ],
  },
  {
    id: "provisions",
    title: "Special Provisions",
    description: "Additional legal protections for your estate",
    fields: [
      {
        id: "provisionsInfo",
        label: "",
        type: "info",
        helpText:
          "These provisions provide additional legal protection for your estate and beneficiaries.",
      },
      {
        id: "noContestClause",
        label: "Include no-contest (in terrorem) clause",
        type: "checkbox",
        helpText:
          "Disinherits any beneficiary who contests your will in court. Enforcement varies by state.",
      },
      {
        id: "simultaneousDeathClause",
        label: "Include simultaneous death clause",
        type: "checkbox",
        helpText:
          "Specifies what happens if you and a beneficiary die at the same time or within the survival period.",
      },
      {
        id: "taxPaymentSource",
        label: "Source for Estate Tax Payment",
        type: "select",
        options: [
          {
            value: "residuary",
            label: "Pay from residuary estate (recommended)",
          },
          { value: "apportioned", label: "Apportion among beneficiaries" },
          {
            value: "specific",
            label: "Pay from specific fund (specify below)",
          },
        ],
        helpText: "How should estate and inheritance taxes be paid?",
      },
      {
        id: "taxPaymentFund",
        label: "Specific Fund for Tax Payment",
        type: "text",
        placeholder: "e.g., proceeds from sale of 123 Main St.",
        dependsOn: { field: "taxPaymentSource", value: "specific" },
      },
      {
        id: "debtPaymentInstructions",
        label: "Special Instructions for Debt Payment",
        type: "textarea",
        placeholder: "e.g., Pay off mortgage on family home before distribution",
        helpText: "Any specific instructions about paying your debts",
      },
    ],
  },
  {
    id: "guardians",
    title: "Guardians",
    description: "Care for minor children (if applicable)",
    fields: [
      {
        id: "hasMinorChildren",
        label: "I have minor children (under 18)",
        type: "checkbox",
      },
      {
        id: "guardian",
        label: "Guardian for Minor Children",
        type: "person",
        dependsOn: { field: "hasMinorChildren", value: true },
        helpText: "Must be 18 or older",
        personConfig: {
          excludeMinors: true,
        },
      },
      {
        id: "alternateGuardian",
        label: "Alternate Guardian",
        type: "person",
        dependsOn: { field: "hasMinorChildren", value: true },
        personConfig: {
          excludeMinors: true,
        },
      },
      {
        id: "childrenNames",
        label: "Names of Minor Children (one per line with birth dates)",
        type: "textarea",
        placeholder: "John Smith Jr. - DOB: January 15, 2015\nJane Smith - DOB: March 22, 2018",
        dependsOn: { field: "hasMinorChildren", value: true },
        helpText:
          "Your minor children from your family profile will be used. Add additional details here if needed.",
      },
      {
        id: "childrenTrustAge",
        label: "Age at which children receive inheritance outright",
        type: "select",
        options: [
          { value: "18", label: "18 years old (age of majority)" },
          { value: "21", label: "21 years old" },
          { value: "25", label: "25 years old (recommended)" },
          { value: "30", label: "30 years old" },
          { value: "staged", label: "Staged distribution (specify below)" },
        ],
        helpText: "Until this age, the guardian manages their inheritance",
        dependsOn: { field: "hasMinorChildren", value: true },
      },
      {
        id: "stagedDistribution",
        label: "Staged Distribution Details",
        type: "textarea",
        placeholder: "1/3 at age 25, 1/3 at age 30, remainder at age 35",
        dependsOn: { field: "childrenTrustAge", value: "staged" },
      },
    ],
  },
  {
    id: "digital",
    title: "Digital Assets",
    description: "Online accounts and digital property",
    fields: [
      {
        id: "digitalAssetsInfo",
        label: "",
        type: "info",
        helpText:
          "Under the Revised Uniform Fiduciary Access to Digital Assets Act (RUFADAA), you can grant your executor access to digital assets. This includes email, social media, cryptocurrency, digital photos, and online banking.",
      },
      {
        id: "grantDigitalAccess",
        label: "Grant executor full access to all digital assets",
        type: "checkbox",
        helpText: "Recommended to ensure your executor can manage online accounts",
      },
      {
        id: "digitalExecutor",
        label: "Digital Assets Executor (if different from main executor)",
        type: "text",
        helpText: "Consider naming someone tech-savvy if your main executor is not",
      },
      {
        id: "digitalAssetsInstructions",
        label: "Instructions for Digital Assets",
        type: "textarea",
        placeholder:
          "Delete my social media accounts\nTransfer photos to my spouse\nBitcoin wallet password is stored in...",
      },
      {
        id: "passwordLocation",
        label: "Where are your passwords stored?",
        type: "text",
        placeholder: "Password manager, safe deposit box, etc.",
      },
      {
        id: "socialMediaInstructions",
        label: "Social Media Account Instructions",
        type: "select",
        options: [
          { value: "delete", label: "Delete all accounts" },
          {
            value: "memorialize",
            label: "Memorialize/legacy mode where available",
          },
          { value: "download_delete", label: "Download content then delete" },
          { value: "agent_decides", label: "Let executor decide" },
        ],
      },
      {
        id: "cryptocurrencyInfo",
        label: "Cryptocurrency Holdings (describe location of keys/wallets)",
        type: "textarea",
        placeholder:
          "Bitcoin: Hardware wallet in safe deposit box\nEthereum: Instructions with attorney",
        helpText: "Critical: Without access information, cryptocurrency may be lost forever",
      },
    ],
  },
  {
    id: "final",
    title: "Final Wishes",
    description: "Burial, memorial, and special instructions",
    fields: [
      {
        id: "burialPreference",
        label: "Burial/Cremation Preference",
        type: "select",
        options: [
          { value: "burial", label: "Traditional Burial" },
          { value: "cremation", label: "Cremation" },
          { value: "green_burial", label: "Green/Natural Burial" },
          { value: "donation", label: "Body Donation to Science" },
          { value: "other", label: "Other (specify below)" },
        ],
      },
      {
        id: "burialInstructions",
        label: "Specific Burial/Memorial Instructions",
        type: "textarea",
        helpText: "Include location preferences, type of service, or any specific requests",
      },
      {
        id: "organDonation",
        label: "I wish to be an organ donor",
        type: "checkbox",
      },
      {
        id: "organDonationLimitations",
        label: "Organ Donation Limitations",
        type: "textarea",
        placeholder: "e.g., Donate any needed organs, or only specific organs",
        dependsOn: { field: "organDonation", value: true },
      },
      {
        id: "specialInstructions",
        label: "Any Other Special Instructions",
        type: "textarea",
        helpText: "Pet care instructions, charitable wishes, messages to family, etc.",
      },
      {
        id: "petCareInstructions",
        label: "Pet Care Instructions",
        type: "textarea",
        placeholder:
          "Who should care for my pets, any special care requirements, funds set aside for pet care",
        helpText: "Consider naming a caretaker and setting aside funds for pet expenses",
      },
    ],
  },
];

// Healthcare POA steps
const HEALTHCARE_POA_STEPS: WizardStep[] = [
  {
    id: "personal",
    title: "Personal Information",
    description: "Your basic information",
    fields: [
      {
        id: "principal",
        label: "Your Information",
        type: "person",
        required: true,
        helpText: "Pre-filled from your profile. Edit if needed.",
        personConfig: {
          autoSelectCurrentUser: true,
        },
      },
      {
        id: "county",
        label: "County of Residence",
        type: "text",
        required: true,
      },
      {
        id: "primaryPhysician",
        label: "Primary Physician Name",
        type: "text",
        helpText: "Your doctor should have a copy of this document",
      },
      {
        id: "primaryPhysicianPhone",
        label: "Primary Physician Phone",
        type: "text",
      },
    ],
  },
  {
    id: "agent",
    title: "Healthcare Agent",
    description: "Who will make medical decisions for you",
    fields: [
      {
        id: "agentInfo",
        label: "",
        type: "info",
        helpText:
          "Your healthcare agent (also called healthcare proxy or surrogate) will make medical decisions for you if you become unable to communicate your wishes. Choose someone you trust completely who understands your values.",
      },
      {
        id: "healthcareAgent",
        label: "Primary Healthcare Agent",
        type: "person",
        required: true,
        helpText: "Must be 18 or older",
        personConfig: {
          excludeMinors: true,
        },
      },
      {
        id: "alternateHealthcareAgent",
        label: "First Alternate Healthcare Agent",
        type: "person",
        helpText: "Who should serve if primary agent is unavailable",
        personConfig: {
          excludeMinors: true,
        },
      },
      {
        id: "secondAlternateHealthcareAgent",
        label: "Second Alternate Healthcare Agent",
        type: "person",
        personConfig: {
          excludeMinors: true,
        },
      },
    ],
  },
  {
    id: "powers",
    title: "Agent Powers",
    description: "What decisions can your agent make",
    fields: [
      {
        id: "powersInfo",
        label: "",
        type: "info",
        helpText:
          "Select the powers you want to grant your healthcare agent. Most people grant all of these powers.",
      },
      {
        id: "powerConsent",
        label: "Consent to or refuse any medical treatment, procedure, or diagnostic test",
        type: "checkbox",
      },
      {
        id: "powerSurgery",
        label: "Consent to or refuse surgical procedures",
        type: "checkbox",
      },
      {
        id: "powerMedication",
        label: "Consent to or refuse administration of medication",
        type: "checkbox",
      },
      {
        id: "powerWithdraw",
        label: "Withdraw or withhold life-sustaining treatment",
        type: "checkbox",
      },
      {
        id: "powerAccess",
        label: "Access medical records and information (HIPAA authorization)",
        type: "checkbox",
      },
      {
        id: "powerFacility",
        label: "Choose healthcare providers and facilities",
        type: "checkbox",
      },
      {
        id: "powerAdmission",
        label: "Consent to admission to hospitals, nursing homes, hospice, or other facilities",
        type: "checkbox",
      },
      {
        id: "powerOrgan",
        label: "Make decisions about organ and tissue donation",
        type: "checkbox",
      },
      {
        id: "powerBurial",
        label: "Make decisions about burial, cremation, and disposition of remains",
        type: "checkbox",
      },
      {
        id: "powerAutopsy",
        label: "Consent to or refuse autopsy",
        type: "checkbox",
      },
      {
        id: "powerLegal",
        label: "Take legal action to enforce my healthcare wishes",
        type: "checkbox",
      },
      {
        id: "powerMentalHealth",
        label: "Mental Health Treatment Authority",
        type: "select",
        options: [
          {
            value: "full",
            label: "Full authority for mental health decisions",
          },
          {
            value: "limited",
            label: "Limited authority (cannot commit to psychiatric facility)",
          },
          { value: "none", label: "No mental health decision authority" },
        ],
        helpText: "Mental health treatment powers may be subject to additional state requirements",
      },
      {
        id: "limitationsOnPowers",
        label: "Any limitations or special instructions for your agent",
        type: "textarea",
        placeholder:
          "e.g., Must consult with my children before withdrawing life support\nDo not authorize experimental treatments",
      },
    ],
  },
  {
    id: "effective",
    title: "When Powers Become Effective",
    description: "When your agent can act on your behalf",
    fields: [
      {
        id: "effectiveInfo",
        label: "",
        type: "info",
        helpText:
          "You can choose whether your agent's powers are effective immediately or only when you become incapacitated.",
      },
      {
        id: "effectiveTiming",
        label: "When should your agent's powers become effective?",
        type: "select",
        required: true,
        options: [
          { value: "immediate", label: "Immediately upon signing" },
          { value: "incapacity", label: "Only upon my incapacity" },
        ],
      },
      {
        id: "incapacityDetermination",
        label: "How should incapacity be determined?",
        type: "select",
        options: [
          {
            value: "one_physician",
            label: "One physician determines I lack capacity",
          },
          {
            value: "two_physicians",
            label: "Two physicians determine I lack capacity",
          },
          {
            value: "attending",
            label: "My attending physician determines I lack capacity",
          },
        ],
        helpText:
          "Most healthcare POAs become effective when your attending physician determines you lack capacity",
        dependsOn: { field: "effectiveTiming", value: "incapacity" },
      },
    ],
  },
  {
    id: "hipaa",
    title: "HIPAA Authorization",
    description: "Access to your protected health information",
    fields: [
      {
        id: "hipaaInfo",
        label: "",
        type: "info",
        helpText:
          "Under HIPAA (45 CFR 164.502(g)), healthcare providers cannot release your medical information without authorization. This section ensures your agent can access the information needed to make decisions.",
      },
      {
        id: "hipaaAuthorize",
        label: "I authorize release of ALL my protected health information to my healthcare agent",
        type: "checkbox",
      },
      {
        id: "hipaaMentalHealth",
        label: "Include mental health records",
        type: "checkbox",
        helpText: "Mental health records may have additional protections under state law",
      },
      {
        id: "hipaaSubstanceAbuse",
        label: "Include drug and alcohol treatment records",
        type: "checkbox",
        helpText: "These records have special protections under 42 CFR Part 2",
      },
      {
        id: "hipaaHIV",
        label: "Include HIV/AIDS testing and treatment records",
        type: "checkbox",
      },
      {
        id: "hipaaGenetic",
        label: "Include genetic testing information",
        type: "checkbox",
      },
      {
        id: "additionalHipaaRecipients",
        label: "Additional people authorized to receive medical information",
        type: "textarea",
        placeholder: "Name - Relationship - Phone\nJane Smith - Daughter - (555) 123-4567",
        helpText: "These people can receive information but cannot make decisions",
      },
    ],
  },
  {
    id: "preferences",
    title: "Values and Preferences",
    description: "Guidance for your healthcare agent",
    fields: [
      {
        id: "preferencesInfo",
        label: "",
        type: "info",
        helpText:
          "Help your agent understand your values so they can make decisions consistent with your wishes.",
      },
      {
        id: "qualityOfLife",
        label: "What does quality of life mean to you?",
        type: "textarea",
        placeholder:
          "e.g., Being able to communicate with family, recognizing loved ones, being free of severe pain",
        helpText: "What conditions would make life not worth living for you?",
      },
      {
        id: "generalPreferences",
        label: "General Treatment Philosophy",
        type: "select",
        options: [
          {
            value: "prolong",
            label: "Prolong life as long as possible, regardless of quality",
          },
          {
            value: "balanced",
            label: "Balance between prolonging life and quality of life",
          },
          {
            value: "comfort",
            label: "Focus on comfort and quality rather than prolonging life",
          },
        ],
      },
      {
        id: "painManagement",
        label: "Pain Management Preference",
        type: "select",
        options: [
          {
            value: "maximum",
            label: "Maximum pain relief, even if it affects consciousness or hastens death",
          },
          {
            value: "balanced",
            label: "Balance pain relief with maintaining alertness",
          },
          {
            value: "minimal",
            label: "Minimal medication to remain as alert as possible",
          },
        ],
      },
      {
        id: "religiousConsiderations",
        label: "Religious or Spiritual Considerations",
        type: "textarea",
        placeholder: "Any religious beliefs that should guide medical decisions",
      },
      {
        id: "wantClergyVisit",
        label: "I want clergy/spiritual advisor visits during serious illness",
        type: "checkbox",
      },
      {
        id: "clergyContact",
        label: "Clergy/Spiritual Advisor Contact Information",
        type: "text",
        dependsOn: { field: "wantClergyVisit", value: true },
      },
      {
        id: "specialInstructions",
        label: "Additional Instructions for Your Agent",
        type: "textarea",
        placeholder: "Any other guidance for your healthcare agent",
      },
    ],
  },
  {
    id: "guardian",
    title: "Guardian Nomination",
    description: "If a court needs to appoint a guardian",
    fields: [
      {
        id: "guardianInfo",
        label: "",
        type: "info",
        helpText:
          "If a court ever needs to appoint a guardian for you, this nomination indicates your preference. Courts typically honor these nominations.",
      },
      {
        id: "nominateAgentAsGuardian",
        label: "I nominate my healthcare agent to serve as guardian if one is needed",
        type: "checkbox",
      },
      {
        id: "excludeFromGuardian",
        label: "People I DO NOT want appointed as guardian",
        type: "textarea",
        placeholder: "Name and reason (optional)",
        helpText: "List anyone you specifically do not want the court to appoint",
      },
    ],
  },
];

// Financial POA steps
const FINANCIAL_POA_STEPS: WizardStep[] = [
  {
    id: "personal",
    title: "Personal Information",
    description: "Your basic information",
    fields: [
      {
        id: "principal",
        label: "Your Information",
        type: "person",
        required: true,
        helpText: "Pre-filled from your profile. Edit if needed.",
        personConfig: {
          autoSelectCurrentUser: true,
        },
      },
      {
        id: "county",
        label: "County of Residence",
        type: "text",
        required: true,
      },
      {
        id: "ssnLast4",
        label: "Last 4 Digits of Social Security Number",
        type: "text",
        helpText: "For identification purposes only - never share your full SSN",
      },
    ],
  },
  {
    id: "agent",
    title: "Financial Agent",
    description: "Who will manage your financial affairs",
    fields: [
      {
        id: "agentInfo",
        label: "",
        type: "info",
        helpText:
          "Your agent (also called attorney-in-fact) will have the power to handle your financial matters. This is a significant responsibility - choose someone trustworthy with good financial judgment. Your agent is a fiduciary who must act in your best interest.",
      },
      {
        id: "financialAgent",
        label: "Primary Agent",
        type: "person",
        required: true,
        helpText: "Must be 18 or older",
        personConfig: {
          excludeMinors: true,
        },
      },
      {
        id: "alternateFinancialAgent",
        label: "First Successor Agent",
        type: "person",
        helpText: "Who should serve if primary agent is unavailable",
        personConfig: {
          excludeMinors: true,
        },
      },
      {
        id: "secondAlternateFinancialAgent",
        label: "Second Successor Agent",
        type: "person",
        personConfig: {
          excludeMinors: true,
        },
      },
      {
        id: "coAgents",
        label: "Appoint co-agents (both must act together)",
        type: "checkbox",
        helpText:
          "If checked, primary agent and first successor must act jointly. This provides oversight but may be less convenient.",
      },
    ],
  },
  {
    id: "powers",
    title: "Powers Granted",
    description: "What financial decisions can your agent make",
    fields: [
      {
        id: "powersInfo",
        label: "",
        type: "info",
        helpText:
          "Select the financial powers you want to grant. A general power of attorney typically includes all of these powers. You can also grant specific limited powers.",
      },
      {
        id: "powerBanking",
        label:
          "Banking: Open/close accounts, make deposits/withdrawals, sign checks, access safe deposit boxes",
        type: "checkbox",
      },
      {
        id: "powerRealEstate",
        label: "Real Estate: Buy, sell, lease, manage, mortgage, or refinance real property",
        type: "checkbox",
      },
      {
        id: "powerPersonalProperty",
        label:
          "Personal Property: Buy, sell, or manage vehicles, furniture, jewelry, and other possessions",
        type: "checkbox",
      },
      {
        id: "powerInvestments",
        label:
          "Investments: Buy, sell, and manage stocks, bonds, mutual funds, and brokerage accounts",
        type: "checkbox",
      },
      {
        id: "powerRetirement",
        label:
          "Retirement Accounts: Manage IRAs, 401(k)s, pensions; make contributions and withdrawals",
        type: "checkbox",
      },
      {
        id: "powerTaxes",
        label:
          "Taxes: Prepare and file tax returns, represent me before IRS/state agencies, receive refunds",
        type: "checkbox",
      },
      {
        id: "powerInsurance",
        label:
          "Insurance: Purchase, maintain, modify, cancel, or cash in insurance policies; file claims",
        type: "checkbox",
      },
      {
        id: "powerBusiness",
        label:
          "Business Operations: Operate businesses, sign contracts, hire/fire employees, form entities",
        type: "checkbox",
      },
      {
        id: "powerGovernment",
        label:
          "Government Benefits: Apply for and manage Social Security, Medicare, Medicaid, veterans benefits",
        type: "checkbox",
      },
      {
        id: "powerLegal",
        label: "Legal Matters: Engage attorneys, commence or settle lawsuits, sign legal documents",
        type: "checkbox",
      },
      {
        id: "powerDigitalAssets",
        label:
          "Digital Assets: Access and manage online accounts, email, social media, cryptocurrency (per RUFADAA)",
        type: "checkbox",
      },
      {
        id: "powerGifts",
        label: "Gifting: Make gifts on my behalf",
        type: "checkbox",
        helpText: "This power requires explicit grant and may have tax implications",
      },
      {
        id: "giftLimitations",
        label: "Gift Limitations",
        type: "select",
        options: [
          {
            value: "annual_exclusion",
            label: "Up to annual gift tax exclusion per person ($18,000 in 2024)",
          },
          {
            value: "pattern",
            label: "Consistent with my established pattern of giving",
          },
          { value: "specific", label: "Specific amount (specify below)" },
          { value: "unlimited", label: "No limitation on gift amounts" },
        ],
        dependsOn: { field: "powerGifts", value: true },
      },
      {
        id: "giftSpecificAmount",
        label: "Specific Gift Limitation Amount",
        type: "text",
        placeholder: "e.g., $10,000 per year total",
        dependsOn: { field: "giftLimitations", value: "specific" },
      },
      {
        id: "powerEstatePlanning",
        label:
          "Estate Planning: Create/amend trusts, change beneficiary designations (CAUTION - very broad power)",
        type: "checkbox",
        helpText:
          "This is an extremely broad power that could change your estate plan. Grant only if absolutely necessary.",
      },
    ],
  },
  {
    id: "timing",
    title: "When Powers Take Effect",
    description: "Immediate or springing powers",
    fields: [
      {
        id: "timingInfo",
        label: "",
        type: "info",
        helpText:
          "This is a DURABLE Power of Attorney, meaning it remains valid even if you become incapacitated. You can choose when powers begin - immediately or only upon incapacity (springing POA). Note: Many financial institutions prefer immediate POAs.",
      },
      {
        id: "effectiveTiming",
        label: "When should these powers take effect?",
        type: "select",
        required: true,
        options: [
          {
            value: "immediate",
            label: "Immediately upon signing (recommended)",
          },
          {
            value: "incapacity",
            label: "Only upon my incapacity (springing POA)",
          },
        ],
      },
      {
        id: "incapacityDetermination",
        label: "How should incapacity be determined?",
        type: "select",
        options: [
          {
            value: "one_physician",
            label: "One licensed physician certifies incapacity",
          },
          {
            value: "two_physicians",
            label: "Two licensed physicians certify incapacity",
          },
          { value: "court", label: "Court determination of incapacity" },
        ],
        dependsOn: { field: "effectiveTiming", value: "incapacity" },
      },
      {
        id: "terminationDate",
        label: "Termination Date (leave blank for no expiration)",
        type: "date",
        helpText:
          "If you want this POA to expire on a specific date, enter it here. Otherwise, it remains valid until revoked.",
      },
    ],
  },
  {
    id: "duties",
    title: "Agent Duties and Compensation",
    description: "Fiduciary duties and record-keeping requirements",
    fields: [
      {
        id: "dutiesInfo",
        label: "",
        type: "info",
        helpText:
          "Your agent is a fiduciary who must act in your best interest, maintain your estate plan, and keep records. These provisions help ensure accountability.",
      },
      {
        id: "accountingRequired",
        label: "Agent must keep detailed records of all transactions",
        type: "checkbox",
        helpText: "Recommended - creates paper trail and accountability",
      },
      {
        id: "accountingFrequency",
        label: "Accounting Frequency",
        type: "select",
        options: [
          { value: "request", label: "Upon request only" },
          { value: "annual", label: "Annually" },
          { value: "quarterly", label: "Quarterly" },
        ],
        dependsOn: { field: "accountingRequired", value: true },
      },
      {
        id: "accountingRecipients",
        label: "Who should receive accountings?",
        type: "textarea",
        placeholder: "Name and relationship, one per line",
        dependsOn: { field: "accountingRequired", value: true },
      },
      {
        id: "agentCompensation",
        label: "Agent Compensation",
        type: "select",
        options: [
          {
            value: "none",
            label: "No compensation (reimbursement for expenses only)",
          },
          {
            value: "reasonable",
            label: "Reasonable compensation for services",
          },
          { value: "specific", label: "Specific compensation (specify below)" },
          { value: "professional", label: "Professional fiduciary rates" },
        ],
      },
      {
        id: "specificCompensation",
        label: "Specific Compensation Amount",
        type: "text",
        placeholder: "e.g., $500/month or $50/hour",
        dependsOn: { field: "agentCompensation", value: "specific" },
      },
      {
        id: "preserveEstatePlan",
        label: "Agent must attempt to preserve my estate plan",
        type: "checkbox",
        helpText:
          "Requires agent to consider your existing beneficiary designations and estate planning documents",
      },
    ],
  },
  {
    id: "limitations",
    title: "Limitations & Special Instructions",
    description: "Any restrictions on your agent's powers",
    fields: [
      {
        id: "limitationsInfo",
        label: "",
        type: "info",
        helpText:
          "You can limit your agent's powers or provide specific instructions. These limitations become part of the legal document.",
      },
      {
        id: "limitations",
        label: "Powers Explicitly NOT Granted",
        type: "textarea",
        placeholder:
          "e.g., May not sell my primary residence without court approval\nMay not make gifts to themselves",
        helpText: "List any powers you specifically do NOT want to grant",
      },
      {
        id: "transactionLimits",
        label: "Transaction Limits",
        type: "textarea",
        placeholder: "e.g., Transactions over $25,000 require written notice to my children",
        helpText: "Set dollar thresholds that require additional approvals or notice",
      },
      {
        id: "specialInstructions",
        label: "Special Instructions",
        type: "textarea",
        placeholder: "Any other instructions for your agent",
      },
      {
        id: "thirdPartyReliance",
        label: "Include third-party reliance protection",
        type: "checkbox",
        helpText:
          "Protects banks and institutions that rely on this POA in good faith. Recommended for practical use.",
      },
      {
        id: "selfDealingProhibited",
        label: "Prohibit self-dealing by agent",
        type: "checkbox",
        helpText:
          "Agent cannot use your assets for their own benefit (except for authorized compensation)",
      },
    ],
  },
];

// Advance Directive steps
const ADVANCE_DIRECTIVE_STEPS: WizardStep[] = [
  {
    id: "personal",
    title: "Personal Information",
    description: "Your basic information",
    fields: [
      {
        id: "principal",
        label: "Your Information",
        type: "person",
        required: true,
        helpText: "Pre-filled from your profile. Edit if needed.",
        personConfig: {
          autoSelectCurrentUser: true,
        },
      },
      {
        id: "county",
        label: "County of Residence",
        type: "text",
        required: true,
      },
      {
        id: "primaryPhysician",
        label: "Primary Physician Name",
        type: "text",
        helpText: "Your doctor should have a copy of this document",
      },
      {
        id: "primaryPhysicianPhone",
        label: "Primary Physician Phone",
        type: "text",
      },
    ],
  },
  {
    id: "definitions",
    title: "Understanding the Terms",
    description: "Definitions of medical conditions covered by this directive",
    fields: [
      {
        id: "definitionsInfo",
        label: "",
        type: "info",
        helpText:
          "This directive applies in specific medical situations. Understanding these terms will help you make informed decisions.",
      },
      {
        id: "terminalDefinition",
        label: "",
        type: "info",
        helpText:
          "TERMINAL CONDITION: An incurable and irreversible condition that will result in death within a relatively short time without life-sustaining treatment.",
      },
      {
        id: "permanentUnconscious",
        label: "",
        type: "info",
        helpText:
          "PERMANENT UNCONSCIOUSNESS: A condition where you are permanently unconscious with no reasonable medical expectation of regaining consciousness (includes persistent vegetative state and irreversible coma).",
      },
      {
        id: "endStageDefinition",
        label: "",
        type: "info",
        helpText:
          "END-STAGE CONDITION: An advanced, progressive, irreversible condition that has caused severe and permanent physical dependency, and for which treatment would be medically ineffective.",
      },
      {
        id: "acknowledgeDefinitions",
        label: "I have read and understand these definitions",
        type: "checkbox",
        required: true,
      },
    ],
  },
  {
    id: "lifesustaining",
    title: "Life-Sustaining Treatment",
    description: "Your wishes for end-of-life care",
    fields: [
      {
        id: "lifeSustainingInfo",
        label: "",
        type: "info",
        helpText:
          "Life-sustaining treatment means any medical procedure that serves to prolong the dying process, including mechanical ventilation, CPR, artificial nutrition and hydration, dialysis, and similar interventions.",
      },
      {
        id: "terminalConditionPreference",
        label: "If I have a TERMINAL CONDITION:",
        type: "select",
        required: true,
        options: [
          {
            value: "all_measures",
            label: "I want all life-prolonging treatments",
          },
          {
            value: "comfort_only",
            label: "I want comfort care only (no life-prolonging treatment)",
          },
          {
            value: "trial_period",
            label: "Try treatments for a limited trial period, then comfort care",
          },
        ],
      },
      {
        id: "terminalTrialPeriod",
        label: "If trial period, how long?",
        type: "select",
        options: [
          { value: "3_days", label: "3 days" },
          { value: "7_days", label: "7 days" },
          { value: "14_days", label: "14 days" },
          { value: "30_days", label: "30 days" },
          { value: "agent_decides", label: "Let my agent decide" },
        ],
        dependsOn: {
          field: "terminalConditionPreference",
          value: "trial_period",
        },
      },
      {
        id: "permanentUnconsciousPreference",
        label: "If I am PERMANENTLY UNCONSCIOUS:",
        type: "select",
        required: true,
        options: [
          {
            value: "all_measures",
            label: "I want all life-prolonging treatments",
          },
          {
            value: "comfort_only",
            label: "I want comfort care only (no life-prolonging treatment)",
          },
          {
            value: "trial_period",
            label: "Try treatments for a limited trial period, then comfort care",
          },
        ],
      },
      {
        id: "endStagePreference",
        label: "If I have an END-STAGE CONDITION:",
        type: "select",
        required: true,
        options: [
          {
            value: "all_measures",
            label: "I want all life-prolonging treatments",
          },
          {
            value: "comfort_only",
            label: "I want comfort care only (no life-prolonging treatment)",
          },
          {
            value: "trial_period",
            label: "Try treatments for a limited trial period, then comfort care",
          },
        ],
      },
    ],
  },
  {
    id: "specificTreatments",
    title: "Specific Treatment Decisions",
    description: "Your preferences for specific medical interventions",
    fields: [
      {
        id: "treatmentInfo",
        label: "",
        type: "info",
        helpText:
          "These decisions provide specific guidance to your healthcare providers. If you are unsure, you can choose to let your healthcare agent decide.",
      },
      {
        id: "cpr",
        label: "CPR (Cardiopulmonary Resuscitation)",
        type: "select",
        required: true,
        options: [
          { value: "yes", label: "Yes, attempt CPR" },
          { value: "no", label: "No, do not attempt CPR (DNR)" },
          { value: "agent", label: "Let my healthcare agent decide" },
        ],
        helpText:
          "CPR includes chest compressions, electric shock, and breathing tubes to restart heart/breathing",
      },
      {
        id: "ventilator",
        label: "Mechanical Ventilation (Breathing Machine)",
        type: "select",
        required: true,
        options: [
          { value: "yes", label: "Yes, I want mechanical ventilation" },
          { value: "no", label: "No, I do not want mechanical ventilation" },
          { value: "trial", label: "Try for limited time only" },
          { value: "agent", label: "Let my healthcare agent decide" },
        ],
      },
      {
        id: "ventilatorTrialPeriod",
        label: "Ventilator trial period",
        type: "select",
        options: [
          { value: "24_hours", label: "24 hours" },
          { value: "3_days", label: "3 days" },
          { value: "7_days", label: "7 days" },
          { value: "14_days", label: "14 days" },
        ],
        dependsOn: { field: "ventilator", value: "trial" },
      },
      {
        id: "feedingTube",
        label: "Artificial Nutrition and Hydration (Feeding Tube, IV Fluids)",
        type: "select",
        required: true,
        options: [
          { value: "yes", label: "Yes, I want artificial nutrition/hydration" },
          {
            value: "no",
            label: "No, I do not want artificial nutrition/hydration",
          },
          { value: "trial", label: "Try for limited time only" },
          { value: "hydration_only", label: "IV fluids only, no feeding tube" },
          { value: "agent", label: "Let my healthcare agent decide" },
        ],
      },
      {
        id: "dialysis",
        label: "Kidney Dialysis",
        type: "select",
        options: [
          { value: "yes", label: "Yes, I want dialysis" },
          { value: "no", label: "No, I do not want dialysis" },
          { value: "trial", label: "Try for limited time only" },
          { value: "agent", label: "Let my healthcare agent decide" },
        ],
      },
      {
        id: "bloodTransfusions",
        label: "Blood Transfusions",
        type: "select",
        options: [
          { value: "yes", label: "Yes, I want blood transfusions" },
          { value: "no", label: "No, I do not want blood transfusions" },
          { value: "agent", label: "Let my healthcare agent decide" },
        ],
      },
      {
        id: "antibiotics",
        label: "Antibiotics",
        type: "select",
        options: [
          {
            value: "yes",
            label: "Yes, I want antibiotics to treat infections",
          },
          {
            value: "comfort_only",
            label: "Only for comfort (pain/symptom relief)",
          },
          { value: "no", label: "No antibiotics" },
          { value: "agent", label: "Let my healthcare agent decide" },
        ],
      },
      {
        id: "surgery",
        label: "Surgery or Invasive Procedures",
        type: "select",
        options: [
          { value: "yes", label: "Yes, if medically indicated" },
          { value: "comfort_only", label: "Only for comfort purposes" },
          { value: "no", label: "No surgery or invasive procedures" },
          { value: "agent", label: "Let my healthcare agent decide" },
        ],
      },
    ],
  },
  {
    id: "comfort",
    title: "Comfort Care",
    description: "Pain management and quality of life",
    fields: [
      {
        id: "comfortInfo",
        label: "",
        type: "info",
        helpText:
          "Comfort care (palliative care) focuses on relieving pain and maintaining dignity. These measures are always provided regardless of other treatment decisions.",
      },
      {
        id: "painManagement",
        label: "Pain Management Preference",
        type: "select",
        required: true,
        options: [
          {
            value: "maximum",
            label: "Maximum pain relief, even if it may hasten death or affect consciousness",
          },
          {
            value: "balanced",
            label: "Balance pain relief with maintaining alertness",
          },
          {
            value: "minimal",
            label: "Minimal medication to stay as alert as possible",
          },
        ],
      },
      {
        id: "comfortMeasuresHeading",
        label: "Comfort measures I ALWAYS want (regardless of other decisions):",
        type: "info",
      },
      {
        id: "wantHygiene",
        label: "Keep me clean and comfortable",
        type: "checkbox",
      },
      {
        id: "wantMoisture",
        label: "Keep my mouth and lips moist",
        type: "checkbox",
      },
      {
        id: "wantPositioning",
        label: "Reposition me regularly to prevent bedsores",
        type: "checkbox",
      },
      {
        id: "wantCompany",
        label: "Have someone present with me (not left alone)",
        type: "checkbox",
      },
      {
        id: "wantMusic",
        label: "Play music or readings I enjoy",
        type: "checkbox",
      },
      {
        id: "wantNature",
        label: "Access to natural light and fresh air when possible",
        type: "checkbox",
      },
      {
        id: "wantPets",
        label: "Allow pet visits if possible",
        type: "checkbox",
      },
      {
        id: "additionalComfort",
        label: "Other comfort preferences",
        type: "textarea",
        placeholder: "e.g., specific music, photos, religious items, or other personal preferences",
      },
      {
        id: "hospicePreference",
        label: "Hospice Care Preference",
        type: "select",
        options: [
          { value: "yes", label: "Yes, I want hospice care when appropriate" },
          { value: "home", label: "Hospice at home if possible" },
          { value: "facility", label: "Hospice facility is acceptable" },
          { value: "agent", label: "Let my healthcare agent decide" },
        ],
        helpText: "Hospice provides comfort-focused care for terminal patients",
      },
    ],
  },
  {
    id: "spiritual",
    title: "Personal Values & Spiritual Care",
    description: "What matters most to you",
    fields: [
      {
        id: "valuesInfo",
        label: "",
        type: "info",
        helpText:
          "Sharing your values helps healthcare providers and your agent make decisions consistent with what matters most to you.",
      },
      {
        id: "qualityOfLife",
        label: "What does quality of life mean to you?",
        type: "textarea",
        placeholder:
          "e.g., Being able to communicate with family, recognizing loved ones, being free of severe pain, maintaining independence",
        helpText: "What conditions would make life not worth living for you?",
      },
      {
        id: "unacceptableConditions",
        label: "Conditions I would find unacceptable",
        type: "textarea",
        placeholder:
          "e.g., Permanent dependence on machines, inability to recognize family, severe dementia",
        helpText: "Be specific about what quality of life means to you",
      },
      {
        id: "religiousBeliefs",
        label: "Religious/Spiritual beliefs that should guide my care",
        type: "textarea",
        placeholder: "Any religious teachings or beliefs about end-of-life care",
      },
      {
        id: "wantClergyVisit",
        label: "I want clergy/spiritual advisor visits during serious illness",
        type: "checkbox",
      },
      {
        id: "clergyContact",
        label: "Clergy/Spiritual Advisor Contact Information",
        type: "text",
        dependsOn: { field: "wantClergyVisit", value: true },
      },
      {
        id: "wantReligiousRites",
        label: "I want religious rites/sacraments administered",
        type: "checkbox",
      },
      {
        id: "religiousRitesDetails",
        label: "Specific religious rites requested",
        type: "textarea",
        placeholder: "e.g., Last Rites, Anointing of the Sick, specific prayers",
        dependsOn: { field: "wantReligiousRites", value: true },
      },
      {
        id: "additionalValues",
        label: "Other values or wishes important to you",
        type: "textarea",
        placeholder: "Anything else your healthcare providers should know about your values",
      },
    ],
  },
  {
    id: "pregnancy",
    title: "Pregnancy Exception",
    description: "Applicability during pregnancy (if applicable)",
    fields: [
      {
        id: "pregnancyInfo",
        label: "",
        type: "info",
        helpText:
          "Some states require specific provisions about pregnancy. This section clarifies your wishes if you are pregnant when this directive would otherwise take effect.",
      },
      {
        id: "pregnancyProvision",
        label: "If I am pregnant:",
        type: "select",
        options: [
          {
            value: "suspend",
            label: "Suspend this directive during pregnancy",
          },
          {
            value: "apply",
            label: "This directive applies regardless of pregnancy",
          },
          { value: "viability", label: "Apply only if fetus is not viable" },
          { value: "not_applicable", label: "Not applicable to me" },
        ],
        helpText: "Note: State law may override this provision in some jurisdictions",
      },
    ],
  },
  {
    id: "final",
    title: "Final Arrangements",
    description: "Organ donation and disposition of remains",
    fields: [
      {
        id: "finalInfo",
        label: "",
        type: "info",
        helpText: "These decisions take effect after death and help your family know your wishes.",
      },
      {
        id: "organDonation",
        label: "Organ and Tissue Donation",
        type: "select",
        options: [
          {
            value: "yes_all",
            label: "Yes, donate any needed organs and tissues",
          },
          { value: "yes_organs", label: "Yes, but only organs (not tissues)" },
          {
            value: "yes_limited",
            label: "Yes, but only specific organs (specify below)",
          },
          { value: "research", label: "Yes, for transplant and/or research" },
          { value: "no", label: "No, I do not want to donate" },
          { value: "agent", label: "Let my healthcare agent decide" },
        ],
      },
      {
        id: "organLimitations",
        label: "If limited donation, specify which organs",
        type: "textarea",
        placeholder: "e.g., heart, kidneys, corneas only",
        dependsOn: { field: "organDonation", value: "yes_limited" },
      },
      {
        id: "autopsy",
        label: "Autopsy Preference",
        type: "select",
        options: [
          { value: "yes", label: "Yes, I consent to autopsy if requested" },
          { value: "no", label: "No, I do not want an autopsy" },
          { value: "required", label: "Only if legally required" },
          { value: "agent", label: "Let my agent decide" },
        ],
      },
      {
        id: "bodyDisposition",
        label: "Preferred Disposition of Remains",
        type: "select",
        options: [
          { value: "burial", label: "Traditional Burial" },
          { value: "cremation", label: "Cremation" },
          { value: "green_burial", label: "Green/Natural Burial" },
          { value: "donation", label: "Donate body to medical science" },
          { value: "other", label: "Other (specify below)" },
        ],
      },
      {
        id: "dispositionDetails",
        label: "Specific instructions for remains",
        type: "textarea",
        placeholder: "e.g., scatter ashes at..., burial at..., specific funeral home preferences",
      },
      {
        id: "funeralPreferences",
        label: "Funeral/Memorial Service Preferences",
        type: "textarea",
        placeholder: "e.g., type of service, location, specific wishes, or 'no service'",
      },
    ],
  },
];

// Trust steps (comprehensive)
const TRUST_STEPS: WizardStep[] = [
  {
    id: "personal",
    title: "Grantor Information",
    description: "Information about you as the trust creator",
    fields: [
      {
        id: "grantor",
        label: "Your Information (Grantor/Settlor)",
        type: "person",
        required: true,
        helpText: "Pre-filled from your profile. Edit if needed.",
        personConfig: {
          autoSelectCurrentUser: true,
        },
      },
      {
        id: "county",
        label: "County of Residence",
        type: "text",
        required: true,
      },
      {
        id: "maritalStatus",
        label: "Marital Status",
        type: "select",
        required: true,
        options: [
          { value: "single", label: "Single" },
          { value: "married", label: "Married" },
          { value: "divorced", label: "Divorced" },
          { value: "widowed", label: "Widowed" },
          { value: "domestic_partnership", label: "Domestic Partnership" },
        ],
      },
      {
        id: "spouse",
        label: "Spouse/Partner",
        type: "person",
        dependsOn: { field: "maritalStatus", value: "married" },
        personConfig: {
          filterRelationships: ["spouse", "partner"],
          autoSelectRelationship: "spouse",
        },
      },
      {
        id: "jointTrust",
        label: "Create as joint trust with spouse",
        type: "checkbox",
        helpText: "Joint trusts are common for married couples to manage community property",
        dependsOn: { field: "maritalStatus", value: "married" },
      },
      {
        id: "trustName",
        label: "Trust Name",
        type: "text",
        placeholder: "e.g., The Smith Family Revocable Living Trust",
        required: true,
        helpText: "Choose a distinctive name for your trust",
      },
    ],
  },
  {
    id: "trustees",
    title: "Trustees",
    description: "Who will manage the trust",
    fields: [
      {
        id: "trusteeInfo",
        label: "",
        type: "info",
        helpText:
          "As a revocable living trust, you typically serve as the initial trustee, maintaining full control of your assets. Successor trustees take over if you become incapacitated or pass away. Choose someone trustworthy with good financial judgment.",
      },
      {
        id: "initialTrustee",
        label: "Initial Trustee",
        type: "person",
        helpText: "Most people name themselves as initial trustee",
        personConfig: {
          autoSelectCurrentUser: true,
        },
      },
      {
        id: "coTrustee",
        label: "Co-Trustee (if any)",
        type: "person",
        helpText: "Often a spouse for joint trusts",
        personConfig: {
          filterRelationships: ["spouse", "partner"],
          autoSelectRelationship: "spouse",
        },
      },
      {
        id: "successorTrustee",
        label: "First Successor Trustee",
        type: "person",
        required: true,
        helpText: "Who takes over when you can no longer serve. Must be 18 or older.",
        personConfig: {
          excludeMinors: true,
        },
      },
      {
        id: "secondSuccessorTrustee",
        label: "Second Successor Trustee",
        type: "person",
        helpText: "Backup if first successor cannot serve",
        personConfig: {
          excludeMinors: true,
        },
      },
      {
        id: "professionalTrustee",
        label:
          "Allow appointment of professional/corporate trustee if no named successor available",
        type: "checkbox",
        helpText: "Banks and trust companies can serve as trustee for a fee",
      },
      {
        id: "trusteeBondWaiver",
        label: "Waive bond requirement for trustees",
        type: "checkbox",
        helpText: "Waiving bond saves money. Recommended for trusted family members.",
      },
      {
        id: "trusteeCompensation",
        label: "Trustee Compensation",
        type: "select",
        options: [
          { value: "none", label: "No compensation (family trustee)" },
          { value: "reasonable", label: "Reasonable compensation" },
          { value: "statutory", label: "Statutory rate" },
          { value: "professional", label: "Professional trustee rates" },
        ],
      },
    ],
  },
  {
    id: "incapacity",
    title: "Incapacity Provisions",
    description: "Management during your incapacity",
    fields: [
      {
        id: "incapacityInfo",
        label: "",
        type: "info",
        helpText:
          "One major benefit of a revocable living trust is avoiding court-supervised conservatorship if you become incapacitated. These provisions guide your successor trustee.",
      },
      {
        id: "incapacityDetermination",
        label: "How should incapacity be determined?",
        type: "select",
        required: true,
        options: [
          {
            value: "one_physician",
            label: "One licensed physician certifies incapacity",
          },
          {
            value: "two_physicians",
            label: "Two licensed physicians certify incapacity",
          },
          {
            value: "physician_and_person",
            label: "Physician and named person agree",
          },
        ],
      },
      {
        id: "incapacityConsultPerson",
        label: "Named person to consult (if selected above)",
        type: "text",
        dependsOn: {
          field: "incapacityDetermination",
          value: "physician_and_person",
        },
      },
      {
        id: "incapacityStandard",
        label: "Standard of care during incapacity",
        type: "select",
        options: [
          {
            value: "accustomed",
            label: "Maintain my accustomed standard of living",
          },
          { value: "comfortable", label: "Provide for my comfortable care" },
          {
            value: "necessary",
            label: "Provide only necessary care (preserve assets)",
          },
        ],
      },
      {
        id: "incapacityInstructions",
        label: "Special instructions for care during incapacity",
        type: "textarea",
        placeholder: "e.g., Keep me in my home as long as possible, specific care preferences",
      },
      {
        id: "supportDependents",
        label: "Continue supporting dependents during my incapacity",
        type: "checkbox",
        helpText: "Allows trustee to continue support payments to spouse, children, etc.",
      },
      {
        id: "dependentsToSupport",
        label: "Dependents to support (names and amounts)",
        type: "textarea",
        placeholder: "e.g., Spouse - maintain current lifestyle\nChild - college expenses",
        dependsOn: { field: "supportDependents", value: true },
      },
    ],
  },
  {
    id: "beneficiaries",
    title: "Beneficiaries",
    description: "Who will receive trust assets upon your death",
    fields: [
      {
        id: "beneficiaryInfo",
        label: "",
        type: "info",
        helpText:
          "List who should receive trust assets after your death. You can specify percentages, specific assets, or both. 'Per stirpes' means a deceased beneficiary's share passes to their descendants.",
      },
      {
        id: "primaryBeneficiary",
        label: "Primary Beneficiary",
        type: "person",
        required: true,
        personConfig: {},
      },
      {
        id: "primaryPercentage",
        label: "Percentage of Trust",
        type: "number",
        placeholder: "100",
      },
      {
        id: "additionalBeneficiaries",
        label: "Additional Beneficiaries",
        type: "beneficiaryList",
        helpText: "Add beneficiaries from your family or contacts, or enter names manually",
      },
      {
        id: "specificBequests",
        label: "Specific Distributions (particular assets to particular people)",
        type: "textarea",
        placeholder: "e.g., Family home to my daughter Jane\nStock portfolio to my son John",
      },
      {
        id: "contingentBeneficiary",
        label: "Final Contingent Beneficiary",
        type: "person",
        helpText:
          "Who receives assets if all primary beneficiaries predecease you? Consider naming a charity.",
        personConfig: {},
      },
      {
        id: "perStirpes",
        label: "Distribute per stirpes (to descendants if beneficiary predeceases)",
        type: "checkbox",
        helpText: "If checked, a deceased beneficiary's share passes to their children",
      },
      {
        id: "survivalPeriod",
        label: "Survival Period Requirement",
        type: "select",
        options: [
          { value: "30", label: "30 days (recommended)" },
          { value: "60", label: "60 days" },
          { value: "90", label: "90 days" },
          { value: "0", label: "No survival period" },
        ],
        helpText: "Beneficiaries must survive you by this period to inherit",
      },
    ],
  },
  {
    id: "assets",
    title: "Trust Assets",
    description: "What will be held in the trust",
    fields: [
      {
        id: "assetsInfo",
        label: "",
        type: "info",
        helpText:
          "List the major assets you plan to transfer to the trust. IMPORTANT: After signing, you must re-title these assets in the trust's name (e.g., 'John Smith, Trustee of the Smith Family Trust dated [date]') for the trust to be effective.",
      },
      {
        id: "existingAssetsDisplay",
        label: "Your Recorded Assets in Pathible",
        type: "existingAssets",
        helpText:
          "These are assets you've already recorded in Pathible. Review them and use the fields below to add any additional assets or specify which ones to include in the trust.",
      },
      {
        id: "realEstate",
        label: "Real Estate (property addresses)",
        type: "textarea",
        placeholder: "123 Main Street, City, State 12345\n456 Oak Avenue, City, State 67890",
        helpText: "Include full addresses. Each property needs a new deed.",
      },
      {
        id: "bankAccounts",
        label: "Bank Accounts",
        type: "textarea",
        placeholder: "First National Bank - Checking\nCredit Union - Savings",
        helpText: "List bank name and account type (not account numbers)",
      },
      {
        id: "investments",
        label: "Investment and Brokerage Accounts",
        type: "textarea",
        placeholder: "Fidelity - Brokerage\nVanguard - IRA",
        helpText: "Note: Retirement accounts (IRA, 401k) are typically NOT transferred to trust",
      },
      {
        id: "businessInterests",
        label: "Business Interests",
        type: "textarea",
        placeholder: "50% membership interest in Smith LLC",
      },
      {
        id: "vehicles",
        label: "Vehicles (if transferring to trust)",
        type: "textarea",
        placeholder: "2020 Honda Accord VIN: xxxxx",
        helpText: "Some people prefer to keep vehicles out of trust for simplicity",
      },
      {
        id: "otherAssets",
        label: "Other Significant Assets",
        type: "textarea",
        placeholder: "Valuable collections, intellectual property, etc.",
      },
      {
        id: "excludedAssets",
        label: "Assets intentionally NOT included in trust",
        type: "textarea",
        placeholder:
          "e.g., Retirement accounts (beneficiary designation), Life insurance (beneficiary designation)",
        helpText: "Document what is NOT in the trust and why",
      },
    ],
  },
  {
    id: "distribution",
    title: "Distribution Provisions",
    description: "When and how beneficiaries receive their inheritance",
    fields: [
      {
        id: "distributionInfo",
        label: "",
        type: "info",
        helpText:
          "You can control when and how beneficiaries receive their inheritance. This is especially useful for young beneficiaries or those who may not handle a lump sum wisely.",
      },
      {
        id: "distributionTiming",
        label: "When should beneficiaries receive their inheritance?",
        type: "select",
        required: true,
        options: [
          { value: "immediate", label: "Immediately upon my death" },
          { value: "age_21", label: "When beneficiary reaches age 21" },
          { value: "age_25", label: "When beneficiary reaches age 25" },
          { value: "age_30", label: "When beneficiary reaches age 30" },
          { value: "age_35", label: "When beneficiary reaches age 35" },
          { value: "staged", label: "Staged distribution (specify below)" },
        ],
      },
      {
        id: "stagedDetails",
        label: "Staged distribution details",
        type: "textarea",
        placeholder: "e.g., 1/3 at age 25, 1/3 at age 30, remainder at age 35",
        dependsOn: { field: "distributionTiming", value: "staged" },
      },
      {
        id: "discretionaryDistributions",
        label: "Allow discretionary distributions before full distribution age",
        type: "checkbox",
        helpText:
          "Trustee can make distributions for health, education, maintenance, and support (HEMS standard)",
      },
      {
        id: "educationPriority",
        label: "Prioritize education expenses",
        type: "checkbox",
        helpText: "Direct trustee to pay for college and graduate school",
      },
      {
        id: "firstHomePurchase",
        label: "Allow distribution for first home purchase",
        type: "checkbox",
        helpText: "Beneficiary can receive early distribution for down payment on first home",
      },
      {
        id: "businessStartup",
        label: "Allow distribution for business startup",
        type: "checkbox",
        helpText: "Trustee can distribute funds for beneficiary to start a business",
      },
    ],
  },
  {
    id: "protections",
    title: "Trust Protections",
    description: "Protecting trust assets",
    fields: [
      {
        id: "protectionsInfo",
        label: "",
        type: "info",
        helpText:
          "These provisions help protect trust assets from creditors, divorcing spouses, and poor financial decisions by beneficiaries.",
      },
      {
        id: "spendthriftClause",
        label: "Include spendthrift clause",
        type: "checkbox",
        helpText: "Protects trust assets from beneficiaries' creditors. Highly recommended.",
      },
      {
        id: "divorceProtection",
        label: "Include divorce protection language",
        type: "checkbox",
        helpText:
          "Helps keep inherited assets separate from marital property if beneficiary divorces",
      },
      {
        id: "noContestClause",
        label: "Include no-contest clause",
        type: "checkbox",
        helpText:
          "Disinherits any beneficiary who contests the trust. Enforcement varies by state.",
      },
      {
        id: "specialNeedsProvisions",
        label: "Include special needs provisions for any beneficiary",
        type: "checkbox",
        helpText: "Preserves government benefits eligibility for disabled beneficiaries",
      },
      {
        id: "specialNeedsBeneficiary",
        label: "Name of special needs beneficiary",
        type: "text",
        dependsOn: { field: "specialNeedsProvisions", value: true },
      },
    ],
  },
  {
    id: "provisions",
    title: "Additional Provisions",
    description: "Other trust terms",
    fields: [
      {
        id: "amendmentRevocation",
        label: "",
        type: "info",
        helpText:
          "As a revocable living trust, you retain the right to amend or revoke this trust at any time during your lifetime while you have capacity.",
      },
      {
        id: "perpetuitiesSavings",
        label: "Include Rule Against Perpetuities savings clause",
        type: "checkbox",
        helpText: "Technical provision that ensures trust validity. Recommended.",
      },
      {
        id: "taxElections",
        label: "Grant trustee authority to make tax elections",
        type: "checkbox",
        helpText: "Allows trustee to make decisions about estate and income taxes",
      },
      {
        id: "digitalAssets",
        label: "Grant trustee access to digital assets",
        type: "checkbox",
        helpText: "Per RUFADAA, allows trustee to access online accounts, email, social media",
      },
      {
        id: "specialInstructions",
        label: "Other Special Instructions",
        type: "textarea",
        placeholder: "Any other provisions you want included",
      },
      {
        id: "letterOfWishes",
        label: "I will provide a separate Letter of Wishes",
        type: "checkbox",
        helpText: "A non-binding letter providing guidance to trustees about your intentions",
      },
    ],
  },
];

// Pour-over will steps
const POUR_OVER_WILL_STEPS: WizardStep[] = [
  {
    id: "personal",
    title: "Personal Information",
    description: "Your basic information",
    fields: [
      {
        id: "testator",
        label: "Your Information",
        type: "person",
        required: true,
        helpText: "Pre-filled from your profile. Edit if needed.",
        personConfig: {
          autoSelectCurrentUser: true,
        },
      },
      {
        id: "county",
        label: "County of Residence",
        type: "text",
        required: true,
      },
      {
        id: "maritalStatus",
        label: "Marital Status",
        type: "select",
        required: true,
        options: [
          { value: "single", label: "Single" },
          { value: "married", label: "Married" },
          { value: "divorced", label: "Divorced" },
          { value: "widowed", label: "Widowed" },
          { value: "domestic_partnership", label: "Domestic Partnership" },
        ],
      },
      {
        id: "spouse",
        label: "Spouse/Partner",
        type: "person",
        dependsOn: { field: "maritalStatus", value: "married" },
        personConfig: {
          filterRelationships: ["spouse", "partner"],
          autoSelectRelationship: "spouse",
        },
      },
    ],
  },
  {
    id: "trust",
    title: "Trust Information",
    description: "The trust that will receive assets",
    fields: [
      {
        id: "pourOverInfo",
        label: "",
        type: "info",
        helpText:
          "A pour-over will works with your revocable living trust. Any assets not titled in the trust at your death are 'poured over' into it and distributed according to the trust terms. This ensures all assets follow your trust's distribution plan.",
      },
      {
        id: "trustName",
        label: "Exact Name of Your Trust",
        type: "text",
        required: true,
        placeholder: "e.g., The John Smith Family Revocable Living Trust",
        helpText: "Must match the trust name exactly as written in your trust document",
      },
      {
        id: "trustDate",
        label: "Date Trust Was Created",
        type: "date",
        required: true,
        helpText: "The date shown on your original trust document",
      },
      {
        id: "trustAmended",
        label: "Trust has been amended",
        type: "checkbox",
      },
      {
        id: "lastAmendmentDate",
        label: "Date of Most Recent Amendment",
        type: "date",
        dependsOn: { field: "trustAmended", value: true },
      },
      {
        id: "pourOverFailsafe",
        label: "",
        type: "info",
        helpText:
          "If the pour-over fails for any reason, assets will be distributed as if the pour-over had been valid, following the trust's distribution provisions.",
      },
    ],
  },
  {
    id: "executor",
    title: "Executor",
    description: "Who will manage your probate estate",
    fields: [
      {
        id: "executorInfo",
        label: "",
        type: "info",
        helpText:
          "Your executor handles the probate process and transfers assets to the trust. This is often the same person as your successor trustee, but doesn't have to be.",
      },
      {
        id: "executor",
        label: "Primary Executor",
        type: "person",
        required: true,
        helpText: "Must be 18 or older",
        personConfig: {
          excludeMinors: true,
        },
      },
      {
        id: "alternateExecutor",
        label: "Alternate Executor",
        type: "person",
        helpText: "Who should serve if primary executor cannot or will not serve",
        personConfig: {
          excludeMinors: true,
        },
      },
      {
        id: "bondWaiver",
        label: "Waive executor bond requirement",
        type: "checkbox",
        helpText: "Waiving bond saves money. Recommended for trusted family members.",
      },
      {
        id: "executorCompensation",
        label: "Executor Compensation",
        type: "select",
        options: [
          { value: "statutory", label: "Statutory rate (state-determined)" },
          { value: "reasonable", label: "Reasonable compensation" },
          { value: "none", label: "No compensation (family member)" },
        ],
      },
    ],
  },
  {
    id: "taxes",
    title: "Taxes and Expenses",
    description: "How debts and taxes should be paid",
    fields: [
      {
        id: "taxesInfo",
        label: "",
        type: "info",
        helpText:
          "You can specify how estate taxes and administration expenses should be paid. This coordinates with your trust provisions.",
      },
      {
        id: "taxPaymentSource",
        label: "Source for Estate Taxes and Expenses",
        type: "select",
        required: true,
        options: [
          {
            value: "residuary_to_trust",
            label: "From residuary estate passing to trust (recommended)",
          },
          { value: "trust_assets", label: "From trust assets" },
          { value: "apportioned", label: "Apportioned among beneficiaries" },
        ],
        helpText:
          "Most pour-over wills direct taxes to be paid from the residuary estate before it passes to the trust",
      },
      {
        id: "debtsPayment",
        label: "Pay legally enforceable debts from estate",
        type: "checkbox",
        helpText: "Standard provision - executor pays debts before distribution",
      },
      {
        id: "funeralExpenses",
        label: "Pay funeral and burial expenses from estate",
        type: "checkbox",
      },
      {
        id: "specificDebtInstructions",
        label: "Special Instructions for Debts",
        type: "textarea",
        placeholder: "e.g., Pay mortgage on family home, specific debts to pay or not pay",
      },
    ],
  },
  {
    id: "guardians",
    title: "Guardians for Minor Children",
    description: "Care for minor children (if applicable)",
    fields: [
      {
        id: "guardianInfo",
        label: "",
        type: "info",
        helpText:
          "Guardian nominations are made in your will, not in your trust. This is one of the key reasons to have a pour-over will even when you have a trust.",
      },
      {
        id: "hasMinorChildren",
        label: "I have minor children (under 18)",
        type: "checkbox",
      },
      {
        id: "guardian",
        label: "Guardian for Minor Children",
        type: "person",
        dependsOn: { field: "hasMinorChildren", value: true },
        helpText: "Must be 18 or older",
        personConfig: {
          excludeMinors: true,
        },
      },
      {
        id: "alternateGuardian",
        label: "Alternate Guardian",
        type: "person",
        dependsOn: { field: "hasMinorChildren", value: true },
        personConfig: {
          excludeMinors: true,
        },
      },
      {
        id: "childrenNames",
        label: "Names of Minor Children (one per line with birth dates)",
        type: "textarea",
        placeholder: "John Smith Jr. - DOB: January 15, 2015\nJane Smith - DOB: March 22, 2018",
        dependsOn: { field: "hasMinorChildren", value: true },
        helpText:
          "Your minor children from your family profile will be used. Add additional details here if needed.",
      },
      {
        id: "guardianBondWaiver",
        label: "Waive bond requirement for guardian",
        type: "checkbox",
        dependsOn: { field: "hasMinorChildren", value: true },
      },
    ],
  },
  {
    id: "provisions",
    title: "Additional Provisions",
    description: "Other will provisions",
    fields: [
      {
        id: "provisionsInfo",
        label: "",
        type: "info",
        helpText: "These provisions apply to the probate estate before it transfers to the trust.",
      },
      {
        id: "noContestClause",
        label: "Include no-contest clause",
        type: "checkbox",
        helpText: "Disinherits anyone who contests this will or the trust",
      },
      {
        id: "simultaneousDeathClause",
        label: "Include simultaneous death clause",
        type: "checkbox",
        helpText: "Standard provision for if you and a beneficiary die at the same time",
      },
      {
        id: "digitalAssets",
        label: "Grant executor access to digital assets",
        type: "checkbox",
        helpText: "Per RUFADAA, allows executor to access online accounts during probate",
      },
      {
        id: "specificBequests",
        label: "Specific Bequests (items NOT going to trust)",
        type: "textarea",
        placeholder: "e.g., My grandmother's ring to my daughter Jane",
        helpText:
          "List any specific items you want to give directly to individuals, bypassing the trust",
      },
      {
        id: "tangiblePersonalProperty",
        label: "I will provide a separate list for tangible personal property",
        type: "checkbox",
        helpText:
          "Many states allow a separate written list for distributing personal items (jewelry, furniture, etc.)",
      },
      {
        id: "specialInstructions",
        label: "Other Special Instructions",
        type: "textarea",
        placeholder: "Any other provisions for your pour-over will",
      },
    ],
  },
];

// Get steps for document type
function getStepsForDocumentType(docType: DocumentType): WizardStep[] {
  switch (docType) {
    case "will":
      return WILL_STEPS;
    case "trust":
      return TRUST_STEPS;
    case "pour_over_will":
      return POUR_OVER_WILL_STEPS;
    case "financial_poa":
      return FINANCIAL_POA_STEPS;
    case "healthcare_poa":
      return HEALTHCARE_POA_STEPS;
    case "advance_directive":
      return ADVANCE_DIRECTIVE_STEPS;
    default:
      return WILL_STEPS;
  }
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

  // Get steps based on document type
  const steps = document ? getStepsForDocumentType(document.documentType as DocumentType) : [];
  const currentStepData = steps[currentStep];
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  // Initialize from existing responses, with familyMember and household defaults
  useEffect(() => {
    if (document && household && !hasInitialized) {
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
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-5 w-5" />
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

      {/* State Requirements Info - Full width, under disclosure */}
      {document && currentStep === 0 && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
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
    </div>
  );
}
