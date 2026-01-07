"use client";

import type { BeneficiaryEntry } from "@/components/beneficiary-list";
import type { PersonReference } from "@/lib/person-utils";
import { STATE_NAMES, type USState } from "@/lib/state-legal-requirements";
import { cn } from "@/lib/utils";

type DocumentType =
  | "will"
  | "trust"
  | "pour_over_will"
  | "financial_poa"
  | "healthcare_poa"
  | "advance_directive";

interface DocumentPreviewProps {
  documentType: DocumentType;
  state: string;
  responses: Record<string, string | boolean | PersonReference | BeneficiaryEntry[] | null>;
  currentStepId: string;
  className?: string;
}

// Helper to get person name from response - handles both PersonReference objects and string fields
function getPersonName(
  responses: Record<string, string | boolean | PersonReference | BeneficiaryEntry[] | null>,
  personKey: string,
  stringKey?: string,
  placeholder = "[NOT SPECIFIED]",
): string {
  // First try the PersonReference object
  const personValue = responses[personKey];
  if (
    personValue &&
    typeof personValue === "object" &&
    !Array.isArray(personValue) &&
    "fullName" in personValue
  ) {
    return personValue.fullName || placeholder;
  }

  // Fall back to string field (for PDF compatibility)
  if (stringKey) {
    const stringValue = responses[stringKey];
    if (typeof stringValue === "string" && stringValue) {
      return stringValue;
    }
  }

  // Final fallback
  if (typeof personValue === "string" && personValue) {
    return personValue;
  }

  return placeholder;
}

// Helper to get person address - handles both PersonReference objects and string fields
function getPersonAddress(
  responses: Record<string, string | boolean | PersonReference | BeneficiaryEntry[] | null>,
  personKey: string,
  stringKey?: string,
): string {
  // First try the PersonReference object
  const personValue = responses[personKey];
  if (
    personValue &&
    typeof personValue === "object" &&
    !Array.isArray(personValue) &&
    "address" in personValue
  ) {
    const person = personValue as PersonReference;
    const parts = [person.address, person.city, person.state].filter(Boolean);
    if (parts.length > 0) return parts.join(", ");
  }

  // Fall back to string field
  if (stringKey) {
    const stringValue = responses[stringKey];
    if (typeof stringValue === "string" && stringValue) {
      return stringValue;
    }
  }

  return "";
}

// Helper to get person relationship
function getPersonRelationship(
  responses: Record<string, string | boolean | PersonReference | BeneficiaryEntry[] | null>,
  personKey: string,
  stringKey?: string,
): string {
  // First try the PersonReference object
  const personValue = responses[personKey];
  if (
    personValue &&
    typeof personValue === "object" &&
    !Array.isArray(personValue) &&
    "relationship" in personValue
  ) {
    return (personValue as PersonReference).relationship || "";
  }

  // Fall back to string field
  if (stringKey) {
    const stringValue = responses[stringKey];
    if (typeof stringValue === "string") {
      return stringValue;
    }
  }

  return "";
}

// Helper to format beneficiary list
function formatBeneficiaries(
  value: string | boolean | PersonReference | BeneficiaryEntry[] | null | undefined,
): { name: string; percentage: number; relationship?: string }[] {
  if (!value || !Array.isArray(value)) return [];
  return value
    .filter((b) => b.person?.fullName)
    .map((b) => ({
      name: b.person?.fullName || "",
      percentage: b.percentage || 0,
      relationship: b.person?.relationship,
    }));
}

