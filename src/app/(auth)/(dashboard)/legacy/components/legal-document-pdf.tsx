"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  getStateLegalRequirements,
  STATE_NAMES,
  type USState,
} from "@/lib/state-legal-requirements";

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.5,
    color: "#000",
  },
  header: {
    marginBottom: 15,
    textAlign: "center",
    paddingBottom: 12,
    borderBottom: "2px solid #000",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 11,
    color: "#333",
    marginBottom: 2,
  },
  stateInfo: {
    fontSize: 9,
    color: "#666",
    marginTop: 4,
  },
  disclaimerBox: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  disclaimerText: {
    fontSize: 7,
    color: "#666",
    lineHeight: 1.3,
    textAlign: "center",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
    textTransform: "uppercase",
    borderBottom: "1px solid #000",
    paddingBottom: 2,
  },
  article: {
    marginBottom: 8,
  },
  articleTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 3,
  },
  articleContent: {
    fontSize: 9,
    lineHeight: 1.6,
    textAlign: "justify",
  },
  articleContentIndented: {
    fontSize: 9,
    lineHeight: 1.6,
    marginLeft: 12,
    textAlign: "justify",
  },
  subSection: {
    marginTop: 6,
    marginBottom: 6,
    marginLeft: 12,
  },
  subSectionLabel: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 2,
  },
  field: {
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 1,
  },
  fieldValue: {
    fontSize: 9,
    paddingLeft: 8,
    lineHeight: 1.4,
  },
  signatureSection: {
    marginTop: 20,
    pageBreakInside: "avoid",
  },
  signatureBlock: {
    marginBottom: 20,
  },
  signatureLine: {
    borderBottom: "1px solid #000",
    marginBottom: 2,
    height: 25,
  },
  signatureLabel: {
    fontSize: 8,
    color: "#666",
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  signatureColumn: {
    width: "45%",
  },
  witnessSection: {
    marginTop: 15,
    paddingTop: 12,
    borderTop: "1px solid #666",
  },
  witnessTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  witnessBlock: {
    marginBottom: 15,
  },
  notarySection: {
    marginTop: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "#000",
  },
  notaryTitle: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  notaryText: {
    fontSize: 8,
    lineHeight: 1.5,
    marginBottom: 12,
  },
  selfProvingSection: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#fafafa",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selfProvingTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
    textAlign: "center",
  },
  selfProvingText: {
    fontSize: 8,
    lineHeight: 1.5,
    marginBottom: 8,
  },
  footer: {
    position: "absolute",
    bottom: 25,
    left: 50,
    right: 50,
    fontSize: 7,
    color: "#888",
    textAlign: "center",
    borderTop: "1px solid #ddd",
    paddingTop: 6,
  },
  pageNumber: {
    position: "absolute",
    bottom: 12,
    right: 50,
    fontSize: 8,
    color: "#666",
  },
  checkboxRow: {
    flexDirection: "row",
    marginBottom: 4,
    marginLeft: 8,
    alignItems: "flex-start",
  },
  checkbox: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: "#000",
    marginRight: 6,
    marginTop: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    fontSize: 8,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 9,
    flex: 1,
  },
  legalClause: {
    fontSize: 9,
    lineHeight: 1.6,
    marginBottom: 8,
    textAlign: "justify",
  },
  definitionTerm: {
    fontSize: 9,
    fontWeight: "bold",
  },
  definitionText: {
    fontSize: 9,
    marginLeft: 8,
    marginBottom: 4,
    lineHeight: 1.5,
  },
});

type DocumentType =
  | "will"
  | "trust"
  | "pour_over_will"
  | "financial_poa"
  | "healthcare_poa"
  | "advance_directive";

interface LegalDocumentPDFData {
  documentType: DocumentType;
  state: string;
  responses: Record<string, string | boolean>;
  userName: string;
  generatedDate: Date;
}

// Render a checkbox with optional check
function Checkbox({ checked, label }: { checked: boolean; label: string }) {
  return (
    <View style={styles.checkboxRow}>
      <View style={styles.checkbox}>
        <Text style={styles.checkmark}>{checked ? "X" : ""}</Text>
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </View>
  );
}

