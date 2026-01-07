"use client";

import { Document, Page, Text, View } from "@react-pdf/renderer";
import {
  getStateLegalRequirements,
  STATE_NAMES,
  type USState,
} from "@/lib/state-legal-requirements";
import {
  Checkbox,
  HealthcareWitnessAttestation,
  type LegalDocumentPDFData,
  NotaryAcknowledgment,
  styles,
  TreatmentRow,
} from "./shared-components";

export function AdvanceDirectivePDFGenerator({ data }: { data: LegalDocumentPDFData }) {
  const r = data.responses;
  const requirements = getStateLegalRequirements(data.state as USState);
  const adReqs = requirements?.advance_directive;
  const stateName = STATE_NAMES[data.state as USState] || data.state;
  const documentTitle = adReqs?.documentName || "Advance Healthcare Directive";

  // Get pregnancy note based on state (simplified - in production would come from enhanced requirements)
  const getPregnancyNote = (): string => {
    // States with mandatory pregnancy exceptions
    const mandatoryExceptionStates = [
      "AL",
      "AZ",
      "AR",
      "CO",
      "FL",
      "GA",
      "ID",
      "IN",
      "KS",
      "KY",
      "LA",
      "MI",
      "MO",
      "MT",
      "NE",
      "NV",
      "OH",
      "OK",
      "PA",
      "RI",
      "SC",
      "SD",
      "TX",
      "UT",
      "WI",
    ];
    // States that allow patient choice
    const patientChoiceStates = [
      "CA",
      "CT",
      "HI",
      "ME",
      "MD",
      "MA",
      "NJ",
      "NM",
      "NY",
      "OR",
      "VT",
      "WA",
    ];

    if (mandatoryExceptionStates.includes(data.state)) {
      return `${stateName} law may require suspension of this directive during pregnancy if the fetus could develop to the point of live birth.`;
    } else if (patientChoiceStates.includes(data.state)) {
      return `${stateName} allows you to specify your wishes regarding pregnancy. Your stated preference will be followed.`;
    }
    return `Consult ${stateName} law regarding advance directives during pregnancy.`;
  };

  return (
    <Document>
      {/* ==================== PAGE 1 ==================== */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{documentTitle}</Text>
          <Text style={styles.subtitle}>(Living Will Declaration)</Text>
          <Text style={styles.stateInfo}>State of {stateName}</Text>
        </View>

        {/* IMPORTANT NOTICE */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: "#f9f9f9",
              padding: 10,
              borderWidth: 1,
              borderColor: "#000",
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { textAlign: "center", borderBottom: "none" }]}>
            IMPORTANT NOTICE TO DECLARANT
          </Text>
          <Text style={[styles.legalClause, { fontWeight: "bold" }]}>
            THIS IS AN IMPORTANT LEGAL DOCUMENT. Before signing this document, you should know these
            important facts:
            {"\n\n"}
            1. This document gives your directions about your healthcare when you cannot speak for
            yourself. It becomes effective only when you cannot communicate your own wishes.
            {"\n\n"}
            2. You may state your wishes about any aspect of your healthcare, including decisions
            about life-prolonging treatment.
            {"\n\n"}
            3. You have the right to revoke this directive at any time by signed writing, oral
            statement, or by destroying this document.
            {"\n\n"}
            4. This document supplements, but does not replace, any Healthcare Power of Attorney you
            may have executed.
          </Text>
        </View>

        {/* Part I: Declaration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part I: Declaration</Text>
          <Text style={styles.legalClause}>
            I, {r.fullName || "[YOUR FULL LEGAL NAME]"}, of {r.address || "[YOUR ADDRESS]"},
            {r.dateOfBirth ? ` date of birth ${r.dateOfBirth},` : ""} being of sound mind and at
            least eighteen (18) years of age, willfully and voluntarily make known my desires
            regarding my medical treatment and end-of-life care in the event I am unable to
            communicate my wishes. I understand the full import of this Advance Directive and intend
            to be legally bound by its terms.
            {"\n\n"}I direct that this Advance Directive be honored by my family, physicians,
            healthcare providers, and any healthcare facility in which I am a patient.
          </Text>
        </View>

        {/* Part II: Definitions - Enhanced */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part II: Definitions</Text>

          <Text style={styles.definitionTerm}>&quot;Qualified Medical Condition&quot;</Text>
          <Text style={styles.definitionText}>
            means any of the following conditions: Terminal Condition, Permanent Unconsciousness, or
            End-Stage Condition, as defined below, in which the application of life-sustaining
            treatment would serve only to prolong the dying process.
          </Text>

          <Text style={styles.definitionTerm}>&quot;Terminal Condition&quot;</Text>
          <Text style={styles.definitionText}>
            means an incurable and irreversible condition caused by injury, disease, or illness
            that, in the opinion of my attending physician and one additional physician who has
            personally examined me, will result in my death within a relatively short period of time
            (generally understood as six months or less) without the administration of
            life-sustaining treatment. The diagnosis must be made to a reasonable degree of medical
            certainty.
          </Text>

          <Text style={styles.definitionTerm}>
            &quot;Permanent Unconsciousness&quot; / &quot;Irreversible Coma&quot;
          </Text>
          <Text style={styles.definitionText}>
            means an irreversible condition in which I am permanently unconscious with no reasonable
            medical expectation of regaining consciousness, as certified by my attending physician
            and one additional physician who has personally examined me. This includes, but is not
            limited to:{"\n"}
            {"   "}- Persistent Vegetative State (PVS): Complete unawareness of self and environment
            {"\n"}
            {"   "}- Irreversible Coma: Prolonged state of unconsciousness from which I cannot be
            aroused{"\n"}
            The determination must be made after observation over an appropriate period, consistent
            with accepted medical standards.
          </Text>

          <Text style={styles.definitionTerm}>&quot;End-Stage Condition&quot;</Text>
          <Text style={styles.definitionText}>
            means an advanced, progressive, incurable condition caused by injury, disease, or
            illness that has caused severe and permanent deterioration indicated by: (a) mental
            incompetency; and (b) complete physical dependency for activities of daily living such
            as eating, bathing, and mobility, where there is no reasonable expectation of
            improvement or recovery, and which, to a reasonable degree of medical certainty, will
            result in death.
          </Text>

          <Text style={styles.definitionTerm}>&quot;Life-Sustaining Treatment&quot;</Text>
          <Text style={styles.definitionText}>
            means any medical treatment, procedure, or intervention that serves primarily to prolong
            the dying process, including but not limited to: cardiopulmonary resuscitation (CPR),
            mechanical ventilation, artificial nutrition and hydration (feeding tubes), dialysis,
            blood transfusions, antibiotics, and vasopressor medications.
          </Text>

          <Text style={styles.definitionTerm}>
            &quot;Comfort Care&quot; / &quot;Palliative Care&quot;
          </Text>
          <Text style={styles.definitionText}>
            means treatment to maintain personal hygiene and dignity, alleviate pain and suffering,
            and provide emotional and spiritual support. This includes pain medication (even if it
            may hasten death), oral hygiene, skin care, and measures to relieve distressing
            symptoms.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Advance Directive of {r.fullName || "[YOUR NAME]"} | Page 1</Text>
        </View>
      </Page>

      {/* ==================== PAGE 2 ==================== */}
      <Page size="LETTER" style={styles.page}>
        {/* Part III: Instructions for Life-Sustaining Treatment - Enhanced */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Part III: Instructions for Life-Sustaining Treatment
          </Text>
          <Text style={styles.legalClause}>
            If I have a Qualified Medical Condition as defined above, I direct the following
            treatment preferences for each condition:
          </Text>

          <View style={styles.subSection}>
            <Text style={styles.subSectionLabel}>CONDITION A - Terminal Condition:</Text>
            <Text style={styles.articleContent}>
              If I have an incurable and irreversible condition that will result in my death within
              a relatively short time:
              {"\n"}
              {r.terminalTreatment === "comfort_only"
                ? "I want COMFORT CARE ONLY. Do not use life-prolonging treatment."
                : r.terminalTreatment === "try_treatment"
                  ? "TRY treatment for a reasonable period, then provide comfort care only if no improvement."
                  : r.terminalTreatment === "all_treatment"
                    ? "Provide ALL available treatment to keep me alive as long as possible."
                    : r.lifeSupportPreference === "comfort_only"
                      ? "I want COMFORT CARE ONLY. Do not use life-prolonging treatment."
                      : r.lifeSupportPreference === "all_measures"
                        ? "Provide ALL available treatment to keep me alive as long as possible."
                        : "TRY treatment for a reasonable period, then provide comfort care only if no improvement."}
            </Text>
          </View>

          <View style={styles.subSection}>
            <Text style={styles.subSectionLabel}>CONDITION B - Permanent Unconsciousness:</Text>
            <Text style={styles.articleContent}>
              If I am permanently unconscious (persistent vegetative state or irreversible coma):
              {"\n"}
              {r.unconsciousTreatment === "comfort_only"
                ? "I want COMFORT CARE ONLY. Do not use life-prolonging treatment."
                : r.unconsciousTreatment === "limited_trial"
                  ? "TRY treatment for a limited period, then comfort care only."
                  : r.unconsciousTreatment === "all_treatment"
                    ? "Provide ALL available treatment."
                    : r.lifeSupportPreference === "comfort_only"
                      ? "I want COMFORT CARE ONLY. Do not use life-prolonging treatment."
                      : r.lifeSupportPreference === "all_measures"
                        ? "Provide ALL available treatment."
                        : "TRY treatment for a limited period, then comfort care only."}
            </Text>
          </View>

          <View style={styles.subSection}>
            <Text style={styles.subSectionLabel}>CONDITION C - End-Stage Condition:</Text>
            <Text style={styles.articleContent}>
              If I have an advanced, progressive, incurable condition that has caused severe and
              permanent deterioration indicated by incompetency and complete physical dependency:
              {"\n"}
              {r.endStageTreatment === "comfort_only"
                ? "I want COMFORT CARE ONLY."
                : r.endStageTreatment === "limited"
                  ? "Provide LIMITED treatment as specified below."
                  : r.endStageTreatment === "all_treatment"
                    ? "Provide ALL available treatment."
                    : r.lifeSupportPreference === "comfort_only"
                      ? "I want COMFORT CARE ONLY."
                      : r.lifeSupportPreference === "all_measures"
                        ? "Provide ALL available treatment."
                        : "Provide LIMITED treatment as specified below."}
            </Text>
          </View>
        </View>

        {/* Specific Treatment Instructions - Matrix */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specific Treatment Instructions</Text>
          <Text style={styles.legalClause}>
            For each condition above, I make the following specific treatment choices (where
            applicable). YES = Provide treatment; NO = Withhold treatment; TRIAL = Try for limited
            period; AGENT = Let my Healthcare Agent decide.
          </Text>

          <View style={{ marginTop: 10 }}>
            {/* Table Header */}
            <View
              style={{
                flexDirection: "row",
                borderBottom: "1px solid #000",
                paddingBottom: 4,
                marginBottom: 2,
              }}
            >
              <Text style={{ width: "35%", fontWeight: "bold", fontSize: 8 }}>TREATMENT</Text>
              <Text
                style={{
                  width: "20%",
                  fontWeight: "bold",
                  fontSize: 8,
                  textAlign: "center",
                }}
              >
                TERMINAL
              </Text>
              <Text
                style={{
                  width: "22%",
                  fontWeight: "bold",
                  fontSize: 8,
                  textAlign: "center",
                }}
              >
                UNCONSCIOUS
              </Text>
              <Text
                style={{
                  width: "23%",
                  fontWeight: "bold",
                  fontSize: 8,
                  textAlign: "center",
                }}
              >
                END-STAGE
              </Text>
            </View>

            {/* Treatment Rows */}
            <TreatmentRow
              label="CPR (Cardiopulmonary Resuscitation)"
              terminal={r.cprTerminal || r.cpr}
              unconscious={r.cprUnconscious || r.cpr}
              endStage={r.cprEndStage || r.cpr}
            />
            <TreatmentRow
              label="Mechanical Ventilator"
              terminal={r.ventTerminal || r.ventilator}
              unconscious={r.ventUnconscious || r.ventilator}
              endStage={r.ventEndStage || r.ventilator}
            />
            <TreatmentRow
              label="Feeding Tube (Artificial Nutrition)"
              terminal={r.tubeTerminal || r.feedingTube}
              unconscious={r.tubeUnconscious || r.feedingTube}
              endStage={r.tubeEndStage || r.feedingTube}
            />
            <TreatmentRow
              label="IV Fluids (Artificial Hydration)"
              terminal={r.ivTerminal || r.feedingTube}
              unconscious={r.ivUnconscious || r.feedingTube}
              endStage={r.ivEndStage || r.feedingTube}
            />
            <TreatmentRow
              label="Dialysis"
              terminal={r.dialysisTerminal || r.dialysis}
              unconscious={r.dialysisUnconscious || r.dialysis}
              endStage={r.dialysisEndStage || r.dialysis}
            />
            <TreatmentRow
              label="Antibiotics"
              terminal={r.antibioticsTerminal}
              unconscious={r.antibioticsUnconscious}
              endStage={r.antibioticsEndStage}
            />
            <TreatmentRow
              label="Blood Products/Transfusions"
              terminal={r.bloodTerminal}
              unconscious={r.bloodUnconscious}
              endStage={r.bloodEndStage}
            />
          </View>
        </View>

        {/* General Treatment Preference (Legacy Support) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Treatment Preference</Text>
          <Text style={styles.articleContent}>
            If specific instructions above do not address a particular situation, my general
            preference is:
            {"\n"}
            {r.lifeSupportPreference === "all_measures"
              ? "I WANT all life-prolonging treatments to be provided."
              : r.lifeSupportPreference === "comfort_only"
                ? "I want COMFORT CARE ONLY. I do NOT want life-prolonging treatment."
                : "I want life-prolonging treatment tried for a reasonable period, then comfort care only if there is no improvement."}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Advance Directive of {r.fullName || "[YOUR NAME]"} | Page 2</Text>
        </View>
      </Page>

      {/* ==================== PAGE 3 ==================== */}
      <Page size="LETTER" style={styles.page}>
        {/* Part IV: Comfort Care and Pain Management - Enhanced */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part IV: Comfort Care and Pain Management</Text>
          <Text style={styles.legalClause}>
            Regardless of other choices above, I ALWAYS want the following comfort care measures:
          </Text>
          <View style={{ marginTop: 6 }}>
            <Checkbox
              checked={true}
              label="Medication to control pain, even if it may hasten my death"
            />
            <Checkbox
              checked={r.wantHygiene !== false}
              label="Measures to maintain personal hygiene and cleanliness"
            />
            <Checkbox checked={r.wantMoisture !== false} label="Keep my mouth and lips moist" />
            <Checkbox
              checked={r.wantCompany !== false}
              label="Opportunity for family and loved ones to be present"
            />
            <Checkbox checked={r.wantMusic === true} label="Play music or readings I enjoy" />
          </View>

          <View style={styles.subSection}>
            <Text style={styles.subSectionLabel}>Pain Management Preference:</Text>
            <Text style={styles.articleContent}>
              {r.painManagement === "maximum"
                ? "I want MAXIMUM pain relief, even if it may hasten my death or affect my consciousness. I understand this may include doses of medication that could shorten my life."
                : r.painManagement === "balanced"
                  ? "I want pain relief BALANCED with maintaining alertness. I accept some discomfort to remain as aware as possible."
                  : r.painManagement === "minimal"
                    ? "I prefer MINIMAL medication to remain as alert as possible. I am willing to accept significant discomfort to maintain consciousness."
                    : "I want adequate pain relief to maintain comfort and dignity."}
            </Text>
          </View>

          <View style={styles.subSection}>
            <Text style={styles.subSectionLabel}>Palliative Sedation Preferences:</Text>
            <Text style={styles.articleContent}>
              If my pain or distress cannot be adequately controlled by other means:
              {"\n"}
              {r.palliativeSedation === "yes"
                ? "I CONSENT to palliative (terminal) sedation to relieve suffering, even if it may hasten my death or eliminate my consciousness."
                : r.palliativeSedation === "no"
                  ? "I DO NOT want palliative sedation. I prefer to remain conscious even if suffering."
                  : "I want my Healthcare Agent to make this decision based on the circumstances."}
            </Text>
          </View>

          <View style={styles.subSection}>
            <Text style={styles.subSectionLabel}>Hospice Care Preferences:</Text>
            <Text style={styles.articleContent}>
              {r.hospicePreference === "yes"
                ? "I WANT hospice care when appropriate. I understand hospice focuses on comfort rather than cure."
                : r.hospicePreference === "no"
                  ? "I DO NOT want hospice care at this time."
                  : "I want my Healthcare Agent to make decisions about hospice care."}
            </Text>
          </View>

          <View style={styles.subSection}>
            <Text style={styles.subSectionLabel}>Location of Death Preferences:</Text>
            <Text style={styles.articleContent}>
              If reasonably possible, I prefer to die:
              {"\n"}
              {r.deathLocation === "home"
                ? "AT HOME, with appropriate support services."
                : r.deathLocation === "hospice"
                  ? "IN A HOSPICE FACILITY."
                  : r.deathLocation === "hospital"
                    ? "IN A HOSPITAL."
                    : r.deathLocation === "no_preference"
                      ? "I have no strong preference about location."
                      : "Let my Healthcare Agent decide based on circumstances."}
            </Text>
          </View>

          {r.additionalComfort && (
            <View style={styles.subSection}>
              <Text style={styles.subSectionLabel}>Additional Comfort Preferences:</Text>
              <Text style={styles.articleContent}>{r.additionalComfort}</Text>
            </View>
          )}
        </View>

        {/* Part V: DNR and POLST Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part V: DNR and POLST Orders</Text>
          <Text style={styles.legalClause}>
            I understand that this Advance Directive may be supplemented by a separate DNR (Do Not
            Resuscitate) order or POLST (Physician Orders for Life-Sustaining Treatment) form signed
            by my physician. A POLST form provides immediately actionable medical orders for
            emergency medical personnel.
          </Text>

          <View style={styles.subSection}>
            <Text style={styles.articleContent}>
              {r.wantsDNR === true || r.cpr === "no"
                ? "I REQUEST that my physician complete a DNR order consistent with my wishes expressed in this directive."
                : r.wantsDNR === false
                  ? "I DO NOT want a DNR order at this time."
                  : "I will discuss DNR orders with my physician as circumstances warrant."}
              {"\n\n"}
              {r.wantsPOLST === true
                ? "I REQUEST that my physician complete a POLST form consistent with my wishes expressed in this directive."
                : r.wantsPOLST === false
                  ? "I have not decided about a POLST form at this time."
                  : "I will discuss a POLST form with my physician if my condition warrants."}
            </Text>
          </View>
        </View>

        {/* Part VI: Personal Values and Beliefs */}
        {(r.qualityOfLife || r.religiousBeliefs || r.wantClergyVisit) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Part VI: Personal Values and Beliefs</Text>
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

        <View style={styles.footer}>
          <Text>Advance Directive of {r.fullName || "[YOUR NAME]"} | Page 3</Text>
        </View>
      </Page>

      {/* ==================== PAGE 4 ==================== */}
      <Page size="LETTER" style={styles.page}>
        {/* Pregnancy Provision */}
        {(r.isOrCouldBePregnant === true || r.includePregnancyProvision === true) && (
          <View
            style={[
              styles.section,
              {
                backgroundColor: "#fffacd",
                padding: 10,
                borderWidth: 1,
                borderColor: "#daa520",
              },
            ]}
          >
            <Text style={styles.sectionTitle}>SPECIAL PROVISION REGARDING PREGNANCY</Text>
            <Text style={styles.legalClause}>
              I understand that some states require this directive to be suspended during pregnancy.
              My wishes regarding pregnancy are:
              {"\n\n"}
              {r.pregnancyPreference === "maintain_life"
                ? "If I am pregnant, I want life-sustaining treatment to be maintained to support the pregnancy, regardless of my other instructions in this directive."
                : r.pregnancyPreference === "directive_applies"
                  ? "Even if I am pregnant, I want my advance directive to apply as written. I do not want my pregnancy to affect the implementation of this directive."
                  : r.pregnancyPreference === "viability_based"
                    ? "If I am pregnant and the fetus has reached viability, I want life-sustaining treatment maintained until delivery if medically feasible. Before viability, my directive should apply as written."
                    : "I want my Healthcare Agent to make this decision based on medical advice, the circumstances of the pregnancy, and my overall values expressed in this directive."}
              {"\n\n"}
              {stateName} law regarding pregnancy: {getPregnancyNote()}
            </Text>
          </View>
        )}

        {/* Part VII: Organ and Tissue Donation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part VII: Organ and Tissue Donation</Text>
          <Text style={styles.legalClause}>
            {r.organDonation === "yes_all"
              ? "I CONSENT to donate any organs and tissues that may be useful for transplantation, therapy, medical research, or education. I understand that my organs may be maintained temporarily for donation purposes even after I am legally dead."
              : r.organDonation === "yes_limited"
                ? "I CONSENT to donate ONLY the following organs/tissues: " +
                  (r.organLimitations || "[SPECIFY]") +
                  ". I do not consent to donation of any other organs or tissues."
                : r.organDonation === "no"
                  ? "I DO NOT CONSENT to organ or tissue donation. I direct that my body remain intact after death."
                  : "I want my Healthcare Agent or family to make this decision based on the circumstances at the time."}
          </Text>
        </View>

        {/* Part VIII: Disposition of Remains */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part VIII: Disposition of Remains</Text>
          <Text style={styles.legalClause}>
            My preference for the disposition of my remains is:{" "}
            {r.bodyDisposition === "burial"
              ? "Traditional Burial"
              : r.bodyDisposition === "cremation"
                ? "Cremation"
                : r.bodyDisposition === "donation"
                  ? "Donation of body to medical science/education"
                  : r.bodyDisposition === "green_burial"
                    ? "Green/Natural Burial"
                    : r.bodyDisposition || "[NOT SPECIFIED]"}
            .{r.dispositionDetails ? ` Special instructions: ${r.dispositionDetails}` : ""}
          </Text>
        </View>

        {/* Revocation and Amendment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part IX: Revocation and Amendment</Text>
          <Text style={styles.legalClause}>
            I understand that I may revoke this Advance Directive at any time and in any manner,
            including:
            {"\n"}
            {"   "}- By signing a written revocation
            {"\n"}
            {"   "}- By physically destroying this document
            {"\n"}
            {"   "}- By orally stating my intent to revoke in the presence of a witness
            {"\n"}
            {"   "}- By executing a new Advance Directive (which automatically revokes prior ones)
            {"\n\n"}I may amend this directive only by a signed, dated, and witnessed written
            amendment.
          </Text>
        </View>

        {/* Declarant&apos;s Signature */}
        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>Declarant&apos;s Signature</Text>
          <Text style={styles.legalClause}>
            I am emotionally and mentally competent to make this Directive. I understand that this
            Directive does not affect my right to make my own medical decisions as long as I am able
            to do so. I have read this document, understand its contents, and sign it voluntarily.
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
            <View style={[styles.signatureLine, { width: "45%", marginTop: 8 }]} />
            <Text style={styles.signatureLabel}>
              Printed Name: {r.fullName || "[YOUR FULL NAME]"}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Advance Directive of {r.fullName || "[YOUR NAME]"} | Page 4</Text>
        </View>
      </Page>

      {/* ==================== PAGE 5 ==================== */}
      <Page size="LETTER" style={styles.page}>
        {/* Healthcare-Specific Witness Attestation */}
        <HealthcareWitnessAttestation
          count={adReqs?.witnessCount || 2}
          state={data.state}
          declarantName={(r.fullName as string) || "[DECLARANT NAME]"}
          specialRequirements={adReqs?.specialRequirements || null}
        />

        {/* Notary Section if required */}
        {adReqs?.notaryRequired && (
          <NotaryAcknowledgment
            state={data.state}
            principalName={(r.fullName as string) || "[YOUR NAME]"}
          />
        )}

        {/* Important Notices */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Important Notices</Text>
          <Text style={[styles.legalClause, { fontSize: 8 }]}>
            TO THE DECLARANT: This Advance Directive expresses your wishes about medical treatment
            when you cannot speak for yourself. Review it periodically and update as needed. Discuss
            your wishes with your healthcare agent, family, and physicians. Keep the original in a
            safe but accessible place and provide copies to your healthcare agent, physician, and
            hospital.
            {"\n\n"}
            TO HEALTHCARE PROVIDERS: Under {stateName} law, you are required to comply with the
            wishes expressed in this Advance Directive unless doing so would violate your conscience
            or professional ethics, in which case you must make reasonable efforts to transfer the
            patient to a provider who will honor the directive.
            {"\n\n"}
            TO FAMILY MEMBERS: This document reflects the considered wishes of your loved one.
            Please respect and support these decisions, even if you disagree with them.
            {"\n\n"}
            DISCLAIMER: This document is provided for informational purposes. State laws vary and
            change. Consult with a qualified attorney in your state to ensure this directive meets
            all current legal requirements.
          </Text>
        </View>

        {/* State-Specific Notes */}
        {adReqs?.specialRequirements && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{stateName} State Requirements</Text>
            <Text style={[styles.legalClause, { fontSize: 8 }]}>{adReqs.specialRequirements}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>Advance Directive of {r.fullName || "[YOUR NAME]"} | Page 5</Text>
        </View>
      </Page>
    </Document>
  );
}