// Section wrapper with highlight capability
function Section({
  id,
  title,
  currentStepId,
  highlightSteps,
  children,
}: {
  id: string;
  title: string;
  currentStepId: string;
  highlightSteps: string[];
  children: React.ReactNode;
}) {
  const isHighlighted = highlightSteps.includes(currentStepId);

  return (
    <div
      id={`preview-${id}`}
      className={cn(
        "mb-6 p-4 rounded-lg transition-all duration-300",
        isHighlighted
          ? "bg-primary/10 border-2 border-primary ring-2 ring-primary/20"
          : "bg-background border border-border",
      )}
    >
      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-2">
        {title}
      </h3>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

// Will Preview Component - matches PDF exactly
function WillPreview({
  responses,
  state,
  currentStepId,
}: Omit<DocumentPreviewProps, "documentType" | "className">) {
  const r = responses;
  const stateName = STATE_NAMES[state as USState] || state;

  // Get person names - supporting both PersonReference objects and legacy string fields
  const testatorName = getPersonName(r, "testator", "fullName", "[YOUR FULL LEGAL NAME]");
  const testatorAddress = getPersonAddress(r, "testator", "address");
  const spouseName = getPersonName(r, "spouse", "spouseName", "[SPOUSE NAME]");
  const executorName = getPersonName(r, "executor", "executorName", "[EXECUTOR NAME]");
  const executorRelationship = getPersonRelationship(r, "executor", "executorRelationship");
  const alternateExecutorName = getPersonName(
    r,
    "alternateExecutor",
    "alternateExecutorName",
    "[ALTERNATE EXECUTOR]",
  );
  const alternateExecutorRelationship = getPersonRelationship(
    r,
    "alternateExecutor",
    "alternateExecutorRelationship",
  );
  const primaryBeneficiary = getPersonName(
    r,
    "residuaryBeneficiary",
    "residuaryBeneficiary",
    "[PRIMARY BENEFICIARY]",
  );
  const primaryBeneficiaryRelationship = getPersonRelationship(
    r,
    "residuaryBeneficiary",
    "residuaryRelationship",
  );
  const additionalBeneficiaries = formatBeneficiaries(r.additionalBeneficiaries);
  const contingentBeneficiary = getPersonName(
    r,
    "contingentBeneficiary",
    "contingentBeneficiary",
    "[CONTINGENT BENEFICIARY]",
  );
  const guardianName = getPersonName(r, "guardian", "guardianName", "[GUARDIAN NAME]");
  const guardianRelationship = getPersonRelationship(r, "guardian", "guardianRelationship");
  const alternateGuardianName = getPersonName(
    r,
    "alternateGuardian",
    "alternateGuardianName",
    "[ALTERNATE GUARDIAN]",
  );

  const survivalPeriod = (r.survivalPeriod as string) || "30";
  const county = (r.county as string) || "_________________";

  return (
    <div className="space-y-4">
      {/* Header - matches PDF exactly */}
      <div className="text-center border-b pb-4 mb-6">
        <h1 className="text-xl font-bold tracking-wide">LAST WILL AND TESTAMENT</h1>
        <p className="text-lg">of {testatorName}</p>
        <p className="text-sm text-muted-foreground">State of {stateName}</p>
      </div>

      {/* Preamble and Declaration - matches PDF exactly */}
      <Section
        id="preamble"
        title="Declaration"
        currentStepId={currentStepId}
        highlightSteps={["personal"]}
      >
        <p>
          I, <strong>{testatorName}</strong>, a resident of{" "}
          <strong>{testatorAddress || "[YOUR ADDRESS]"}</strong>, County of{" "}
          <strong>{county}</strong>, State of {stateName}, being of the age of majority in this
          state, of sound mind and memory, and not acting under duress, menace, fraud, or the undue
          influence of any person, do hereby make, publish, and declare this instrument to be my
          Last Will and Testament, hereby expressly revoking all wills and codicils heretofore made
          by me.
        </p>
      </Section>

      {/* Article: Family Status - matches PDF exactly */}
      <Section
        id="family"
        title="Article 1 - Family Status"
        currentStepId={currentStepId}
        highlightSteps={["personal", "guardianship"]}
      >
        <p>
          I declare that my marital status is:{" "}
          <strong>
            {r.maritalStatus === "married"
              ? `married to ${spouseName}`
              : r.maritalStatus === "single"
                ? "single and have never been married"
                : r.maritalStatus === "divorced"
                  ? "divorced"
                  : r.maritalStatus === "widowed"
                    ? "widowed"
                    : r.maritalStatus === "domestic_partnership"
                      ? `in a domestic partnership with ${spouseName}`
                      : "[MARITAL STATUS]"}
          </strong>
          .
        </p>
        {r.hasMinorChildren ? (
          <p className="mt-2">
            I declare that I have the following minor children:{" "}
            <strong>{(r.childrenNames as string) || "[CHILDREN]"}</strong>. I have no other
            children, living or deceased.
          </p>
        ) : (
          <p className="mt-2">I declare that I have no minor children.</p>
        )}
      </Section>

      {/* Article: Payment of Debts - matches PDF exactly */}
      <Section
        id="debts"
        title="Article 2 - Payment of Debts, Expenses, and Taxes"
        currentStepId={currentStepId}
        highlightSteps={["executor"]}
      >
        <p>
          I direct my Executor to pay from my residuary estate all my legally enforceable debts,
          reasonable funeral expenses, costs of administration, and all estate, inheritance, and
          succession taxes (including any interest and penalties thereon) that may be assessed
          against my estate or any beneficiary thereof by reason of my death. My Executor shall have
          sole discretion to determine which debts are legally enforceable. It is my intention that
          all such taxes be paid from my residuary estate as an expense of administration, without
          apportionment or reimbursement from any beneficiary.
        </p>
      </Section>

      {/* Article: Executor - matches PDF exactly */}
      <Section
        id="executor"
        title="Article 3 - Appointment of Executor"
        currentStepId={currentStepId}
        highlightSteps={["executor"]}
      >
        <p>
          I appoint <strong>{executorName}</strong>
          {executorRelationship && ` (${executorRelationship})`} as the Executor of this Will.
        </p>
        <p className="mt-2">
          If {executorName} is unable or unwilling to serve, or ceases to serve for any reason, I
          appoint <strong>{alternateExecutorName}</strong>
          {alternateExecutorRelationship && ` (${alternateExecutorRelationship})`} as successor
          Executor.
        </p>
      </Section>

      {/* Article: Executor Powers - matches PDF exactly */}
      <Section
        id="executorPowers"
        title="Article 4 - Executor Powers"
        currentStepId={currentStepId}
        highlightSteps={["executor"]}
      >
        <p>
          I grant to my Executor, and any successor Executor, without the necessity of court
          approval, the following powers to be exercised in the Executor's sole discretion:
        </p>
        <ul className="list-none ml-4 mt-2 space-y-1 text-sm">
          <li>
            (a) To retain any property received from my estate for such time as my Executor deems
            advisable;
          </li>
          <li>
            (b) To sell, lease, exchange, or otherwise dispose of any property, real or personal, at
            public or private sale;
          </li>
          <li>
            (c) To invest and reinvest estate funds in any form of property my Executor deems
            advisable;
          </li>
          <li>
            (d) To borrow money for any estate purpose and to pledge estate property as security;
          </li>
          <li>(e) To compromise, settle, or abandon any claims by or against my estate;</li>
          <li>
            (f) To employ attorneys, accountants, investment advisors, and other professionals;
          </li>
          <li>(g) To make distributions in cash or in kind, or partly in each;</li>
          <li>
            (h) To exercise all rights with respect to digital assets as permitted by applicable
            law;
          </li>
          <li>(i) To perform all other acts necessary for proper administration of my estate.</li>
        </ul>
        {r.waiveExecutorBond !== false ? (
          <p className="mt-2">
            I expressly waive the requirement for any bond or surety for my Executor and any
            successor Executor.
          </p>
        ) : (
          <p className="mt-2">
            My Executor and any successor Executor shall be required to furnish bond as provided by
            law.
          </p>
        )}
      </Section>

      {/* Article: Residuary Estate - matches PDF exactly */}
      <Section
        id="beneficiaries"
        title="Article 5 - Residuary Estate"
        currentStepId={currentStepId}
        highlightSteps={["beneficiaries"]}
      >
        <p>
          I give, devise, and bequeath all the rest, residue, and remainder of my estate, both real
          and personal, of whatever kind and wherever situated, which I may own or be entitled to at
          the time of my death (hereinafter "Residuary Estate"), including all lapsed legacies and
          devises, as follows:
        </p>
        <ul className="list-none ml-4 mt-2 space-y-2 text-sm">
          <li>
            <strong>(a) PRIMARY DISTRIBUTION:</strong> To {primaryBeneficiary}
            {primaryBeneficiaryRelationship && ` (${primaryBeneficiaryRelationship})`}
            {r.residuaryPercentage ? `, ${r.residuaryPercentage}%` : ", 100%"} of my Residuary
            Estate, if they survive me by {survivalPeriod} days.
          </li>
          {additionalBeneficiaries.length > 0 && (
            <li>
              <strong>Additional Beneficiaries:</strong>
              <ul className="list-disc ml-6 mt-1">
                {additionalBeneficiaries.map((b) => (
                  <li key={`${b.name}-${b.percentage}`}>
                    {b.name}
                    {b.relationship && ` (${b.relationship})`}
                    {b.percentage > 0 && ` - ${b.percentage}%`}
                  </li>
                ))}
              </ul>
            </li>
          )}
          <li>
            <strong>(b) FIRST CONTINGENT:</strong> If the primary beneficiary does not survive me by{" "}
            {survivalPeriod} days,{" "}
            {r.residuaryContingent === "descendants_per_stirpes"
              ? "I give my Residuary Estate to my descendants then living, per stirpes."
              : r.residuaryContingent === "specific_person"
                ? `I give my Residuary Estate to ${contingentBeneficiary}.`
                : "I give my Residuary Estate to my descendants then living, per stirpes."}
          </li>
          <li>
            <strong>(c) SECOND CONTINGENT:</strong> If the primary beneficiary and first contingent
            beneficiaries do not survive me, I give my Residuary Estate to{" "}
            {(r.secondContingentBeneficiary as string) ||
              contingentBeneficiary ||
              "[SECOND CONTINGENT]"}
            .
          </li>
          <li>
            <strong>(d) FINAL CONTINGENT:</strong> If none of the beneficiaries named above survive
            me by {survivalPeriod} days, I give my Residuary Estate to{" "}
            {(r.finalContingentBeneficiary as string) ||
              `my heirs at law as determined under the laws of the State of ${stateName}`}
            .
          </li>
        </ul>
      </Section>

      {/* Article: Guardianship - matches PDF exactly */}
      {r.hasMinorChildren && (
        <Section
          id="guardian"
          title="Article 6 - Guardianship"
          currentStepId={currentStepId}
          highlightSteps={["guardianship"]}
        >
          <p>
            If at the time of my death any of my children are minors, I nominate and appoint{" "}
            <strong>{guardianName}</strong>
            {guardianRelationship && ` (${guardianRelationship})`} as Guardian of the person of my
            minor children.
          </p>
          <p className="mt-2">
            If {guardianName} is unable or unwilling to serve, I nominate and appoint{" "}
            <strong>{alternateGuardianName}</strong> as successor Guardian.
          </p>
          <p className="mt-2">No Guardian shall be required to post bond.</p>
        </Section>
      )}

      {/* Article: Simultaneous Death - matches PDF exactly */}
      <Section
        id="simultaneousDeath"
        title="Article 6 - Simultaneous Death and Survival Requirement"
        currentStepId={currentStepId}
        highlightSteps={["provisions"]}
      >
        <p>
          If any beneficiary under this Will and I die under circumstances where it cannot be
          established by clear and convincing evidence who died first, or if any beneficiary dies
          within {survivalPeriod} days after my death, that beneficiary shall be deemed to have
          predeceased me for all purposes of this Will. This provision shall apply to all
          beneficiaries, including my spouse, regardless of any presumption of survivorship under
          applicable law.
        </p>
      </Section>

      {/* Article: No-Contest - matches PDF exactly */}
      {r.noContestClause && (
        <Section
          id="noContest"
          title="Article 7 - No-Contest Provision"
          currentStepId={currentStepId}
          highlightSteps={["provisions"]}
        >
          <p>
            If any beneficiary under this Will, directly or indirectly, contests or attacks this
            Will or any of its provisions, or conspires with or assists anyone in any such contest,
            or pursues any action that would have the effect of voiding, nullifying, or setting
            aside any of the provisions of this Will, then any share or interest in my estate given
            to that contesting beneficiary under this Will is revoked and shall be disposed of as if
            that contesting beneficiary had predeceased me without leaving any surviving
            descendants. This provision shall be enforced to the fullest extent permitted by law.
          </p>
        </Section>
      )}

      {/* Article: Digital Assets - matches PDF exactly */}
      {(r.grantDigitalAccess ||
        r.digitalExecutor ||
        r.digitalAssetsInstructions ||
        r.passwordLocation ||
        r.socialMediaInstructions ||
        r.cryptocurrencyInfo) && (
        <Section
          id="digitalAssets"
          title="Article 8 - Digital Assets"
          currentStepId={currentStepId}
          highlightSteps={["digital"]}
        >
          <p>
            Pursuant to applicable state law, including any adoption of the Revised Uniform
            Fiduciary Access to Digital Assets Act, I grant my Executor full power and authority to
            access, manage, distribute, copy, and delete my digital assets and electronic
            communications.
            {r.digitalExecutor
              ? ` I specifically designate ${r.digitalExecutor} to manage my digital assets and online accounts.`
              : ""}
          </p>
          {r.digitalAssetsInstructions && (
            <div className="mt-2">
              <p className="font-medium">Specific Instructions:</p>
              <p>{String(r.digitalAssetsInstructions)}</p>
            </div>
          )}
          {r.passwordLocation && (
            <div className="mt-2">
              <p className="font-medium">Location of Passwords/Access Information:</p>
              <p>{String(r.passwordLocation)}</p>
            </div>
          )}
          {r.socialMediaInstructions && (
            <div className="mt-2">
              <p className="font-medium">Social Media Accounts:</p>
              <p>
                {r.socialMediaInstructions === "delete"
                  ? "Delete all social media accounts"
                  : r.socialMediaInstructions === "memorialize"
                    ? "Memorialize or convert to legacy mode where available"
                    : r.socialMediaInstructions === "download_delete"
                      ? "Download content then delete accounts"
                      : r.socialMediaInstructions === "agent_decides"
                        ? "Executor to decide handling of social media accounts"
                        : String(r.socialMediaInstructions)}
              </p>
            </div>
          )}
          {r.cryptocurrencyInfo && (
            <div className="mt-2">
              <p className="font-medium">Cryptocurrency Holdings:</p>
              <p>{String(r.cryptocurrencyInfo)}</p>
            </div>
          )}
        </Section>
      )}

      {/* Article: Final Wishes - matches PDF exactly */}
      {(r.burialPreference || r.organDonation) && (
        <Section
          id="finalWishes"
          title="Article 9 - Final Wishes"
          currentStepId={currentStepId}
          highlightSteps={["final"]}
        >
          <p>
            While I understand these wishes are not legally binding on my Executor, I express the
            following preferences regarding the disposition of my remains:
          </p>
          {r.burialPreference && (
            <div className="mt-2">
              <p className="font-medium">Disposition Preference:</p>
              <p>
                {r.burialPreference === "burial"
                  ? "Traditional burial"
                  : r.burialPreference === "cremation"
                    ? "Cremation"
                    : r.burialPreference === "green_burial"
                      ? "Green/natural burial"
                      : r.burialPreference === "donation"
                        ? "Donation of body to science"
                        : String(r.burialPreference)}
              </p>
            </div>
          )}
          {r.organDonation === true && (
            <p className="mt-2">
              I wish to be an organ and tissue donor, and I authorize the anatomical gift of any
              organs or tissues that may be useful for transplantation, therapy, medical research,
              or education.
            </p>
          )}
        </Section>
      )}

      {/* Signature Block - matches PDF exactly */}
      <Section
        id="signature"
        title="Testator's Signature"
        currentStepId={currentStepId}
        highlightSteps={["review"]}
      >
        <p>
          IN WITNESS WHEREOF, I, {testatorName}, have signed this, my Last Will and Testament, on
          this _____ day of _______________, 20___, at _______________, {stateName}, and declare
          that I sign it willingly, that I execute it as my free and voluntary act for the purposes
          expressed herein, and that I am of legal age and sound mind.
        </p>
        <div className="mt-8">
          <div className="border-b border-black w-64 mb-1" />
          <p className="text-sm">{testatorName}, Testator/Testatrix</p>
        </div>
      </Section>

      {/* Witness Attestation - matches PDF exactly */}
      <Section
        id="witnesses"
        title="Attestation of Witnesses"
        currentStepId={currentStepId}
        highlightSteps={["review"]}
      >
        <p className="text-sm mb-4">
          On the date written below, {testatorName}, known to us or proved to us on the basis of
          satisfactory evidence to be the person whose name is signed on the foregoing instrument,
          declared to us that the foregoing instrument was their Last Will and Testament, and
          requested us to act as witnesses to the same.
        </p>
        <p className="text-sm mb-4">
          {testatorName} signed this will in our presence, all of us being present at the same time.
          We observed the signing of this will by {testatorName} and by each other. We believe{" "}
          {testatorName} to be of sound mind and memory, over the age of majority, and under no
          constraint or undue influence.
        </p>
        <p className="text-sm mb-4">
          Each of us is now over 18 years of age, is a competent witness, and resides at the address
          set forth below. Neither of us is named as a beneficiary in this will.
        </p>
        <div className="grid grid-cols-2 gap-8 mt-6">
          <div>
            <p className="font-medium text-sm mb-2">Witness 1:</p>
            <div className="border-b border-black mb-1 mt-4" />
            <p className="text-xs text-muted-foreground">Signature / Date</p>
            <div className="border-b border-black mb-1 mt-4" />
            <p className="text-xs text-muted-foreground">Printed Name / City, State, ZIP</p>
          </div>
          <div>
            <p className="font-medium text-sm mb-2">Witness 2:</p>
            <div className="border-b border-black mb-1 mt-4" />
            <p className="text-xs text-muted-foreground">Signature / Date</p>
            <div className="border-b border-black mb-1 mt-4" />
            <p className="text-xs text-muted-foreground">Printed Name / City, State, ZIP</p>
          </div>
        </div>
      </Section>
    </div>
  );
}

// Healthcare POA Preview
function HealthcarePOAPreview({
  responses,
  state,
  currentStepId,
}: Omit<DocumentPreviewProps, "documentType" | "className">) {
  const r = responses;
  const stateName = STATE_NAMES[state as USState] || state;
  const principalName = getPersonName(r, "principal");
  const agentName = getPersonName(r, "healthcareAgent");
  const alternateAgentName = getPersonName(r, "alternateHealthcareAgent");

  return (
    <div className="space-y-4">
      <div className="text-center border-b pb-4 mb-6">
        <h1 className="text-xl font-bold">Healthcare Power of Attorney</h1>
        <p className="text-lg">of {principalName}</p>
        <p className="text-sm text-muted-foreground">State of {stateName}</p>
      </div>

      <Section
        id="designation"
        title="Designation of Healthcare Agent"
        currentStepId={currentStepId}
        highlightSteps={["personal", "agent"]}
      >
        <p>
          I, <strong>{principalName}</strong>, hereby designate <strong>{agentName}</strong> as my
          Healthcare Agent to make healthcare decisions for me when I am unable to make them for
          myself.
        </p>
        {alternateAgentName !== "[NOT SPECIFIED]" && (
          <p className="mt-2">
            If {agentName} is unable or unwilling to serve, I designate{" "}
            <strong>{alternateAgentName}</strong> as my successor Healthcare Agent.
          </p>
        )}
      </Section>

      <Section
        id="powers"
        title="Powers Granted"
        currentStepId={currentStepId}
        highlightSteps={["powers"]}
      >
        <p>My Healthcare Agent shall have authority to:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>Consent to or refuse medical treatment</li>
          <li>Access my medical records and information</li>
          <li>Hire and discharge medical providers</li>
          <li>Make decisions about end-of-life care</li>
          {r.organDonation && <li>Make decisions about organ donation</li>}
          {r.mentalHealthTreatment && <li>Make decisions about mental health treatment</li>}
        </ul>
      </Section>

      <Section
        id="instructions"
        title="Special Instructions"
        currentStepId={currentStepId}
        highlightSteps={["instructions"]}
      >
        {r.specialInstructions ? (
          <p className="whitespace-pre-line">{r.specialInstructions as string}</p>
        ) : (
          <p className="text-muted-foreground italic">No special instructions provided.</p>
        )}
      </Section>
    </div>
  );
}

// Financial POA Preview
function FinancialPOAPreview({
  responses,
  state,
  currentStepId,
}: Omit<DocumentPreviewProps, "documentType" | "className">) {
  const r = responses;
  const stateName = STATE_NAMES[state as USState] || state;
  const principalName = getPersonName(r, "principal");
  const agentName = getPersonName(r, "agent");
  const alternateAgentName = getPersonName(r, "alternateAgent");

  return (
    <div className="space-y-4">
      <div className="text-center border-b pb-4 mb-6">
        <h1 className="text-xl font-bold">Durable Power of Attorney</h1>
        <p className="text-lg">of {principalName}</p>
        <p className="text-sm text-muted-foreground">State of {stateName}</p>
      </div>

      <Section
        id="designation"
        title="Designation of Agent"
        currentStepId={currentStepId}
        highlightSteps={["personal", "agent"]}
      >
        <p>
          I, <strong>{principalName}</strong>, hereby appoint <strong>{agentName}</strong> as my
          Attorney-in-Fact (Agent) to act for me in any lawful way with respect to the powers
          granted below.
        </p>
        {alternateAgentName !== "[NOT SPECIFIED]" && (
          <p className="mt-2">
            If {agentName} is unable or unwilling to serve, I appoint{" "}
            <strong>{alternateAgentName}</strong> as my successor Agent.
          </p>
        )}
      </Section>

      <Section
        id="powers"
        title="Powers Granted"
        currentStepId={currentStepId}
        highlightSteps={["powers"]}
      >
        <p>My Agent shall have authority to act on my behalf regarding:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          {r.realEstate && <li>Real estate transactions</li>}
          {r.banking && <li>Banking and financial transactions</li>}
          {r.investments && <li>Investments and securities</li>}
          {r.taxes && <li>Tax matters</li>}
          {r.insurance && <li>Insurance transactions</li>}
          {r.gifts && <li>Making gifts</li>}
          {r.business && <li>Business operations</li>}
          {!r.realEstate && !r.banking && !r.investments && !r.taxes && (
            <li className="text-muted-foreground italic">No specific powers selected yet.</li>
          )}
        </ul>
      </Section>

      <Section
        id="durability"
        title="Durability"
        currentStepId={currentStepId}
        highlightSteps={["provisions"]}
      >
        <p>
          This Power of Attorney shall{" "}
          <strong>{r.durable ? "remain effective" : "NOT remain effective"}</strong> even if I
          become incapacitated or disabled.
        </p>
      </Section>
    </div>
  );
}

// Advance Directive Preview
function AdvanceDirectivePreview({
  responses,
  state,
  currentStepId,
}: Omit<DocumentPreviewProps, "documentType" | "className">) {
  const r = responses;
  const stateName = STATE_NAMES[state as USState] || state;
  const principalName = getPersonName(r, "principal");

  return (
    <div className="space-y-4">
      <div className="text-center border-b pb-4 mb-6">
        <h1 className="text-xl font-bold">Advance Healthcare Directive</h1>
        <p className="text-lg">of {principalName}</p>
        <p className="text-sm text-muted-foreground">State of {stateName}</p>
      </div>

      <Section
        id="declaration"
        title="Declaration"
        currentStepId={currentStepId}
        highlightSteps={["personal"]}
      >
        <p>
          I, <strong>{principalName}</strong>, being of sound mind, willfully and voluntarily make
          this declaration to be followed if I become unable to make or communicate decisions
          regarding my medical treatment.
        </p>
      </Section>

      <Section
        id="lifesustaining"
        title="Life-Sustaining Treatment"
        currentStepId={currentStepId}
        highlightSteps={["treatment"]}
      >
        <p>
          If I have a terminal condition or am in a persistent vegetative state, I direct that
          life-sustaining treatment be:
        </p>
        <p className="mt-2 font-semibold">
          {r.lifeSustainingTreatment === "withdraw"
            ? "WITHDRAWN or WITHHELD"
            : r.lifeSustainingTreatment === "continue"
              ? "CONTINUED for as long as possible"
              : "[NOT SPECIFIED]"}
        </p>
      </Section>

      <Section
        id="comfort"
        title="Comfort Care"
        currentStepId={currentStepId}
        highlightSteps={["treatment"]}
      >
        <p>
          I direct that treatment for alleviation of pain or discomfort be provided at all times,
          even if it hastens my death.
        </p>
        {r.artificialNutrition !== undefined && (
          <p className="mt-2">
            Artificial nutrition and hydration:{" "}
            <strong>{r.artificialNutrition ? "May be provided" : "Should NOT be provided"}</strong>
          </p>
        )}
      </Section>

      <Section
        id="organdonation"
        title="Organ Donation"
        currentStepId={currentStepId}
        highlightSteps={["final"]}
      >
        <p>
          Upon my death, I{" "}
          <strong>
            {r.organDonation ? "WISH to donate my organs and tissues" : "do NOT wish to donate"}
          </strong>{" "}
          for transplantation, therapy, research, or education.
        </p>
      </Section>
    </div>
  );
}

// Trust Preview
function TrustPreview({
  responses,
  state,
  currentStepId,
}: Omit<DocumentPreviewProps, "documentType" | "className">) {
  const r = responses;
  const stateName = STATE_NAMES[state as USState] || state;
  const grantorName = getPersonName(r, "grantor");
  const grantorAddress = getPersonAddress(r, "grantor");
  const initialTrusteeName = getPersonName(r, "initialTrustee");
  const coTrusteeName = getPersonName(r, "coTrustee");
  const successorTrusteeName = getPersonName(r, "successorTrustee");
  const secondSuccessorTrusteeName = getPersonName(r, "secondSuccessorTrustee");
  const primaryBeneficiaries = formatBeneficiaries(r.primaryBeneficiaries);
  const contingentBeneficiaries = formatBeneficiaries(r.contingentBeneficiaries);
  const county = (r.county as string) || "_________________";
  const trustName = (r.trustName as string) || `${grantorName} Revocable Living Trust`;
  const survivalPeriod = (r.survivalPeriod as string) || "30";

  // Check if any assets are specified
  const hasRealEstate = Boolean(r.realEstate);
  const hasBankAccounts = Boolean(r.bankAccounts);
  const hasInvestments = Boolean(r.investments);
  const hasBusinessInterests = Boolean(r.businessInterests);
  const hasVehicles = Boolean(r.vehicles);
  const hasOtherAssets = Boolean(r.otherAssets);
  const hasAnyAssets =
    hasRealEstate ||
    hasBankAccounts ||
    hasInvestments ||
    hasBusinessInterests ||
    hasVehicles ||
    hasOtherAssets;

  return (
    <div className="space-y-4">
      <div className="text-center border-b pb-4 mb-6">
        <h1 className="text-xl font-bold">REVOCABLE LIVING TRUST AGREEMENT</h1>
        <p className="text-lg">{trustName}</p>
        <p className="text-sm text-muted-foreground">State of {stateName}</p>
      </div>

      {/* Article I: Creation of Trust */}
      <Section
        id="creation"
        title="Article I - Creation of Trust"
        currentStepId={currentStepId}
        highlightSteps={["personal"]}
      >
        <p>
          I, <strong>{grantorName}</strong>, a resident of{" "}
          <strong>{grantorAddress || "[YOUR ADDRESS]"}</strong>, County of <strong>{county}</strong>
          , State of {stateName}, being of sound mind and memory, hereby create this Revocable
          Living Trust Agreement and declare as follows:
        </p>
        <p className="mt-2">
          This Trust shall be known as the "<strong>{trustName}</strong>" and shall become effective
          immediately upon execution.
        </p>
      </Section>

      {/* Article II: Trust Property */}
      <Section
        id="property"
        title="Article II - Trust Property"
        currentStepId={currentStepId}
        highlightSteps={["assets"]}
      >
        <p>
          I hereby transfer and convey to the Trustee all property listed in Schedule A attached
          hereto, which shall constitute the initial trust estate. I reserve the right to add
          property to this Trust at any time during my lifetime.
        </p>
        {hasAnyAssets && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="font-medium text-sm mb-2">SCHEDULE A - Trust Assets:</p>
            {hasRealEstate && (
              <div className="mb-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">Real Estate:</p>
                <p className="text-sm whitespace-pre-line">{r.realEstate as string}</p>
              </div>
            )}
            {hasBankAccounts && (
              <div className="mb-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Bank Accounts:
                </p>
                <p className="text-sm whitespace-pre-line">{r.bankAccounts as string}</p>
              </div>
            )}
            {hasInvestments && (
              <div className="mb-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">Investments:</p>
                <p className="text-sm whitespace-pre-line">{r.investments as string}</p>
              </div>
            )}
            {hasBusinessInterests && (
              <div className="mb-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Business Interests:
                </p>
                <p className="text-sm whitespace-pre-line">{r.businessInterests as string}</p>
              </div>
            )}
            {hasVehicles && (
              <div className="mb-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">Vehicles:</p>
                <p className="text-sm whitespace-pre-line">{r.vehicles as string}</p>
              </div>
            )}
            {hasOtherAssets && (
              <div className="mb-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">Other Assets:</p>
                <p className="text-sm whitespace-pre-line">{r.otherAssets as string}</p>
              </div>
            )}
          </div>
        )}
        {r.excludedAssets && (
          <div className="mt-2 text-sm">
            <p className="font-medium">Assets Intentionally Excluded from Trust:</p>
            <p className="whitespace-pre-line text-muted-foreground">
              {r.excludedAssets as string}
            </p>
          </div>
        )}
      </Section>

      {/* Article III: Trustee */}
      <Section
        id="trustee"
        title="Article III - Appointment of Trustee"
        currentStepId={currentStepId}
        highlightSteps={["trustees"]}
      >
        <p>
          I appoint <strong>{initialTrusteeName}</strong> as the initial Trustee of this Trust.
          {coTrusteeName !== "[NOT SPECIFIED]" && (
            <>
              {" "}
              I also appoint <strong>{coTrusteeName}</strong> as Co-Trustee to serve jointly.
            </>
          )}
        </p>
        {successorTrusteeName !== "[NOT SPECIFIED]" && (
          <p className="mt-2">
            If {initialTrusteeName} is unable or unwilling to serve, or ceases to serve for any
            reason, I appoint <strong>{successorTrusteeName}</strong> as Successor Trustee.
            {secondSuccessorTrusteeName !== "[NOT SPECIFIED]" && (
              <>
                {" "}
                If {successorTrusteeName} is also unable or unwilling to serve, I appoint{" "}
                <strong>{secondSuccessorTrusteeName}</strong> as Second Successor Trustee.
              </>
            )}
          </p>
        )}
        {r.waiveTrusteeBond !== false && (
          <p className="mt-2">
            No Trustee shall be required to furnish any bond or surety for the faithful performance
            of duties.
          </p>
        )}
      </Section>

      {/* Article IV: Trustee Powers */}
      <Section
        id="trusteePowers"
        title="Article IV - Trustee Powers"
        currentStepId={currentStepId}
        highlightSteps={["trustees"]}
      >
        <p>
          The Trustee shall have all powers granted by applicable law, plus the following specific
          powers:
        </p>
        <ul className="list-none ml-4 mt-2 space-y-1 text-sm">
          <li>(a) To retain, sell, exchange, or dispose of trust property;</li>
          <li>(b) To invest and reinvest trust funds as the Trustee deems advisable;</li>
          <li>(c) To manage real property, including power to lease, mortgage, or improve;</li>
          <li>(d) To borrow money and encumber trust property;</li>
          <li>(e) To employ advisors, attorneys, and other professionals;</li>
          <li>(f) To make distributions in cash or in kind;</li>
          <li>(g) To exercise all incidents of ownership over life insurance policies;</li>
          <li>(h) To manage digital assets as permitted by law.</li>
        </ul>
      </Section>

      {/* Article V: Beneficiaries and Distribution */}
      <Section
        id="beneficiaries"
        title="Article V - Beneficiaries and Distribution"
        currentStepId={currentStepId}
        highlightSteps={["beneficiaries"]}
      >
        <p>
          <strong>During My Lifetime:</strong> During my lifetime, the Trustee shall hold, manage,
          and distribute the trust property for my benefit. I may withdraw any or all of the trust
          property at any time.
        </p>
        <p className="mt-2">
          <strong>Upon My Death:</strong> Upon my death, after payment of debts, taxes, and
          expenses, the remaining trust property shall be distributed as follows:
        </p>

        {primaryBeneficiaries.length > 0 ? (
          <div className="mt-2">
            <p className="font-medium text-sm">Primary Beneficiaries:</p>
            <ul className="list-disc ml-6 mt-1 text-sm">
              {primaryBeneficiaries.map((b) => (
                <li key={`${b.name}-${b.percentage}`}>
                  <strong>{b.name}</strong>
                  {b.relationship && ` (${b.relationship})`}
                  {b.percentage > 0 && ` - ${b.percentage}%`}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mt-2 text-muted-foreground italic">
            [Primary beneficiaries not yet specified]
          </p>
        )}

        {contingentBeneficiaries.length > 0 && (
          <div className="mt-2">
            <p className="font-medium text-sm">Contingent Beneficiaries:</p>
            <p className="text-sm">
              If any primary beneficiary does not survive me by {survivalPeriod} days:
            </p>
            <ul className="list-disc ml-6 mt-1 text-sm">
              {contingentBeneficiaries.map((b) => (
                <li key={`${b.name}-${b.percentage}`}>
                  <strong>{b.name}</strong>
                  {b.relationship && ` (${b.relationship})`}
                  {b.percentage > 0 && ` - ${b.percentage}%`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {/* Article VI: Distribution Provisions */}
      {r.distributionTiming && (
        <Section
          id="distribution"
          title="Article VI - Distribution Provisions"
          currentStepId={currentStepId}
          highlightSteps={["distribution"]}
        >
          <p>
            Distributions to beneficiaries shall be made:{" "}
            <strong>
              {r.distributionTiming === "immediate"
                ? "Immediately upon my death"
                : r.distributionTiming === "age_21"
                  ? "When beneficiary reaches age 21"
                  : r.distributionTiming === "age_25"
                    ? "When beneficiary reaches age 25"
                    : r.distributionTiming === "age_30"
                      ? "When beneficiary reaches age 30"
                      : r.distributionTiming === "age_35"
                        ? "When beneficiary reaches age 35"
                        : r.distributionTiming === "staged"
                          ? "In staged distributions as specified"
                          : String(r.distributionTiming)}
            </strong>
          </p>
          {r.stagedDistribution && (
            <div className="mt-2">
              <p className="font-medium text-sm">Staged Distribution Schedule:</p>
              <p className="text-sm whitespace-pre-line">{r.stagedDistribution as string}</p>
            </div>
          )}
        </Section>
      )}

      {/* Article VII: Revocation and Amendment */}
      <Section
        id="revocation"
        title="Article VII - Revocation and Amendment"
        currentStepId={currentStepId}
        highlightSteps={["provisions"]}
      >
        <p>
          I reserve the right to revoke, amend, or modify this Trust at any time during my lifetime,
          in whole or in part, by written instrument delivered to the Trustee. Upon revocation, all
          trust property shall be returned to me.
        </p>
        <p className="mt-2">
          This Trust shall become irrevocable upon my death or incapacity, and no further amendments
          may be made thereafter.
        </p>
      </Section>

      {/* Signature Block */}
      <Section
        id="signature"
        title="Execution"
        currentStepId={currentStepId}
        highlightSteps={["review"]}
      >
        <p>
          IN WITNESS WHEREOF, I have signed this Revocable Living Trust Agreement on this _____ day
          of _______________, 20___.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-8">
          <div>
            <p className="text-xs text-muted-foreground mb-2">GRANTOR:</p>
            <div className="border-b border-black mb-1" />
            <p className="text-sm">{grantorName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">TRUSTEE ACCEPTANCE:</p>
            <div className="border-b border-black mb-1" />
            <p className="text-sm">{initialTrusteeName}, Trustee</p>
          </div>
        </div>
      </Section>

      {/* Notary Block */}
      <Section
        id="notary"
        title="Notarization"
        currentStepId={currentStepId}
        highlightSteps={["review"]}
      >
        <p className="text-sm">
          State of {stateName}, County of {county}
        </p>
        <p className="text-sm mt-2">
          On this _____ day of _______________, 20___, before me, a Notary Public in and for said
          State, personally appeared {grantorName}, known to me (or proved to me on the basis of
          satisfactory evidence) to be the person whose name is subscribed to this instrument, and
          acknowledged that they executed the same.
        </p>
        <div className="mt-4">
          <div className="border-b border-black w-48 mb-1" />
          <p className="text-xs text-muted-foreground">Notary Public</p>
          <p className="text-xs text-muted-foreground mt-2">My commission expires: ___________</p>
        </div>
      </Section>
    </div>
  );
}

// Pour-Over Will Preview
function PourOverWillPreview({
  responses,
  state,
  currentStepId,
}: Omit<DocumentPreviewProps, "documentType" | "className">) {
  const r = responses;
  const stateName = STATE_NAMES[state as USState] || state;
  const testatorName = getPersonName(r, "testator");
  const executorName = getPersonName(r, "executor");

  return (
    <div className="space-y-4">
      <div className="text-center border-b pb-4 mb-6">
        <h1 className="text-xl font-bold">Pour-Over Will</h1>
        <p className="text-lg">of {testatorName}</p>
        <p className="text-sm text-muted-foreground">State of {stateName}</p>
      </div>

      <Section
        id="declaration"
        title="Declaration"
        currentStepId={currentStepId}
        highlightSteps={["personal"]}
      >
        <p>
          I, <strong>{testatorName}</strong>, declare this to be my Pour-Over Will, intended to work
          in conjunction with my Revocable Living Trust.
        </p>
      </Section>

      <Section
        id="executor"
        title="Executor"
        currentStepId={currentStepId}
        highlightSteps={["executor"]}
      >
        <p>
          I appoint <strong>{executorName}</strong> as Executor of this Will.
        </p>
      </Section>

      <Section
        id="pourover"
        title="Pour-Over Provision"
        currentStepId={currentStepId}
        highlightSteps={["provisions"]}
      >
        <p>
          I give all my property not otherwise disposed of to the Trustee of my Revocable Living
          Trust, to be held and distributed according to the terms of that Trust.
        </p>
      </Section>
    </div>
  );
}

// Main DocumentPreview component
export function DocumentPreview({
  documentType,
  state,
  responses,
  currentStepId,
  className,
}: DocumentPreviewProps) {
  const previewProps = { responses, state, currentStepId };

  return (
    <div className={cn("p-6 bg-white dark:bg-slate-950", className)}>
      {documentType === "will" && <WillPreview {...previewProps} />}
      {documentType === "healthcare_poa" && <HealthcarePOAPreview {...previewProps} />}
      {documentType === "financial_poa" && <FinancialPOAPreview {...previewProps} />}
      {documentType === "advance_directive" && <AdvanceDirectivePreview {...previewProps} />}
      {documentType === "trust" && <TrustPreview {...previewProps} />}
      {documentType === "pour_over_will" && <PourOverWillPreview {...previewProps} />}
    </div>
  );
}