// Enhanced witness attestation clause
function WitnessAttestation({
  count,
  state,
  documentType,
  testatorName,
}: {
  count: number;
  state: string;
  documentType: string;
  testatorName: string;
}) {
  const witnesses = Array.from({ length: count }, (_, i) => i + 1);
  const requirements = getStateLegalRequirements(state as USState);
  const minAge = requirements?.will?.minimumWitnessAge || 18;

  return (
    <View style={styles.witnessSection}>
      <Text style={styles.witnessTitle}>Attestation of Witnesses</Text>
      <Text style={[styles.legalClause, { marginBottom: 12 }]}>
        On the date written below, {testatorName || "[TESTATOR NAME]"}, known to us or proved to us
        on the basis of satisfactory evidence to be the person whose name is signed on the foregoing
        instrument, declared to us that the foregoing instrument was{" "}
        {documentType === "will" ? "their Last Will and Testament" : `their ${documentType}`}, and
        requested us to act as witnesses to the same.
        {"\n\n"}
        {testatorName || "[TESTATOR NAME]"} signed this {documentType} in our presence, all of us
        being present at the same time. We observed the signing of this {documentType} by{" "}
        {testatorName || "[TESTATOR NAME]"} and by each other. We believe{" "}
        {testatorName || "[TESTATOR NAME]"} to be of sound mind and memory, over the age of
        majority, and under no constraint or undue influence.
        {"\n\n"}
        Each of us is now over {minAge} years of age, is a competent witness, and resides at the
        address set forth below. Neither of us is named as a beneficiary in this {documentType}.
        {"\n\n"}
        We declare under penalty of perjury under the laws of the State of{" "}
        {STATE_NAMES[state as USState] || state} that the foregoing is true and correct.
      </Text>

      {witnesses.map((num) => (
        <View key={num} style={styles.witnessBlock}>
          <Text style={styles.fieldLabel}>Witness {num}:</Text>
          <View style={styles.signatureRow}>
            <View style={styles.signatureColumn}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Signature</Text>
            </View>
            <View style={styles.signatureColumn}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Date</Text>
            </View>
          </View>
          <View style={styles.signatureRow}>
            <View style={styles.signatureColumn}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Printed Name</Text>
            </View>
            <View style={styles.signatureColumn}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>City, State, ZIP</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

// Enhanced notary acknowledgment
function NotaryAcknowledgment({ state, principalName }: { state: string; principalName: string }) {
  return (
    <View style={styles.notarySection}>
      <Text style={styles.notaryTitle}>Notary Acknowledgment</Text>
      <Text style={styles.notaryText}>
        STATE OF {(STATE_NAMES[state as USState] || state).toUpperCase()}
        {"\n"}COUNTY OF _______________________
        {"\n\n"}
        On this _____ day of _______________, 20___, before me, a Notary Public in and for said
        County and State, personally appeared {principalName || "[PRINCIPAL NAME]"}, known to me (or
        proved to me on the basis of satisfactory evidence) to be the person whose name is
        subscribed to the within instrument, and acknowledged to me that they executed the same in
        their authorized capacity, and that by their signature on the instrument, the person, or the
        entity upon behalf of which the person acted, executed the instrument.
        {"\n\n"}
        WITNESS my hand and official seal.
      </Text>
      <View style={styles.signatureRow}>
        <View style={styles.signatureColumn}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Notary Public Signature</Text>
        </View>
        <View style={styles.signatureColumn}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>My Commission Expires</Text>
        </View>
      </View>
      <View style={styles.signatureRow}>
        <View style={styles.signatureColumn}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Notary Printed Name</Text>
        </View>
        <View style={styles.signatureColumn}>
          <Text style={[styles.signatureLabel, { textAlign: "center" }]}>[NOTARY SEAL]</Text>
        </View>
      </View>
    </View>
  );
}

// Enhanced self-proving affidavit
function SelfProvingAffidavit({
  state,
  documentType,
  principalName,
}: {
  state: string;
  documentType: string;
  principalName: string;
}) {
  return (
    <View style={styles.selfProvingSection} break>
      <Text style={styles.selfProvingTitle}>Self-Proving Affidavit</Text>
      <Text style={styles.selfProvingText}>
        STATE OF {(STATE_NAMES[state as USState] || state).toUpperCase()}
        {"\n"}COUNTY OF _______________________
        {"\n\n"}I, the undersigned Testator/Principal, and we, the undersigned witnesses, being
        first duly sworn, declare to the undersigned officer that:
        {"\n\n"}
        1. The Testator/Principal signed this instrument as their{" "}
        {documentType === "will" ? "Last Will and Testament" : documentType}
        {"\n"}
        2. The Testator/Principal willingly signed and executed it as a free and voluntary act for
        the purposes therein expressed;
        {"\n"}
        3. Each witness, in the presence and at the request of the Testator/Principal, and in the
        presence of each other, signed this {documentType} as a witness;
        {"\n"}
        4. To the best of the witnesses' knowledge, the Testator/Principal was at the time of
        signing: (a) eighteen (18) years of age or older; (b) of sound mind and memory; and (c)
        under no constraint or undue influence.
      </Text>

      <View style={{ marginTop: 10, marginBottom: 10 }}>
        <View style={styles.signatureLine} />
        <Text style={styles.signatureLabel}>
          {principalName || "[TESTATOR/PRINCIPAL NAME]"}, Testator/Principal
        </Text>
      </View>

      <View style={styles.signatureRow}>
        <View style={styles.signatureColumn}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Witness 1 Signature</Text>
        </View>
        <View style={styles.signatureColumn}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Witness 2 Signature</Text>
        </View>
      </View>

      <Text style={[styles.selfProvingText, { marginTop: 10 }]}>
        Subscribed, sworn to, and acknowledged before me by {principalName || "[TESTATOR NAME]"},
        the Testator/Principal, and subscribed and sworn to before me by
        _________________________________ and _________________________________, witnesses, this
        _____ day of _________________, 20___.
      </Text>

      <View style={styles.signatureRow}>
        <View style={styles.signatureColumn}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>Notary Public</Text>
        </View>
        <View style={styles.signatureColumn}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureLabel}>My Commission Expires</Text>
        </View>
      </View>
      <Text style={[styles.signatureLabel, { textAlign: "center", marginTop: 8 }]}>
        [NOTARY SEAL]
      </Text>
    </View>
  );
}

// ============================================================================
// LAST WILL AND TESTAMENT
// ============================================================================
function WillDocument({ data }: { data: LegalDocumentPDFData }) {
  const r = data.responses;
  const requirements = getStateLegalRequirements(data.state as USState);
  const willReqs = requirements?.will;
  const stateName = STATE_NAMES[data.state as USState] || data.state;
  const survivalPeriod = (r.survivalPeriod as string) || "30";

  // Calculate page count: 3 base pages + 1 if notary/self-proving required
  const pageCount = willReqs?.notaryRequired || willReqs?.selfProvingAllowed ? 4 : 3;

  // Calculate article numbers dynamically
  let articleNum = 1;
  const getArticleNum = () => {
    const num = articleNum;
    articleNum++;
    return num;
  };

  return (
    <Document>
      {/* Page 1 */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Last Will and Testament</Text>
          <Text style={styles.subtitle}>of {r.fullName || "[YOUR FULL LEGAL NAME]"}</Text>
          <Text style={styles.stateInfo}>State of {stateName}</Text>
        </View>

        {/* Preamble and Declaration */}
        <View style={styles.section}>
          <Text style={styles.legalClause}>
            I, {r.fullName || "[YOUR FULL LEGAL NAME]"}, a resident of{" "}
            {r.address || "[YOUR ADDRESS]"}, County of _________________, State of {stateName},
            being of the age of majority in this state, of sound mind and memory, and not acting
            under duress, menace, fraud, or the undue influence of any person, do hereby make,
            publish, and declare this instrument to be my Last Will and Testament, hereby expressly
            revoking all wills and codicils heretofore made by me.
          </Text>
        </View>

        {/* Article: Family Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article {getArticleNum()} - Family Status</Text>
          <Text style={styles.legalClause}>
            I declare that my marital status is:{" "}
            {r.maritalStatus === "married"
              ? `married to ${r.spouseName || "[SPOUSE NAME]"}`
              : r.maritalStatus === "single"
                ? "single and have never been married"
                : r.maritalStatus === "divorced"
                  ? "divorced"
                  : r.maritalStatus === "widowed"
                    ? "widowed"
                    : r.maritalStatus === "domestic_partnership"
                      ? `in a domestic partnership with ${r.spouseName || "[PARTNER NAME]"}`
                      : "[MARITAL STATUS]"}
            .
          </Text>
          {r.hasMinorChildren && (
            <Text style={styles.legalClause}>
              I declare that I have the following minor children: {r.childrenNames || "[CHILDREN]"}.
              I have no other children, living or deceased.
            </Text>
          )}
          {!r.hasMinorChildren && (
            <Text style={styles.legalClause}>I declare that I have no minor children.</Text>
          )}
        </View>

        {/* Article: Payment of Debts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Article {getArticleNum()} - Payment of Debts, Expenses, and Taxes
          </Text>
          <Text style={styles.legalClause}>
            I direct my Executor to pay from my residuary estate all my legally enforceable debts,
            reasonable funeral expenses, costs of administration, and all estate, inheritance, and
            succession taxes (including any interest and penalties thereon) that may be assessed
            against my estate or any beneficiary thereof by reason of my death. My Executor shall
            have sole discretion to determine which debts are legally enforceable. It is my
            intention that all such taxes be paid from my residuary estate as an expense of
            administration, without apportionment or reimbursement from any beneficiary.
          </Text>
        </View>

        {/* Article: Executor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Article {getArticleNum()} - Appointment of Executor
          </Text>
          <Text style={styles.legalClause}>
            I appoint {r.executorName || "[EXECUTOR NAME]"}
            {r.executorRelationship ? ` (${r.executorRelationship})` : ""} as the Executor of this
            Will.
            {r.executorAddress ? ` Address: ${r.executorAddress}.` : ""}
            {"\n\n"}
            If {r.executorName || "[EXECUTOR NAME]"} is unable or unwilling to serve, or ceases to
            serve for any reason, I appoint {r.alternateExecutorName || "[ALTERNATE EXECUTOR]"}
            {r.alternateExecutorRelationship ? ` (${r.alternateExecutorRelationship})` : ""} as
            successor Executor.
          </Text>
        </View>

        {/* Article: Executor Powers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article {getArticleNum()} - Executor Powers</Text>
          <Text style={styles.legalClause}>
            I grant to my Executor, and any successor Executor, without the necessity of court
            approval, the following powers to be exercised in the Executor's sole discretion:
          </Text>
          <View style={styles.subSection}>
            <Text style={styles.articleContent}>
              (a) To retain any property received from my estate for such time as my Executor deems
              advisable;{"\n"}
              (b) To sell, lease, exchange, or otherwise dispose of any property, real or personal,
              at public or private sale, with or without notice, upon such terms as my Executor
              deems proper;{"\n"}
              (c) To invest and reinvest estate funds in any form of property my Executor deems
              advisable;{"\n"}
              (d) To borrow money for any estate purpose and to pledge estate property as security;
              {"\n"}
              (e) To compromise, settle, or abandon any claims by or against my estate;{"\n"}
              (f) To employ attorneys, accountants, investment advisors, and other professionals;
              {"\n"}
              (g) To make distributions in cash or in kind, or partly in each;
              {"\n"}
              (h) To exercise all rights with respect to digital assets as permitted by applicable
              law including the Revised Uniform Fiduciary Access to Digital Assets Act;{"\n"}
              (i) To perform all other acts necessary for proper administration of my estate.
            </Text>
          </View>
          <Text style={[styles.legalClause, { marginTop: 8 }]}>
            I expressly waive the requirement for any bond or surety for my Executor and any
            successor Executor.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>
            Last Will and Testament of {r.fullName || "[YOUR NAME]"} | Generated{" "}
            {data.generatedDate.toLocaleDateString()}
          </Text>
        </View>
      </Page>

      {/* Page 2 */}
      <Page size="LETTER" style={styles.page}>
        {/* Article: Specific Bequests */}
        {r.specificBequests && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article {getArticleNum()} - Specific Bequests</Text>
            <Text style={styles.legalClause}>
              I make the following specific bequests of tangible personal property:
            </Text>
            <Text style={styles.articleContentIndented}>{r.specificBequests}</Text>
            <Text style={[styles.legalClause, { marginTop: 8 }]}>
              If any beneficiary of a specific bequest does not survive me by {survivalPeriod} days,
              the bequest shall lapse and become part of my residuary estate.
            </Text>
          </View>
        )}

        {/* Article: Residuary Estate */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article {getArticleNum()} - Residuary Estate</Text>
          <Text style={styles.legalClause}>
            I give, devise, and bequeath all the rest, residue, and remainder of my estate, both
            real and personal, of whatever kind and wherever situated, which I may own or be
            entitled to at the time of my death (hereinafter "Residuary Estate"), including all
            lapsed legacies and devises, as follows:
          </Text>
          <View style={styles.subSection}>
            <Text style={styles.articleContent}>
              (a) PRIMARY DISTRIBUTION: To {r.residuaryBeneficiary || "[PRIMARY BENEFICIARY]"}
              {r.residuaryRelationship ? ` (${r.residuaryRelationship})` : ""}
              {r.residuaryPercentage ? `, ${r.residuaryPercentage}%` : ", 100%"} of my Residuary
              Estate, if they survive me by {survivalPeriod} days.
            </Text>
            {r.additionalBeneficiaries && (
              <View style={{ marginTop: 4 }}>
                <Text style={styles.articleContent}>(b) ADDITIONAL BENEFICIARIES:</Text>
                <Text style={[styles.articleContent, { marginLeft: 16 }]}>
                  {r.additionalBeneficiaries}
                </Text>
              </View>
            )}
            <Text style={[styles.articleContent, { marginTop: 4 }]}>
              ({r.additionalBeneficiaries ? "c" : "b"}) CONTINGENT DISTRIBUTION: If the primary
              beneficiary does not survive me, I give my Residuary Estate to my descendants then
              living, per stirpes. If I have no surviving descendants, I give my Residuary Estate to{" "}
              {r.contingentBeneficiary || "[CONTINGENT BENEFICIARY]"}.
            </Text>
          </View>
        </View>

        {/* Article: Guardianship */}
        {r.hasMinorChildren && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article {getArticleNum()} - Guardianship</Text>
            <Text style={styles.legalClause}>
              If at the time of my death any of my children are minors, I nominate and appoint{" "}
              {r.guardianName || "[GUARDIAN NAME]"}
              {r.guardianRelationship ? ` (${r.guardianRelationship})` : ""} as Guardian of the
              person of my minor children.
              {r.guardianAddress ? ` Address: ${r.guardianAddress}.` : ""}
              {"\n\n"}
              If {r.guardianName || "[GUARDIAN NAME]"} is unable or unwilling to serve, I nominate
              and appoint {r.alternateGuardianName || "[ALTERNATE GUARDIAN]"} as successor Guardian.
              {"\n\n"}
              It is my express wish that under no circumstances shall{" "}
              {r.excludedGuardian || "[EXCLUDED PERSON, if any]"} be appointed as Guardian of my
              children. No Guardian shall be required to post bond.
            </Text>
          </View>
        )}

        {/* Article: Simultaneous Death */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Article {getArticleNum()} - Simultaneous Death and Survival Requirement
          </Text>
          <Text style={styles.legalClause}>
            If any beneficiary under this Will and I die under circumstances where it cannot be
            established by clear and convincing evidence who died first, or if any beneficiary dies
            within {survivalPeriod} days after my death, that beneficiary shall be deemed to have
            predeceased me for all purposes of this Will. This provision shall apply to all
            beneficiaries, including my spouse, regardless of any presumption of survivorship under
            applicable law.
          </Text>
        </View>

        {/* Article: Digital Assets */}
        {(r.digitalExecutor || r.digitalAssetsInstructions) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article {getArticleNum()} - Digital Assets</Text>
            <Text style={styles.legalClause}>
              Pursuant to applicable state law, including any adoption of the Revised Uniform
              Fiduciary Access to Digital Assets Act, I grant my Executor full power and authority
              to access, manage, distribute, copy, and delete my digital assets and electronic
              communications.
              {r.digitalExecutor
                ? ` I specifically designate ${r.digitalExecutor} to manage my digital assets and online accounts.`
                : ""}
            </Text>
            {r.digitalAssetsInstructions && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionLabel}>Specific Instructions:</Text>
                <Text style={styles.articleContent}>{r.digitalAssetsInstructions}</Text>
              </View>
            )}
            {r.passwordLocation && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionLabel}>
                  Location of Passwords/Access Information:
                </Text>
                <Text style={styles.articleContent}>{r.passwordLocation}</Text>
              </View>
            )}
          </View>
        )}

        {/* Article: No-Contest Clause */}
        {r.noContestClause && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Article {getArticleNum()} - No-Contest Provision
            </Text>
            <Text style={styles.legalClause}>
              If any beneficiary under this Will, directly or indirectly, contests or attacks this
              Will or any of its provisions, or conspires with or assists anyone in any such
              contest, or pursues any action that would have the effect of voiding, nullifying, or
              setting aside any of the provisions of this Will, then any share or interest in my
              estate given to that contesting beneficiary under this Will is revoked and shall be
              disposed of as if that contesting beneficiary had predeceased me without leaving any
              surviving descendants. This provision shall be enforced to the fullest extent
              permitted by law.
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>Last Will and Testament of {r.fullName || "[YOUR NAME]"} | Page 2</Text>
        </View>
      </Page>

      {/* Page 3 - Final Wishes, Definitions, Signature, and Attestation */}
      <Page size="LETTER" style={styles.page}>
        {/* Article: Final Wishes */}
        {(r.burialPreference || r.burialInstructions || r.organDonation) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article {getArticleNum()} - Final Wishes</Text>
            <Text style={styles.legalClause}>
              While I understand these wishes are not legally binding on my Executor, I express the
              following preferences regarding the disposition of my remains:
            </Text>
            {r.burialPreference && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionLabel}>Disposition Preference:</Text>
                <Text style={styles.articleContent}>
                  {r.burialPreference === "burial"
                    ? "Traditional burial"
                    : r.burialPreference === "cremation"
                      ? "Cremation"
                      : r.burialPreference === "green_burial"
                        ? "Green/natural burial"
                        : r.burialPreference === "donation"
                          ? "Donation of body to science"
                          : r.burialPreference}
                </Text>
              </View>
            )}
            {r.burialInstructions && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionLabel}>Special Instructions:</Text>
                <Text style={styles.articleContent}>{r.burialInstructions}</Text>
              </View>
            )}
            {r.organDonation === true && (
              <Text style={[styles.legalClause, { marginTop: 6 }]}>
                I wish to be an organ and tissue donor, and I authorize the anatomical gift of any
                organs or tissues that may be useful for transplantation, therapy, medical research,
                or education.
              </Text>
            )}
          </View>
        )}

        {/* Article: Definitions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article {getArticleNum()} - Definitions</Text>
          <Text style={styles.definitionTerm}>"Descendants" or "Issue"</Text>
          <Text style={styles.definitionText}>
            means children, grandchildren, and more remote descendants in any degree, whether by
            blood or by legal adoption.
          </Text>
          <Text style={styles.definitionTerm}>"Per Stirpes"</Text>
          <Text style={styles.definitionText}>
            means that if any beneficiary predeceases me but leaves descendants who survive me, such
            deceased beneficiary's share shall pass to such surviving descendants by right of
            representation.
          </Text>
          <Text style={styles.definitionTerm}>"Survive" or "Surviving"</Text>
          <Text style={styles.definitionText}>
            means living at the time of my death and for {survivalPeriod} days thereafter.
          </Text>
          <Text style={styles.definitionTerm}>"Digital Assets"</Text>
          <Text style={styles.definitionText}>
            means files, data, accounts, and content stored on digital devices or online platforms,
            including email accounts, social media accounts, online financial accounts, digital
            photographs, cryptocurrency, and any rights to access such digital content.
          </Text>
        </View>

        {/* Article: Severability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article {getArticleNum()} - Severability</Text>
          <Text style={styles.legalClause}>
            If any provision of this Will is held to be invalid, illegal, or unenforceable by a
            court of competent jurisdiction, the validity, legality, and enforceability of the
            remaining provisions shall not be affected or impaired thereby.
          </Text>
        </View>

        {/* Article: Governing Law */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article {getArticleNum()} - Governing Law</Text>
          <Text style={styles.legalClause}>
            This Will shall be governed by and construed in accordance with the laws of the State of{" "}
            {stateName}, without regard to conflicts of law principles.
          </Text>
        </View>

        {/* Signature Block */}
        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>Testator's Signature</Text>
          <Text style={styles.legalClause}>
            IN WITNESS WHEREOF, I, {r.fullName || "[YOUR NAME]"}, have signed this, my Last Will and
            Testament, consisting of {pageCount} pages, including this page, on this _____ day of
            _______________, 20___, at _______________, {stateName}, and declare that I sign it
            willingly, that I execute it as my free and voluntary act for the purposes expressed
            herein, and that I am of legal age and sound mind.
          </Text>
          <View style={[styles.signatureBlock, { marginTop: 15 }]}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>
              {r.fullName || "[YOUR NAME]"}, Testator/Testatrix
            </Text>
          </View>
        </View>

        {/* Witness Attestation */}
        <WitnessAttestation
          count={willReqs?.witnessCount || 2}
          state={data.state}
          documentType="will"
          testatorName={(r.fullName as string) || "[TESTATOR NAME]"}
        />

        <View style={styles.footer}>
          <Text>Last Will and Testament of {r.fullName || "[YOUR NAME]"} | Page 3</Text>
        </View>
      </Page>

      {/* Page 4 - Notary and Self-Proving Affidavit */}
      {(willReqs?.notaryRequired || willReqs?.selfProvingAllowed) && (
        <Page size="LETTER" style={styles.page}>
          {willReqs?.notaryRequired && (
            <NotaryAcknowledgment
              state={data.state}
              principalName={(r.fullName as string) || "[YOUR NAME]"}
            />
          )}

          {willReqs?.selfProvingAllowed && (
            <SelfProvingAffidavit
              state={data.state}
              documentType="will"
              principalName={(r.fullName as string) || "[YOUR NAME]"}
            />
          )}

          <View style={styles.footer}>
            <Text>Last Will and Testament of {r.fullName || "[YOUR NAME]"} | Page 4</Text>
          </View>
        </Page>
      )}
    </Document>
  );
}

