"use client";

import { StyleSheet, Text, View } from "@react-pdf/renderer";
import {
  getStateLegalRequirements,
  STATE_NAMES,
  type USState,
} from "@/lib/state-legal-requirements";

// Define styles for the PDF
export const styles = StyleSheet.create({
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

export type DocumentType =
  | "will"
  | "trust"
  | "pour_over_will"
  | "financial_poa"
  | "healthcare_poa"
  | "advance_directive";

export interface LegalDocumentPDFData {
  documentType: DocumentType;
  state: string;
  responses: Record<string, string | boolean>;
  userName: string;
  generatedDate: Date;
}

// Render a checkbox with optional check
export function Checkbox({ checked, label }: { checked: boolean; label: string }) {
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
export function WitnessAttestation({
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
export function NotaryAcknowledgment({
  state,
  principalName,
}: {
  state: string;
  principalName: string;
}) {
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
export function SelfProvingAffidavit({
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

// Treatment row helper for the treatment matrix (used in Advance Directive)
export function TreatmentRow({
  label,
  terminal,
  unconscious,
  endStage,
}: {
  label: string;
  terminal: string | boolean | undefined;
  unconscious: string | boolean | undefined;
  endStage: string | boolean | undefined;
}) {
  const getChoiceText = (choice: string | boolean | undefined) => {
    if (choice === "yes" || choice === true) return "YES";
    if (choice === "no" || choice === false) return "NO";
    if (choice === "trial") return "TRIAL";
    if (choice === "agent") return "AGENT";
    return "---";
  };

  return (
    <View
      style={{
        flexDirection: "row",
        borderBottom: "0.5px solid #ccc",
        paddingVertical: 3,
      }}
    >
      <Text style={{ width: "35%", fontSize: 8 }}>{label}</Text>
      <Text style={{ width: "20%", fontSize: 8, textAlign: "center" }}>
        {getChoiceText(terminal)}
      </Text>
      <Text style={{ width: "22%", fontSize: 8, textAlign: "center" }}>
        {getChoiceText(unconscious)}
      </Text>
      <Text style={{ width: "23%", fontSize: 8, textAlign: "center" }}>
        {getChoiceText(endStage)}
      </Text>
    </View>
  );
}

// Reusable document header component
export function DocumentHeader({
  title,
  subtitle,
  state,
}: {
  title: string;
  subtitle?: string;
  state: string;
}) {
  const stateName = STATE_NAMES[state as USState] || state;
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <Text style={styles.stateInfo}>State of {stateName}</Text>
    </View>
  );
}

// Reusable document footer component
export function DocumentFooter({
  documentName,
  principalName,
  pageNumber,
  generatedDate,
}: {
  documentName: string;
  principalName: string;
  pageNumber?: number;
  generatedDate?: Date;
}) {
  const footer = pageNumber
    ? `${documentName} of ${principalName} | Page ${pageNumber}`
    : generatedDate
      ? `${documentName} of ${principalName} | Generated ${generatedDate.toLocaleDateString()}`
      : `${documentName} of ${principalName}`;

  return (
    <View style={styles.footer}>
      <Text>{footer}</Text>
    </View>
  );
}

// Reusable principal signature section (for declarant/testator/grantor)
export function PrincipalSignatureSection({
  title,
  introText,
  principalName,
  labelText,
}: {
  title: string;
  introText: string;
  principalName: string;
  labelText?: string;
}) {
  return (
    <View style={styles.signatureSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.legalClause}>{introText}</Text>
      <View style={[styles.signatureBlock, { marginTop: 12 }]}>
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
        <View style={[styles.signatureLine, { width: "45%", marginTop: 8 }]} />
        <Text style={styles.signatureLabel}>{labelText || `Printed Name: ${principalName}`}</Text>
      </View>
    </View>
  );
}

// Healthcare-specific witness attestation
export function HealthcareWitnessAttestation({
  count,
  state,
  declarantName,
  specialRequirements,
}: {
  count: number;
  state: string;
  declarantName: string;
  specialRequirements: string | null;
}) {
  const witnesses = Array.from({ length: count }, (_, i) => i + 1);
  const requirements = getStateLegalRequirements(state as USState);
  const minAge = requirements?.advance_directive?.minimumWitnessAge || 18;
  const stateName = STATE_NAMES[state as USState] || state;

  return (
    <View style={styles.witnessSection}>
      <Text style={styles.witnessTitle}>Attestation of Witnesses</Text>
      <Text style={[styles.legalClause, { marginBottom: 8 }]}>
        We, the undersigned witnesses, declare under penalty of perjury under the laws of the State
        of {stateName}:{"\n\n"}
        1. The Declarant, {declarantName || "[DECLARANT NAME]"}, signed this Advance Healthcare
        Directive in our presence, or acknowledged having signed it.
        {"\n\n"}
        2. We believe the Declarant to be of sound mind and to be making this directive voluntarily
        and without duress, fraud, or undue influence.
        {"\n\n"}
        3. We are each at least {minAge} years of age.
        {"\n\n"}
        4. Neither of us is:
        {"\n"}
        {"   "}- The person appointed as healthcare agent in this directive
        {"\n"}
        {"   "}- The Declarant's healthcare provider or an employee of the provider
        {"\n"}
        {"   "}- An operator of a healthcare facility serving the Declarant
        {"\n"}
        {"   "}- An employee of an operator of a healthcare facility serving the Declarant
        {specialRequirements ? `\n\n5. Additional State Requirements: ${specialRequirements}` : ""}
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
