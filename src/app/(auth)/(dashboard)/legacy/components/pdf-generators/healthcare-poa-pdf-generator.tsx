"use client";

import { Document, Page, Text, View } from "@react-pdf/renderer";
import {
  getStateLegalRequirements,
  STATE_NAMES,
  type USState,
} from "@/lib/state-legal-requirements";
import {
  Checkbox,
  DocumentFooter,
  DocumentHeader,
  type LegalDocumentPDFData,
  NotaryAcknowledgment,
  styles,
} from "./shared-components";

export function HealthcarePOAPDFGenerator({ data }: { data: LegalDocumentPDFData }) {
  const r = data.responses;
  const requirements = getStateLegalRequirements(data.state as USState);
  const hcReqs = requirements?.healthcare_poa;
  const stateName = STATE_NAMES[data.state as USState] || data.state;
  const documentTitle = hcReqs?.documentName || "Healthcare Power of Attorney";

  // State-specific mental health notes
  const getMentalHealthNote = (): string => {
    const state = data.state as USState;
    const mentalHealthStates: Record<string, string> = {
      CA: "California law (Probate Code Section 4701) may require a separate psychiatric advance directive for certain mental health treatments.",
      TX: "Texas law may require specific language for mental health treatment authority. Consult Texas Health & Safety Code Chapter 166.",
      NY: "New York recognizes mental health treatment preferences but may require additional documentation for certain treatments.",
      FL: "Florida Statute 765 addresses mental health treatment authority in healthcare surrogates.",
    };
    return (
      mentalHealthStates[state] ||
      "Consult applicable state law regarding mental health treatment authority."
    );
  };

  const mentalHealthNote = getMentalHealthNote();

  // Get mental health limitations text
  const mentalHealthLimitationsText = r.mentalHealthLimitations || "[SPECIFY LIMITATIONS]";
  const facilityLimitationsText = r.facilityLimitations || "[SPECIFY LIMITATIONS]";
  const organSpecificsText = r.organSpecifics || "[SPECIFY ORGANS/TISSUES]";

  return (
    <Document>
      {/* ==================== PAGE 1 ==================== */}
      <Page size="LETTER" style={styles.page}>
        <DocumentHeader
          title={documentTitle}
          subtitle="with HIPAA Authorization and Advance Directives"
          state={data.state}
        />

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
                Relationship: {r.alternateAgentRelationship || "[RELATIONSHIP]"}
                {"\n"}
                Phone: {r.alternateAgentPhone || "[PHONE]"}
                {r.alternateAgentEmail ? `\nEmail: ${r.alternateAgentEmail}` : ""}
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
              <Text style={styles.subSectionLabel}>Limitations on Agent Powers:</Text>
              <Text style={styles.articleContent}>{r.limitationsOnPowers}</Text>
            </View>
          )}
        </View>

        {/* Part III: HIPAA Authorization - Enhanced */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Part III: HIPAA Authorization and Health Information Disclosure
          </Text>
          <Text style={styles.legalClause}>
            Pursuant to the Health Insurance Portability and Accountability Act of 1996 (HIPAA), 45
            C.F.R. Section 164.502(g), and all other applicable federal and state privacy laws, I
            authorize any healthcare provider, health plan, healthcare clearinghouse, pharmacy,
            laboratory, or any other covered entity to release and disclose to my Healthcare Agent
            any and all of my individually identifiable health information and medical records,
            including specifically:
          </Text>
          <View style={styles.subSection}>
            <Text style={styles.articleContent}>
              (a) Complete medical records from all healthcare providers, including physician notes,
              test results, imaging studies, and treatment plans;{"\n"}
              (b) Mental health and psychiatric records, including psychotherapy notes to the extent
              permitted by applicable state law;{"\n"}
              (c) Drug, alcohol, and substance abuse treatment records, including records protected
              under 42 CFR Part 2 (Federal Confidentiality of Substance Use Disorder Patient
              Records);{"\n"}
              (d) HIV/AIDS testing, diagnosis, and treatment records;{"\n"}
              (e) Genetic testing information and results, as protected under the Genetic
              Information Nondiscrimination Act (GINA);{"\n"}
              (f) Sexually transmitted disease diagnosis and treatment records;{"\n"}
              (g) Pharmacy records and medication history;{"\n"}
              (h) Billing, insurance, and payment information;{"\n"}
              (i) Communications with healthcare providers and facilities;{"\n"}
              (j) Any other health information protected under HIPAA or state law.
            </Text>
          </View>
          <Text style={[styles.legalClause, { marginTop: 8 }]}>
            <Text style={{ fontWeight: "bold" }}>Effective Date and Duration: </Text>
            This authorization becomes effective immediately upon my signature and shall remain in
            effect until revoked by me in writing.
            {"\n\n"}
            <Text style={{ fontWeight: "bold" }}>Survival After Death: </Text>
            This authorization shall survive my death to the extent necessary for my Healthcare
            Agent to: (1) effectuate my wishes regarding organ and tissue donation; (2) make
            decisions regarding autopsy; (3) arrange for disposition of my remains; and (4) access
            medical records for estate administration purposes.
            {"\n\n"}
            <Text style={{ fontWeight: "bold" }}>Revocation: </Text>I may revoke this authorization
            at any time by providing written notice to my healthcare providers. Revocation shall not
            affect any actions taken in reliance on this authorization prior to receipt of the
            revocation notice.
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

        <DocumentFooter
          documentName={documentTitle}
          principalName={(r.fullName as string) || "[YOUR NAME]"}
          pageNumber={1}
        />
      </Page>

      {/* ==================== PAGE 2 ==================== */}
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
          {r.specialInstructions && (
            <View style={styles.subSection}>
              <Text style={styles.subSectionLabel}>Special Instructions:</Text>
              <Text style={styles.articleContent}>{r.specialInstructions}</Text>
            </View>
          )}
        </View>

        {/* Part V: Fiduciary Duties */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part V: Agent Duties and Liability</Text>
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

        {/* Part VIII: Mental Health Treatment Authority */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part VIII: Mental Health Treatment Authority</Text>
          <Text style={styles.legalClause}>
            {r.mentalHealthAuthority === "full"
              ? "I grant my Healthcare Agent full authority to make mental health treatment decisions on my behalf, including decisions regarding psychiatric medication, electroconvulsive therapy (ECT), and inpatient psychiatric hospitalization."
              : r.mentalHealthAuthority === "limited"
                ? "I grant my Healthcare Agent authority to make mental health treatment decisions on my behalf with the following limitations: " +
                  mentalHealthLimitationsText
                : "I grant my Healthcare Agent authority to make mental health treatment decisions on my behalf to the extent permitted by law. This includes authority to consent to or refuse psychiatric treatment, medication, and hospitalization."}
            {"\n\n"}
            <Text style={{ fontStyle: "italic" }}>
              State law regarding mental health treatment authority: {mentalHealthNote}
            </Text>
          </Text>
        </View>

        {/* Part IX: Facility Admission Authority */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part IX: Facility Admission Authority</Text>
          <Text style={styles.legalClause}>
            {r.facilityAuthority === "full"
              ? "I grant my Healthcare Agent authority to admit me to or discharge me from any healthcare facility, including hospitals, skilled nursing facilities, assisted living facilities, rehabilitation centers, and memory care facilities."
              : r.facilityAuthority === "limited"
                ? "I grant my Healthcare Agent authority to make facility decisions with the following limitations: " +
                  facilityLimitationsText
                : "I grant my Healthcare Agent authority to make facility admission and discharge decisions on my behalf, including decisions regarding nursing home placement and long-term care facilities."}
            {"\n\n"}I understand that some states require court approval for nursing home placement.
            This authorization is intended to eliminate the need for court proceedings to the extent
            permitted by law. My Healthcare Agent shall consider my preferences for remaining in my
            home or community when making facility decisions.
          </Text>
        </View>

        <DocumentFooter
          documentName={documentTitle}
          principalName={(r.fullName as string) || "[YOUR NAME]"}
          pageNumber={2}
        />
      </Page>

      {/* ==================== PAGE 3 ==================== */}
      <Page size="LETTER" style={styles.page}>
        {/* Part X: Anatomical Gift Declaration */}
        {(r.organDonation === true || r.anatomicalGift === true || r.powerOrgan === true) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Part X: Anatomical Gift Declaration</Text>
            <Text style={styles.legalClause}>
              Under the Uniform Anatomical Gift Act and {stateName} law, I make the following
              anatomical gift to take effect upon my death:
              {"\n\n"}
              {r.organDonationScope === "all"
                ? "I donate ANY NEEDED ORGANS, TISSUES, AND PARTS for transplantation, therapy, medical research, or education."
                : r.organDonationScope === "specific"
                  ? `I donate only the following organs and/or tissues: ${organSpecificsText}`
                  : r.organDonationScope === "research_only"
                    ? "I donate my body and/or tissues for MEDICAL RESEARCH AND EDUCATION ONLY, not for transplantation."
                    : r.organDonation === false
                      ? "I DO NOT wish to make an anatomical gift. I do not donate any organs, tissues, or parts."
                      : "I authorize my Healthcare Agent to make anatomical gift decisions on my behalf after my death."}
              {"\n\n"}I understand that if I have registered as an organ donor through my state
              donor registry or indicated my wishes on my driver license, those wishes may
              supplement or be superseded by this declaration depending on applicable state law.
            </Text>
            {r.organDonationInstructions && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionLabel}>
                  Additional Instructions Regarding Anatomical Gifts:
                </Text>
                <Text style={styles.articleContent}>{r.organDonationInstructions}</Text>
              </View>
            )}
          </View>
        )}

        {/* Part XI: Religious and Cultural Considerations */}
        {(r.religiousConsiderations || r.culturalPreferences || r.dietaryRestrictions) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Part XI: Religious and Cultural Considerations</Text>
            <Text style={styles.legalClause}>
              I request that my Healthcare Agent and all healthcare providers respect the following
              religious, cultural, and personal preferences in my care:
            </Text>
            {r.religiousConsiderations && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionLabel}>Religious Considerations:</Text>
                <Text style={styles.articleContent}>{r.religiousConsiderations}</Text>
              </View>
            )}
            {r.culturalPreferences && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionLabel}>Cultural Preferences:</Text>
                <Text style={styles.articleContent}>{r.culturalPreferences}</Text>
              </View>
            )}
            {r.dietaryRestrictions && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionLabel}>Dietary Restrictions:</Text>
                <Text style={styles.articleContent}>{r.dietaryRestrictions}</Text>
              </View>
            )}
            {r.spiritualCare && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionLabel}>Spiritual Care Preferences:</Text>
                <Text style={styles.articleContent}>{r.spiritualCare}</Text>
              </View>
            )}
          </View>
        )}

        {/* Principal Signature */}
        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>Principal Signature</Text>
          <Text style={styles.legalClause}>
            I sign this Healthcare Power of Attorney voluntarily. I understand its purpose and
            effect. I am of sound mind and at least eighteen (18) years of age. I have read this
            document and understand it to be my Healthcare Power of Attorney, and I intend that my
            Healthcare Agent act on my behalf when I am unable to make or communicate my own
            healthcare decisions.
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

        {/* Enhanced Witness Attestation for Healthcare POA */}
        <View style={styles.witnessSection}>
          <Text style={styles.witnessTitle}>Attestation of Witnesses</Text>
          <Text style={[styles.legalClause, { marginBottom: 10 }]}>
            On the date written below, {r.fullName || "[PRINCIPAL NAME]"}, known to us or proved to
            us on the basis of satisfactory evidence to be the person whose name is signed on the
            foregoing instrument, declared to us that the foregoing instrument was their Healthcare
            Power of Attorney, and requested us to act as witnesses to the same.
            {"\n\n"}
            {r.fullName || "[PRINCIPAL NAME]"} signed this Healthcare Power of Attorney in our
            presence, all of us being present at the same time. We observed the signing of this
            document by {r.fullName || "[PRINCIPAL NAME]"} and by each other. We believe{" "}
            {r.fullName || "[PRINCIPAL NAME]"} to be of sound mind and memory, over the age of
            majority, and under no constraint or undue influence.
            {"\n\n"}
            <Text style={{ fontWeight: "bold" }}>Each witness declares that:</Text>
            {"\n"}
            1. I am at least {hcReqs?.minimumWitnessAge || 18} years of age and competent to be a
            witness;
            {"\n"}
            2. I am NOT the designated Healthcare Agent or Successor Healthcare Agent;{"\n"}
            3. I am NOT a healthcare provider currently providing care to the Principal;{"\n"}
            4. I am NOT an employee of a healthcare facility where the Principal is a patient,
            unless I am a social worker or patient advocate;{"\n"}
            5. I am NOT entitled to any portion of the Principal estate;{"\n"}
            6. I have no claim against the Principal estate.
            {"\n\n"}
            We declare under penalty of perjury under the laws of the State of {stateName} that the
            foregoing is true and correct.
          </Text>

          {/* Witness 1 */}
          <View style={styles.witnessBlock}>
            <Text style={styles.fieldLabel}>Witness 1:</Text>
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

          {/* Witness 2 */}
          <View style={styles.witnessBlock}>
            <Text style={styles.fieldLabel}>Witness 2:</Text>
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
        </View>

        <DocumentFooter
          documentName={documentTitle}
          principalName={(r.fullName as string) || "[YOUR NAME]"}
          pageNumber={3}
        />
      </Page>

      {/* ==================== PAGE 4 ==================== */}
      <Page size="LETTER" style={styles.page}>
        {/* Notary Acknowledgment */}
        {hcReqs?.notaryRequired && (
          <NotaryAcknowledgment
            state={data.state}
            principalName={(r.fullName as string) || "[YOUR NAME]"}
          />
        )}

        {/* Part XII: Agent Acceptance and Acknowledgment */}
        <View style={[styles.section, { marginTop: hcReqs?.notaryRequired ? 20 : 0 }]}>
          <Text style={styles.sectionTitle}>
            Part XII: Healthcare Agent Acceptance and Acknowledgment
          </Text>
          <Text style={styles.legalClause}>
            By signing below, the Healthcare Agent named in this Healthcare Power of Attorney
            acknowledges and agrees to the following:
          </Text>
          <View style={styles.subSection}>
            <Text style={styles.articleContent}>
              1. I have read and understand this Healthcare Power of Attorney;{"\n\n"}
              2. I accept the appointment as Healthcare Agent for the Principal;{"\n\n"}
              3. I understand that I owe a fiduciary duty to the Principal and must act in good
              faith and in the Principal best interests;{"\n\n"}
              4. I will make healthcare decisions consistent with the Principal known wishes,
              values, and preferences as expressed in this document and elsewhere;{"\n\n"}
              5. If the Principal wishes are unknown, I will make decisions based on my assessment
              of the Principal best interests;{"\n\n"}
              6. I will keep the Principal informed of healthcare decisions to the extent the
              Principal is able to understand;{"\n\n"}
              7. I understand the limitations on my authority as stated in this document;{"\n\n"}
              8. I may be liable for any breach of my fiduciary duty or for acting outside the scope
              of my authority.
            </Text>
          </View>

          <View style={[styles.signatureBlock, { marginTop: 15 }]}>
            <Text style={styles.fieldLabel}>PRIMARY HEALTHCARE AGENT ACCEPTANCE:</Text>
            <View style={styles.signatureRow}>
              <View style={styles.signatureColumn}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>Healthcare Agent Signature</Text>
              </View>
              <View style={styles.signatureColumn}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>Date</Text>
              </View>
            </View>
            <View style={[styles.signatureLine, { width: "45%" }]} />
            <Text style={styles.signatureLabel}>Printed Name: {r.agentName || "[AGENT NAME]"}</Text>
          </View>
        </View>

        {/* Successor Agent Acceptance */}
        {r.alternateAgentName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Successor Healthcare Agent Acceptance</Text>
            <Text style={styles.legalClause}>
              By signing below, the Successor Healthcare Agent named in this Healthcare Power of
              Attorney acknowledges the same duties and responsibilities listed above for the
              Primary Healthcare Agent, and agrees to serve if the Primary Healthcare Agent is
              unable or unwilling to serve.
            </Text>

            <View style={[styles.signatureBlock, { marginTop: 15 }]}>
              <Text style={styles.fieldLabel}>SUCCESSOR HEALTHCARE AGENT ACCEPTANCE:</Text>
              <View style={styles.signatureRow}>
                <View style={styles.signatureColumn}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureLabel}>Successor Healthcare Agent Signature</Text>
                </View>
                <View style={styles.signatureColumn}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureLabel}>Date</Text>
                </View>
              </View>
              <View style={[styles.signatureLine, { width: "45%" }]} />
              <Text style={styles.signatureLabel}>
                Printed Name: {r.alternateAgentName || "[SUCCESSOR AGENT NAME]"}
              </Text>
            </View>
          </View>
        )}

        {/* Important Notice */}
        <View
          style={[
            styles.section,
            {
              marginTop: 15,
              padding: 10,
              backgroundColor: "#f9f9f9",
              borderWidth: 1,
              borderColor: "#ccc",
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { fontSize: 9, textAlign: "center" }]}>
            Important Notice to Healthcare Agent
          </Text>
          <Text style={[styles.legalClause, { fontSize: 8 }]}>
            As Healthcare Agent, you have the authority to make healthcare decisions for the
            Principal when they cannot make or communicate decisions themselves. You should:
            {"\n\n"}- Provide a copy of this document to the Principal healthcare providers{"\n"}-
            Keep the original document in a safe but accessible location{"\n"}- Know where to find
            this document in an emergency{"\n"}- Discuss the Principal wishes with them while they
            are able to communicate{"\n"}- Consult with the Principal physician and other healthcare
            providers{"\n"}- Make decisions based on the Principal wishes, values, and best
            interests{"\n"}- Keep records of healthcare decisions made on the Principal behalf
          </Text>
        </View>

        {/* Distribution Notice */}
        <View style={[styles.section, { marginTop: 10 }]}>
          <Text style={[styles.sectionTitle, { fontSize: 9 }]}>Recommended Distribution</Text>
          <Text style={[styles.legalClause, { fontSize: 8 }]}>
            Copies of this Healthcare Power of Attorney should be provided to:{"\n"}- Primary
            Healthcare Agent{"\n"}- Successor Healthcare Agent (if named){"\n"}- Primary care
            physician{"\n"}- Specialists providing ongoing care{"\n"}- Hospital(s) where Principal
            may receive care{"\n"}- Family members or close friends{"\n"}- Attorney (if applicable)
            {"\n\n"}
            Retain the original in a secure but accessible location. Consider registering this
            document with your state advance directive registry if available.
          </Text>
        </View>

        <DocumentFooter
          documentName={documentTitle}
          principalName={(r.fullName as string) || "[YOUR NAME]"}
          pageNumber={4}
        />
      </Page>
    </Document>
  );
}