// ============================================================================
// HEALTHCARE POWER OF ATTORNEY
// ============================================================================
function HealthcarePOADocument({ data }: { data: LegalDocumentPDFData }) {
  const r = data.responses;
  const requirements = getStateLegalRequirements(data.state as USState);
  const hcReqs = requirements?.healthcare_poa;
  const stateName = STATE_NAMES[data.state as USState] || data.state;
  const documentTitle = hcReqs?.documentName || "Healthcare Power of Attorney";

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{documentTitle}</Text>
          <Text style={styles.subtitle}>with HIPAA Authorization</Text>
          <Text style={styles.stateInfo}>State of {stateName}</Text>
        </View>

        {/* Part I: Designation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part I: Designation of Healthcare Agent</Text>
          <Text style={styles.legalClause}>
            I, {r.fullName || "[YOUR FULL LEGAL NAME]"}, of {r.address || "[YOUR ADDRESS]"}, date of
            birth {r.dateOfBirth || "[DATE OF BIRTH]"}, hereby revoke any prior healthcare power of
            attorney and designate the following individual as my Healthcare Agent to make
            healthcare decisions for me when I am unable to make or communicate my own healthcare
            decisions:
          </Text>

          <View style={styles.subSection}>
            <Text style={styles.subSectionLabel}>Primary Healthcare Agent:</Text>
            <Text style={styles.articleContent}>
              Name: {r.agentName || "[AGENT NAME]"}
              {"\n"}
              Relationship: {r.agentRelationship || "[RELATIONSHIP]"}
              {"\n"}
              Address: {r.agentAddress || "[ADDRESS]"}
              {"\n"}
              Phone: {r.agentPhone || "[PHONE]"}
              {r.agentEmail ? `\nEmail: ${r.agentEmail}` : ""}
            </Text>
          </View>

          {r.alternateAgentName && (
            <View style={styles.subSection}>
              <Text style={styles.subSectionLabel}>Successor Healthcare Agent:</Text>
              <Text style={styles.articleContent}>
                Name: {r.alternateAgentName}
                {"\n"}
                Phone: {r.alternateAgentPhone || "[PHONE]"}
              </Text>
            </View>
          )}
        </View>

        {/* Part II: Grant of Authority */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part II: Grant of Authority</Text>
          <Text style={styles.legalClause}>
            I grant my Healthcare Agent full power and authority to make any and all healthcare
            decisions for me, including but not limited to:
          </Text>
          <View style={{ marginTop: 6 }}>
            <Checkbox
              checked={r.powerConsent === true}
              label="Consent to or refuse any medical treatment, procedure, test, or medication"
            />
            <Checkbox
              checked={r.powerWithdraw === true}
              label="Withdraw or withhold life-sustaining treatment, including artificial nutrition and hydration"
            />
            <Checkbox
              checked={r.powerAccess === true}
              label="Access, request, receive, and review any medical information and records"
            />
            <Checkbox
              checked={r.powerFacility === true}
              label="Choose, employ, and discharge healthcare providers and facilities"
            />
            <Checkbox
              checked={r.powerOrgan === true}
              label="Make decisions regarding organ and tissue donation"
            />
            <Checkbox
              checked={r.powerBurial === true}
              label="Make decisions regarding autopsy and disposition of remains"
            />
          </View>
          {r.limitationsOnPowers && (
            <View style={[styles.subSection, { marginTop: 8 }]}>
              <Text style={styles.subSectionLabel}>Limitations on Agent's Powers:</Text>
              <Text style={styles.articleContent}>{r.limitationsOnPowers}</Text>
            </View>
          )}
        </View>

        {/* Part III: HIPAA Authorization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part III: HIPAA Authorization</Text>
          <Text style={styles.legalClause}>
            Pursuant to the Health Insurance Portability and Accountability Act of 1996 ("HIPAA"),
            45 C.F.R. Section 164.502(g), I authorize any healthcare provider, health plan,
            healthcare clearinghouse, or any other covered entity to release and disclose to my
            Healthcare Agent any and all of my individually identifiable health information and
            medical records, including but not limited to:
          </Text>
          <View style={styles.subSection}>
            <Text style={styles.articleContent}>
              (a) All medical records from all healthcare providers;{"\n"}
              (b) Mental health records (to the extent permitted by law);{"\n"}
              (c) Drug and alcohol treatment records (to the extent permitted by 42 CFR Part 2);
              {"\n"}
              (d) HIV/AIDS testing and treatment records;{"\n"}
              (e) Genetic testing information;{"\n"}
              (f) Billing and payment information;{"\n"}
              (g) All communications with healthcare providers.
            </Text>
          </View>
          <Text style={[styles.legalClause, { marginTop: 8 }]}>
            The purpose of this authorization is to permit my Healthcare Agent to make informed
            healthcare decisions on my behalf. This authorization shall remain in effect until
            revoked by me or until my death, and shall survive my death to the extent necessary to
            effectuate my wishes regarding organ donation and disposition of remains.
          </Text>
          {r.additionalHipaaRecipients && (
            <View style={[styles.subSection, { marginTop: 8 }]}>
              <Text style={styles.subSectionLabel}>
                Additional Persons Authorized to Receive Medical Information:
              </Text>
              <Text style={styles.articleContent}>{r.additionalHipaaRecipients}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text>
            {documentTitle} of {r.fullName || "[YOUR NAME]"} | Page 1
          </Text>
        </View>
      </Page>

      {/* Page 2 */}
      <Page size="LETTER" style={styles.page}>
        {/* Part IV: Treatment Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part IV: Guidance for Healthcare Agent</Text>
          <Text style={styles.legalClause}>
            In making healthcare decisions on my behalf, my Healthcare Agent should consider the
            following values and preferences:
          </Text>
          {r.generalPreferences && (
            <View style={styles.subSection}>
              <Text style={styles.subSectionLabel}>General Treatment Philosophy:</Text>
              <Text style={styles.articleContent}>{r.generalPreferences}</Text>
            </View>
          )}
          {r.religiousConsiderations && (
            <View style={styles.subSection}>
              <Text style={styles.subSectionLabel}>Religious/Cultural Considerations:</Text>
              <Text style={styles.articleContent}>{r.religiousConsiderations}</Text>
            </View>
          )}
          {r.specialInstructions && (
            <View style={styles.subSection}>
              <Text style={styles.subSectionLabel}>Special Instructions:</Text>
              <Text style={styles.articleContent}>{r.specialInstructions}</Text>
            </View>
          )}
        </View>

        {/* Part V: Fiduciary Duties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part V: Agent's Duties and Liability</Text>
          <Text style={styles.legalClause}>
            My Healthcare Agent is a fiduciary who must act in my best interest, consistent with my
            known wishes. My Healthcare Agent shall not be liable for any acts performed in good
            faith pursuant to this document, except for willful misconduct or gross negligence.
            Healthcare providers and other third parties who rely in good faith on decisions made by
            my Healthcare Agent shall not be subject to civil or criminal liability or discipline
            for unprofessional conduct.
          </Text>
        </View>

        {/* Part VI: Nomination of Guardian */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part VI: Nomination of Guardian</Text>
          <Text style={styles.legalClause}>
            If it becomes necessary for a court to appoint a guardian of my person, I nominate my
            Healthcare Agent, or if unavailable, my successor Healthcare Agent, to serve as
            guardian. I request that the court give substantial weight to my nomination.
          </Text>
        </View>

        {/* Part VII: Revocation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part VII: Revocation and Amendment</Text>
          <Text style={styles.legalClause}>
            I may revoke this Healthcare Power of Attorney at any time by: (a) executing a written
            revocation; (b) destroying this document; (c) executing a subsequent Healthcare Power of
            Attorney; or (d) orally informing my attending physician of my intent to revoke.
            Revocation shall be effective upon communication to my Healthcare Agent or healthcare
            provider.
          </Text>
        </View>

        {/* Signature */}
        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>Principal's Signature</Text>
          <Text style={styles.legalClause}>
            I sign this Healthcare Power of Attorney voluntarily. I understand its purpose and
            effect. I am of sound mind and at least eighteen (18) years of age.
          </Text>
          <View style={[styles.signatureBlock, { marginTop: 12 }]}>
            <View style={styles.signatureRow}>
              <View style={styles.signatureColumn}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>Principal Signature</Text>
              </View>
              <View style={styles.signatureColumn}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>Date</Text>
              </View>
            </View>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>
              Printed Name: {r.fullName || "[YOUR FULL LEGAL NAME]"}
            </Text>
          </View>
        </View>

        {/* Witness Attestation */}
        <WitnessAttestation
          count={hcReqs?.witnessCount || 2}
          state={data.state}
          documentType="healthcare power of attorney"
          testatorName={(r.fullName as string) || "[PRINCIPAL NAME]"}
        />

        {hcReqs?.notaryRequired && (
          <NotaryAcknowledgment
            state={data.state}
            principalName={(r.fullName as string) || "[YOUR NAME]"}
          />
        )}

        <View style={styles.footer}>
          <Text>
            {documentTitle} of {r.fullName || "[YOUR NAME]"} | Page 2
          </Text>
        </View>
      </Page>
    </Document>
  );
}

// ============================================================================
// DURABLE POWER OF ATTORNEY (FINANCIAL)
// ============================================================================
function FinancialPOADocument({ data }: { data: LegalDocumentPDFData }) {
  const r = data.responses;
  const requirements = getStateLegalRequirements(data.state as USState);
  const finReqs = requirements?.financial_poa;
  const stateName = STATE_NAMES[data.state as USState] || data.state;
  const documentTitle = finReqs?.documentName || "Durable Power of Attorney";

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{documentTitle}</Text>
          <Text style={styles.subtitle}>for Financial Matters</Text>
          <Text style={styles.stateInfo}>State of {stateName}</Text>
        </View>

        {/* Principal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article I: Appointment of Agent</Text>
          <Text style={styles.legalClause}>
            I, {r.fullName || "[YOUR FULL LEGAL NAME]"}, of {r.address || "[YOUR ADDRESS]"}, date of
            birth {r.dateOfBirth || "[DATE OF BIRTH]"}, Social Security Number ending in [LAST 4
            DIGITS], hereby revoke any prior general power of attorney and appoint the following
            person as my Agent (Attorney-in-Fact) to act for me in any lawful way with respect to
            the powers designated below:
          </Text>

          <View style={styles.subSection}>
            <Text style={styles.subSectionLabel}>Primary Agent:</Text>
            <Text style={styles.articleContent}>
              Name: {r.agentName || "[AGENT NAME]"}
              {"\n"}
              Relationship: {r.agentRelationship || "[RELATIONSHIP]"}
              {"\n"}
              Address: {r.agentAddress || "[ADDRESS]"}
              {"\n"}
              Phone: {r.agentPhone || "[PHONE]"}
            </Text>
          </View>

          {r.alternateAgentName && (
            <View style={styles.subSection}>
              <Text style={styles.subSectionLabel}>Successor Agent:</Text>
              <Text style={styles.articleContent}>
                Name: {r.alternateAgentName}
                {"\n"}
                Phone: {r.alternateAgentPhone || "[PHONE]"}
              </Text>
            </View>
          )}
        </View>

        {/* Powers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article II: Powers Granted</Text>
          <Text style={styles.legalClause}>
            I grant my Agent the following specific powers (checked items indicate granted powers):
          </Text>
          <View style={{ marginTop: 6 }}>
            <Checkbox
              checked={r.powerBanking === true}
              label="BANKING: Open, close, and manage bank accounts; make deposits and withdrawals; sign checks; access safe deposit boxes; wire funds"
            />
            <Checkbox
              checked={r.powerRealEstate === true}
              label="REAL PROPERTY: Buy, sell, lease, manage, improve, mortgage, or otherwise deal with real estate; execute deeds and contracts"
            />
            <Checkbox
              checked={r.powerInvestments === true}
              label="INVESTMENTS: Buy, sell, and manage stocks, bonds, mutual funds; manage brokerage and retirement accounts"
            />
            <Checkbox
              checked={r.powerTaxes === true}
              label="TAXES: Prepare, sign, and file tax returns; represent me before tax authorities; make tax elections"
            />
            <Checkbox
              checked={r.powerInsurance === true}
              label="INSURANCE: Purchase, maintain, modify, cancel, or cash in insurance policies; file claims; change beneficiaries"
            />
            <Checkbox
              checked={r.powerBusiness === true}
              label="BUSINESS: Conduct business affairs; form or dissolve business entities; sign contracts; hire employees"
            />
            <Checkbox
              checked={r.powerGovernment === true}
              label="GOVERNMENT BENEFITS: Apply for and manage Social Security, Medicare, Medicaid, veterans benefits"
            />
            <Checkbox
              checked={r.powerGifts === true}
              label="GIFTS: Make gifts on my behalf subject to limitations below"
            />
          </View>
          {r.giftLimitations && (
            <View style={[styles.subSection, { marginTop: 8 }]}>
              <Text style={styles.subSectionLabel}>Gift Limitations:</Text>
              <Text style={styles.articleContent}>{r.giftLimitations}</Text>
            </View>
          )}
        </View>

        {/* Durability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article III: Durability Clause</Text>
          <Text style={styles.legalClause}>
            THIS IS A DURABLE POWER OF ATTORNEY. THIS POWER OF ATTORNEY SHALL NOT BE AFFECTED BY MY
            SUBSEQUENT DISABILITY OR INCAPACITY. This Power of Attorney shall remain in full force
            and effect unless and until revoked by me in writing.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>
            {documentTitle} of {r.fullName || "[YOUR NAME]"} | Page 1
          </Text>
        </View>
      </Page>

      {/* Page 2 */}
      <Page size="LETTER" style={styles.page}>
        {/* Effective Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article IV: Effective Date</Text>
          <Text style={styles.legalClause}>
            {r.effectiveTiming === "immediate"
              ? "This Power of Attorney is effective IMMEDIATELY upon execution and delivery to my Agent."
              : "This Power of Attorney shall become effective ONLY UPON A DETERMINATION THAT I AM INCAPACITATED (Springing Power of Attorney). Incapacity shall be determined by written certification of two (2) licensed physicians who have personally examined me and determined that I am unable to manage my property and financial affairs due to mental or physical incapacity."}
          </Text>
          {r.incapacityDetermination && r.effectiveTiming !== "immediate" && (
            <View style={[styles.subSection, { marginTop: 8 }]}>
              <Text style={styles.subSectionLabel}>Incapacity Determination Method:</Text>
              <Text style={styles.articleContent}>{r.incapacityDetermination}</Text>
            </View>
          )}
        </View>

        {/* Fiduciary Duties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article V: Agent's Duties and Standards</Text>
          <Text style={styles.legalClause}>
            My Agent is a fiduciary who must: (a) act in my best interest; (b) act in good faith;
            (c) act only within the scope of authority granted herein; (d) attempt to preserve my
            estate plan, to the extent known; (e) keep my property separate from the Agent's
            property; and (f) keep records of all transactions.
            {r.accountingRequired
              ? " My Agent shall maintain records of all transactions and provide an accounting upon request."
              : ""}
          </Text>
        </View>

        {/* Limitations */}
        {r.limitations && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article VI: Limitations on Powers</Text>
            <Text style={styles.legalClause}>{r.limitations}</Text>
          </View>
        )}

        {/* Third-Party Reliance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article VII: Third-Party Reliance</Text>
          <Text style={styles.legalClause}>
            Any third party who receives a copy of this Power of Attorney may rely upon it without
            further investigation. Third parties are protected in relying upon the representations
            of my Agent as to matters relating to the agency. Any third party may rely upon this
            document until that party has received written notice of termination, revocation, or
            expiration.
          </Text>
        </View>

        {/* Revocation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article VIII: Revocation</Text>
          <Text style={styles.legalClause}>
            I may revoke this Power of Attorney at any time by a written instrument delivered to my
            Agent. Such revocation shall be effective upon actual notice to my Agent. This Power of
            Attorney automatically revokes any prior general power of attorney I have executed.
          </Text>
        </View>

        {/* Governing Law */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article IX: Governing Law</Text>
          <Text style={styles.legalClause}>
            This Power of Attorney shall be construed in accordance with the laws of the State of{" "}
            {stateName}
            {finReqs?.specialRequirements
              ? `, including ${finReqs.specialRequirements}`
              : ", including applicable provisions of the Uniform Power of Attorney Act if adopted"}
            .
          </Text>
        </View>

        {/* Signature */}
        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>Principal's Signature</Text>
          <Text style={styles.legalClause}>
            I sign this Durable Power of Attorney voluntarily. I understand that this document gives
            my Agent broad powers to manage my financial affairs. I have read and understand this
            document.
          </Text>
          <View style={[styles.signatureBlock, { marginTop: 12 }]}>
            <View style={styles.signatureRow}>
              <View style={styles.signatureColumn}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>Principal Signature</Text>
              </View>
              <View style={styles.signatureColumn}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>Date</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Witnesses if required */}
        {finReqs && finReqs.witnessCount > 0 && (
          <WitnessAttestation
            count={finReqs.witnessCount}
            state={data.state}
            documentType="power of attorney"
            testatorName={(r.fullName as string) || "[PRINCIPAL NAME]"}
          />
        )}

        {/* Notary */}
        {finReqs?.notaryRequired && (
          <NotaryAcknowledgment
            state={data.state}
            principalName={(r.fullName as string) || "[YOUR NAME]"}
          />
        )}

        <View style={styles.footer}>
          <Text>
            {documentTitle} of {r.fullName || "[YOUR NAME]"} | Page 2
          </Text>
        </View>
      </Page>
    </Document>
  );
}

// ============================================================================
// ADVANCE HEALTHCARE DIRECTIVE (LIVING WILL)
// ============================================================================
function AdvanceDirectiveDocument({ data }: { data: LegalDocumentPDFData }) {
  const r = data.responses;
  const requirements = getStateLegalRequirements(data.state as USState);
  const adReqs = requirements?.advance_directive;
  const stateName = STATE_NAMES[data.state as USState] || data.state;
  const documentTitle = adReqs?.documentName || "Advance Healthcare Directive";

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{documentTitle}</Text>
          <Text style={styles.subtitle}>(Living Will Declaration)</Text>
          <Text style={styles.stateInfo}>State of {stateName}</Text>
        </View>

        {/* Part I: Declaration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part I: Declaration</Text>
          <Text style={styles.legalClause}>
            I, {r.fullName || "[YOUR FULL LEGAL NAME]"}, of {r.address || "[YOUR ADDRESS]"}, being
            of sound mind and at least eighteen (18) years of age, willfully and voluntarily make
            known my desires regarding my medical treatment in the event I am unable to communicate
            my wishes. I understand the full import of this Advance Directive and intend to be
            legally bound by its terms.
          </Text>
        </View>

        {/* Part II: Definitions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part II: Definitions</Text>
          <Text style={styles.definitionTerm}>"Terminal Condition"</Text>
          <Text style={styles.definitionText}>
            means an incurable and irreversible condition that, in the opinion of my attending
            physician and one additional physician, will result in my death within a relatively
            short period of time without life-sustaining treatment.
          </Text>
          <Text style={styles.definitionTerm}>"Permanent Unconsciousness"</Text>
          <Text style={styles.definitionText}>
            means an irreversible condition in which I am permanently unconscious with no reasonable
            medical expectation of regaining consciousness, including persistent vegetative state
            and irreversible coma.
          </Text>
          <Text style={styles.definitionTerm}>"Life-Sustaining Treatment"</Text>
          <Text style={styles.definitionText}>
            means any medical treatment that serves only to prolong the dying process, including
            mechanical ventilation, CPR, artificial nutrition and hydration, dialysis, and
            antibiotics.
          </Text>
          <Text style={styles.definitionTerm}>"Comfort Care"</Text>
          <Text style={styles.definitionText}>
            means treatment to maintain personal hygiene, alleviate pain and suffering, including
            pain medication, even if such treatment may hasten my death.
          </Text>
        </View>

        {/* Part III: Life-Sustaining Treatment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part III: Instructions for Treatment</Text>
          <Text style={styles.legalClause}>
            If I am in a TERMINAL CONDITION, PERMANENTLY UNCONSCIOUS, or have an END-STAGE CONDITION
            with no reasonable prospect of recovery, I direct the following:
          </Text>

          <View style={styles.subSection}>
            <Text style={styles.subSectionLabel}>General Preference:</Text>
            <Text style={styles.articleContent}>
              {r.lifeSupportPreference === "all_measures"
                ? "I WANT all life-prolonging treatments to be provided."
                : r.lifeSupportPreference === "comfort_only"
                  ? "I want COMFORT CARE ONLY. I do NOT want life-prolonging treatment."
                  : "I want life-prolonging treatment tried for a reasonable period, then comfort care only if there is no improvement."}
            </Text>
          </View>

          <View style={styles.subSection}>
            <Text style={styles.subSectionLabel}>Specific Treatment Instructions:</Text>
            <Text style={styles.articleContent}>
              CPR (Cardiopulmonary Resuscitation):{" "}
              {r.cpr === "yes"
                ? "YES, attempt CPR"
                : r.cpr === "no"
                  ? "NO (DNR - Do Not Resuscitate)"
                  : "Let my agent decide"}
              {"\n"}
              Mechanical Ventilation:{" "}
              {r.ventilator === "yes"
                ? "YES"
                : r.ventilator === "no"
                  ? "NO"
                  : r.ventilator === "trial"
                    ? "Trial period only"
                    : "Let my agent decide"}
              {"\n"}
              Artificial Nutrition/Hydration:{" "}
              {r.feedingTube === "yes"
                ? "YES"
                : r.feedingTube === "no"
                  ? "NO"
                  : r.feedingTube === "trial"
                    ? "Trial period only"
                    : "Let my agent decide"}
              {"\n"}
              Dialysis:{" "}
              {r.dialysis === "yes"
                ? "YES"
                : r.dialysis === "no"
                  ? "NO"
                  : r.dialysis === "trial"
                    ? "Trial period only"
                    : "Let my agent decide"}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            {documentTitle} of {r.fullName || "[YOUR NAME]"} | Page 1
          </Text>
        </View>
      </Page>

      {/* Page 2 */}
      <Page size="LETTER" style={styles.page}>
        {/* Part IV: Comfort Care */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part IV: Comfort Care and Pain Management</Text>
          <Text style={styles.legalClause}>
            Regardless of other choices above, I ALWAYS want the following comfort care:
          </Text>
          <View style={{ marginTop: 6 }}>
            <Checkbox
              checked={true}
              label="Medication to control pain, even if it may hasten my death"
            />
            <Checkbox
              checked={r.wantHygiene === true}
              label="Measures to maintain personal hygiene and cleanliness"
            />
            <Checkbox checked={r.wantMoisture === true} label="Keep my mouth and lips moist" />
            <Checkbox
              checked={r.wantCompany === true}
              label="Opportunity for family and loved ones to be present"
            />
            <Checkbox checked={r.wantMusic === true} label="Play music or readings I enjoy" />
          </View>

          <View style={styles.subSection}>
            <Text style={styles.subSectionLabel}>Pain Management Preference:</Text>
            <Text style={styles.articleContent}>
              {r.painManagement === "maximum"
                ? "I want MAXIMUM pain relief, even if it may hasten my death or affect my consciousness."
                : r.painManagement === "balanced"
                  ? "I want pain relief BALANCED with maintaining alertness."
                  : "I prefer MINIMAL medication to remain as alert as possible."}
            </Text>
          </View>

          {r.additionalComfort && (
            <View style={styles.subSection}>
              <Text style={styles.subSectionLabel}>Additional Comfort Preferences:</Text>
              <Text style={styles.articleContent}>{r.additionalComfort}</Text>
            </View>
          )}
        </View>

        {/* Part V: Personal Values */}
        {(r.qualityOfLife || r.religiousBeliefs) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Part V: Personal Values and Beliefs</Text>
            {r.qualityOfLife && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionLabel}>What Quality of Life Means to Me:</Text>
                <Text style={styles.articleContent}>{r.qualityOfLife}</Text>
              </View>
            )}
            {r.religiousBeliefs && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionLabel}>
                  Religious/Spiritual Beliefs That Should Guide My Care:
                </Text>
                <Text style={styles.articleContent}>{r.religiousBeliefs}</Text>
              </View>
            )}
            {r.wantClergyVisit && (
              <View style={styles.subSection}>
                <Checkbox checked={true} label="I want clergy/spiritual advisor visits" />
                {r.clergyContact && (
                  <Text style={[styles.articleContent, { marginLeft: 16 }]}>
                    Contact: {r.clergyContact}
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Part VI: Organ Donation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part VI: Organ and Tissue Donation</Text>
          <Text style={styles.legalClause}>
            {r.organDonation === "yes_all"
              ? "I CONSENT to donate any organs and tissues that may be useful for transplantation, therapy, medical research, or education."
              : r.organDonation === "yes_limited"
                ? "I CONSENT to donate ONLY the following organs/tissues: " +
                  (r.organLimitations || "[SPECIFY]")
                : r.organDonation === "no"
                  ? "I DO NOT CONSENT to organ or tissue donation."
                  : "I want my Healthcare Agent to make this decision."}
          </Text>
        </View>

        {/* Part VII: Disposition of Remains */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part VII: Disposition of Remains</Text>
          <Text style={styles.legalClause}>
            My preference for the disposition of my remains is:{" "}
            {r.bodyDisposition === "burial"
              ? "Burial"
              : r.bodyDisposition === "cremation"
                ? "Cremation"
                : r.bodyDisposition === "donation"
                  ? "Donation of body to medical science"
                  : r.bodyDisposition || "[NOT SPECIFIED]"}
            .{r.dispositionDetails ? ` Special instructions: ${r.dispositionDetails}` : ""}
          </Text>
        </View>

        {/* Signature */}
        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>Declarant's Signature</Text>
          <Text style={styles.legalClause}>
            I am emotionally and mentally competent to make this Directive. I understand that this
            Directive does not affect my right to make my own medical decisions as long as I am able
            to do so, and that I may revoke this Directive at any time.
          </Text>
          <View style={[styles.signatureBlock, { marginTop: 12 }]}>
            <View style={styles.signatureRow}>
              <View style={styles.signatureColumn}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>Declarant Signature</Text>
              </View>
              <View style={styles.signatureColumn}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>Date</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Witnesses */}
        <WitnessAttestation
          count={adReqs?.witnessCount || 2}
          state={data.state}
          documentType="advance directive"
          testatorName={(r.fullName as string) || "[DECLARANT NAME]"}
        />

        {adReqs?.notaryRequired && (
          <NotaryAcknowledgment
            state={data.state}
            principalName={(r.fullName as string) || "[YOUR NAME]"}
          />
        )}

        <View style={styles.footer}>
          <Text>
            {documentTitle} of {r.fullName || "[YOUR NAME]"} | Page 2
          </Text>
        </View>
      </Page>
    </Document>
  );
}

// ============================================================================
// REVOCABLE LIVING TRUST
// ============================================================================
function TrustDocument({ data }: { data: LegalDocumentPDFData }) {
  const r = data.responses;
  const requirements = getStateLegalRequirements(data.state as USState);
  const trustReqs = requirements?.revocable_trust;
  const stateName = STATE_NAMES[data.state as USState] || data.state;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Revocable Living Trust Agreement</Text>
          <Text style={styles.subtitle}>{r.trustName || "The [YOUR NAME] Living Trust"}</Text>
          <Text style={styles.stateInfo}>State of {stateName}</Text>
        </View>

        {/* Preamble */}
        <View style={styles.section}>
          <Text style={styles.legalClause}>
            This Revocable Living Trust Agreement (the "Trust" or "Trust Agreement") is made this
            _____ day of _______________, 20___, by and between:
            {"\n\n"}
            GRANTOR: {r.fullName || "[YOUR FULL LEGAL NAME]"}, of {r.address || "[YOUR ADDRESS]"}
            (hereinafter "Grantor" or "Settlor")
            {"\n\n"}
            and
            {"\n\n"}
            TRUSTEE: {r.initialTrustee || r.fullName || "[TRUSTEE NAME]"} (hereinafter "Trustee")
            {"\n\n"}
            This Trust shall be known as "{r.trustName || "The [YOUR NAME] Living Trust"}" dated
            [DATE].
          </Text>
        </View>

        {/* Article I: Trust Property */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article I: Trust Property</Text>
          <Text style={styles.legalClause}>
            Section 1.1. Initial Trust Property. The Grantor hereby transfers to the Trustee the
            property described in Schedule A attached hereto and incorporated herein by reference.
            The Trustee agrees to hold such property, together with any other property subsequently
            transferred to the Trust, as trust property.
            {"\n\n"}
            Section 1.2. Additional Contributions. The Grantor, or any other person with the
            Trustee's consent, may transfer additional property to this Trust at any time during the
            Grantor's lifetime.
          </Text>
        </View>

        {/* Article II: During Grantor's Lifetime */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Article II: Provisions During Grantor's Lifetime and Capacity
          </Text>
          <Text style={styles.legalClause}>
            Section 2.1. During the Grantor's lifetime and while the Grantor has capacity, the
            Trustee shall pay to or apply for the benefit of the Grantor as much of the net income
            and principal of the Trust as the Grantor requests.
            {"\n\n"}
            Section 2.2. Reserved Powers. The Grantor reserves the right to: (a) withdraw all or any
            part of the Trust principal; (b) amend or revoke this Trust in whole or in part; (c)
            change beneficiaries; (d) remove any Trustee and appoint a successor; (e) direct the
            Trustee with respect to investments and distributions.
          </Text>
        </View>

        {/* Article III: During Incapacity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Article III: Provisions During Grantor's Incapacity
          </Text>
          <Text style={styles.legalClause}>
            Section 3.1. Determination of Incapacity. The Grantor shall be considered incapacitated
            when two licensed physicians certify in writing that the Grantor is unable to manage
            financial affairs due to mental or physical infirmity.
            {"\n\n"}
            Section 3.2. Management During Incapacity. During incapacity: (a) the Trustee shall
            manage the Trust estate for the Grantor's benefit; (b) pay net income to or for the
            Grantor; (c) pay principal as needed for health, education, maintenance, and support.
            {r.incapacityProvisions
              ? `\n\nSection 3.3. Special Instructions: ${r.incapacityProvisions}`
              : ""}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>{r.trustName || "Living Trust"} | Page 1</Text>
        </View>
      </Page>

      {/* Page 2 */}
      <Page size="LETTER" style={styles.page}>
        {/* Article IV: Distribution Upon Death */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article IV: Distribution Upon Grantor's Death</Text>
          <Text style={styles.legalClause}>
            Section 4.1. Payment of Debts and Expenses. The Trustee may pay from the Trust estate
            the Grantor's legally enforceable debts, funeral expenses, and costs of administration.
            {"\n\n"}
            Section 4.2. Specific Distributions. [Any specific distributions to be inserted]
            {"\n\n"}
            Section 4.3. Residuary Distribution. After specific distributions, the Trustee shall
            distribute the remaining Trust estate as follows:
            {"\n"}
            Primary Beneficiary: {r.primaryBeneficiary || "[PRIMARY BENEFICIARY]"}
            {r.primaryRelationship ? ` (${r.primaryRelationship})` : ""}
            {r.primaryPercentage ? ` - ${r.primaryPercentage}%` : ""}
            {r.additionalBeneficiaries ? `\nAdditional: ${r.additionalBeneficiaries}` : ""}
            {r.contingentBeneficiary
              ? `\nContingent: ${r.contingentBeneficiary}`
              : "\nContingent: To Grantor's descendants, per stirpes"}
            {"\n\n"}
            Section 4.4. Distribution Timing:{" "}
            {r.distributionTiming === "immediate"
              ? "Immediately upon Grantor's death"
              : r.distributionTiming === "age_25"
                ? "When beneficiary reaches age 25"
                : r.distributionTiming === "age_30"
                  ? "When beneficiary reaches age 30"
                  : r.distributionTiming === "staged"
                    ? `Staged: ${r.stagedDetails || "[SPECIFY]"}`
                    : "As determined by Trustee"}
            {"\n\n"}
            Section 4.5. Survival Requirement. No beneficiary shall be entitled to any distribution
            unless such beneficiary survives the Grantor by thirty (30) days.
          </Text>
        </View>

        {/* Article V: Trustee Provisions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article V: Trustee Provisions</Text>
          <Text style={styles.legalClause}>
            Section 5.1. Successor Trustees. If the initial Trustee is unable or unwilling to serve:
            {"\n"}
            First Successor: {r.successorTrustee || "[SUCCESSOR TRUSTEE]"}
            {r.successorRelationship ? ` (${r.successorRelationship})` : ""}
            {r.secondSuccessorTrustee ? `\nSecond Successor: ${r.secondSuccessorTrustee}` : ""}
            {"\n\n"}
            Section 5.2. Trustee Powers. The Trustee shall have all powers conferred by law,
            including power to sell, lease, invest, borrow, compromise claims, employ professionals,
            and make distributions in cash or in kind.
            {"\n\n"}
            Section 5.3. Compensation. The Trustee shall be entitled to reasonable compensation.
            {"\n\n"}
            Section 5.4. Bond Waiver. No Trustee shall be required to post bond.
          </Text>
        </View>

        {/* Article VI: Spendthrift */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article VI: Spendthrift Provisions</Text>
          <Text style={styles.legalClause}>
            No beneficiary shall have any right to anticipate, alienate, encumber, or assign any
            interest in the Trust, and no interest of any beneficiary shall be subject to the claims
            of creditors or others, to the maximum extent permitted by law.
          </Text>
        </View>

        {/* Article VII: Amendment and Revocation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article VII: Amendment and Revocation</Text>
          <Text style={styles.legalClause}>
            The Grantor reserves the right to amend or revoke this Trust at any time during the
            Grantor's lifetime, provided the Grantor has capacity. Any amendment must be in writing,
            signed by the Grantor, and delivered to the Trustee. This Trust shall become irrevocable
            upon the Grantor's death.
          </Text>
        </View>

        {/* Governing Law */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article VIII: Governing Law</Text>
          <Text style={styles.legalClause}>
            This Trust shall be governed by the laws of the State of {stateName}.
            {trustReqs?.specialRequirements ? ` ${trustReqs.specialRequirements}` : ""}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>{r.trustName || "Living Trust"} | Page 2</Text>
        </View>
      </Page>

      {/* Page 3 - Signatures */}
      <Page size="LETTER" style={styles.page}>
        {/* Signature */}
        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>Execution</Text>
          <Text style={styles.legalClause}>
            IN WITNESS WHEREOF, the Grantor and Trustee have executed this Trust Agreement as of the
            date first written above.
          </Text>

          <View style={[styles.signatureBlock, { marginTop: 20 }]}>
            <Text style={styles.fieldLabel}>GRANTOR:</Text>
            <View style={styles.signatureRow}>
              <View style={styles.signatureColumn}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>{r.fullName || "[GRANTOR NAME]"}, Grantor</Text>
              </View>
              <View style={styles.signatureColumn}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>Date</Text>
              </View>
            </View>
          </View>

          <View style={[styles.signatureBlock, { marginTop: 15 }]}>
            <Text style={styles.fieldLabel}>TRUSTEE:</Text>
            <View style={styles.signatureRow}>
              <View style={styles.signatureColumn}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>
                  {r.initialTrustee || r.fullName || "[TRUSTEE NAME]"}, Trustee
                </Text>
              </View>
              <View style={styles.signatureColumn}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>Date</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notary */}
        {trustReqs?.notaryRequired && (
          <NotaryAcknowledgment
            state={data.state}
            principalName={(r.fullName as string) || "[GRANTOR NAME]"}
          />
        )}

        {/* Schedule A placeholder */}
        <View style={[styles.section, { marginTop: 30 }]}>
          <Text style={styles.sectionTitle}>Schedule A: Initial Trust Property</Text>
          <Text style={styles.legalClause}>
            The following property is hereby transferred to the Trust:
            {"\n\n"}
            {r.realEstate ? `Real Estate:\n${r.realEstate}\n\n` : ""}
            {r.bankAccounts ? `Bank Accounts:\n${r.bankAccounts}\n\n` : ""}
            {r.investments ? `Investment Accounts:\n${r.investments}\n\n` : ""}
            {r.otherAssets ? `Other Assets:\n${r.otherAssets}\n\n` : ""}
            [LIST ALL ASSETS TO BE TRANSFERRED TO TRUST]
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>{r.trustName || "Living Trust"} | Page 3</Text>
        </View>
      </Page>
    </Document>
  );
}

// ============================================================================
// POUR-OVER WILL
// ============================================================================
function PourOverWillDocument({ data }: { data: LegalDocumentPDFData }) {
  const r = data.responses;
  const requirements = getStateLegalRequirements(data.state as USState);
  const willReqs = requirements?.will;
  const stateName = STATE_NAMES[data.state as USState] || data.state;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Pour-Over Last Will and Testament</Text>
          <Text style={styles.subtitle}>of {r.fullName || "[YOUR FULL LEGAL NAME]"}</Text>
          <Text style={styles.stateInfo}>State of {stateName}</Text>
        </View>

        {/* Declaration */}
        <View style={styles.section}>
          <Text style={styles.legalClause}>
            I, {r.fullName || "[YOUR FULL LEGAL NAME]"}, a resident of{" "}
            {r.address || "[YOUR ADDRESS]"}, State of {stateName}, being of sound mind and memory,
            do hereby make, publish, and declare this instrument to be my Last Will and Testament,
            hereby revoking all prior wills and codicils.
          </Text>
        </View>

        {/* Article I: Trust Identification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article I: Identification of Trust</Text>
          <Text style={styles.legalClause}>
            I have created a Revocable Living Trust known as "{r.trustName || "[TRUST NAME]"}" dated{" "}
            {r.trustDate || "[DATE OF TRUST]"} (the "Trust"). The Trust may have been amended from
            time to time. I refer to the Trust as it exists at the time of my death, including any
            amendments thereto.
          </Text>
        </View>

        {/* Article II: Pour-Over Provision */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article II: Pour-Over Provision</Text>
          <Text style={styles.legalClause}>
            I give, devise, and bequeath all the rest, residue, and remainder of my estate, both
            real and personal, of whatever kind and wherever situated, which I may own or have the
            right to dispose of at the time of my death (including all failed or lapsed gifts, and
            including any property over which I have a power of appointment), to the then-acting
            Trustee or Trustees of the Trust, to be added to the trust estate and held,
            administered, and distributed in accordance with the provisions of the Trust as it
            exists at my death (including any amendments made prior to my death), and not as it
            exists at the date of this Will.
            {"\n\n"}
            If for any reason this pour-over disposition fails or is invalid, I give such property
            to the persons who would have received it under the Trust as if the pour-over had been
            valid.
          </Text>
        </View>

        {/* Article III: Coordination */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article III: Coordination with Trust</Text>
          <Text style={styles.legalClause}>
            This Will is intended to work in conjunction with the Trust. The terms of the Trust
            shall control the distribution of any property passing under this Will, and this Will
            shall be interpreted accordingly.
          </Text>
        </View>

        {/* Article IV: Executor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article IV: Executor</Text>
          <Text style={styles.legalClause}>
            I appoint {r.executorName || "[EXECUTOR NAME]"}
            {r.executorRelationship ? ` (${r.executorRelationship})` : ""} as Executor of this Will.
            If this person is unable or unwilling to serve, I appoint{" "}
            {r.alternateExecutor || "[ALTERNATE EXECUTOR]"} as successor Executor.
            {"\n\n"}
            My Executor shall have all powers necessary to administer my estate, including powers
            granted by the laws of {stateName}, without court supervision. No Executor shall be
            required to furnish bond.
          </Text>
        </View>

        {/* Article V: Guardian */}
        {r.hasMinorChildren && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article V: Guardian of Minor Children</Text>
            <Text style={styles.legalClause}>
              I nominate {r.guardianName || "[GUARDIAN NAME]"} as Guardian of the person of any
              minor child of mine. If this person is unable or unwilling to serve, I nominate{" "}
              {r.alternateGuardian || "[ALTERNATE GUARDIAN]"} as successor Guardian. No Guardian
              shall be required to furnish bond.
            </Text>
          </View>
        )}

        {/* Article VI: Taxes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Article {r.hasMinorChildren ? "VI" : "V"}: Taxes and Expenses
          </Text>
          <Text style={styles.legalClause}>
            All estate, inheritance, and death taxes, and all expenses of administration, shall be
            paid from the residuary estate passing to the Trust, and shall not be apportioned or
            charged against any specific gift or any beneficiary.
          </Text>
        </View>

        {/* Signature */}
        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>Testator's Signature</Text>
          <Text style={styles.legalClause}>
            IN WITNESS WHEREOF, I have signed this Pour-Over Will on this _____ day of
            _______________, 20___.
          </Text>
          <View style={[styles.signatureBlock, { marginTop: 15 }]}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>{r.fullName || "[YOUR NAME]"}, Testator</Text>
          </View>
        </View>

        {/* Witness Attestation */}
        <WitnessAttestation
          count={willReqs?.witnessCount || 2}
          state={data.state}
          documentType="pour-over will"
          testatorName={(r.fullName as string) || "[TESTATOR NAME]"}
        />

        <View style={styles.footer}>
          <Text>
            DRAFT - FOR ATTORNEY REVIEW | Pour-Over Will of {r.fullName || "[YOUR NAME]"} | Page 1
          </Text>
        </View>
      </Page>

      {/* Page 2 - Notary and Self-Proving */}
      {(willReqs?.notaryRequired || willReqs?.selfProvingAllowed) && (
        <Page size="LETTER" style={styles.page}>
          {willReqs?.notaryRequired && (
            <NotaryAcknowledgment
              state={data.state}
              principalName={(r.fullName as string) || "[YOUR NAME]"}
            />
          )}

          {willReqs?.selfProvingAllowed && (
            <SelfProvingAffidavit
              state={data.state}
              documentType="pour-over will"
              principalName={(r.fullName as string) || "[YOUR NAME]"}
            />
          )}

          <View style={styles.footer}>
            <Text>
              DRAFT - FOR ATTORNEY REVIEW | Pour-Over Will of {r.fullName || "[YOUR NAME]"} | Page 2
            </Text>
          </View>
        </Page>
      )}
    </Document>
  );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================
export function LegalDocumentPDF({ data }: { data: LegalDocumentPDFData }) {
  switch (data.documentType) {
    case "will":
      return <WillDocument data={data} />;
    case "healthcare_poa":
      return <HealthcarePOADocument data={data} />;
    case "financial_poa":
      return <FinancialPOADocument data={data} />;
    case "advance_directive":
      return <AdvanceDirectiveDocument data={data} />;
    case "trust":
      return <TrustDocument data={data} />;
    case "pour_over_will":
      return <PourOverWillDocument data={data} />;
    default:
      return <WillDocument data={data} />;
  }
}

export type { LegalDocumentPDFData };
