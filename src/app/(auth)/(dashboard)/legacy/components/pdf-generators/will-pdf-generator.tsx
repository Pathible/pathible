"use client";

import { Document, Page, Text, View } from "@react-pdf/renderer";
import {
  getStateLegalRequirements,
  STATE_NAMES,
  type USState,
} from "@/lib/state-legal-requirements";
import {
  DocumentFooter,
  DocumentHeader,
  type LegalDocumentPDFData,
  NotaryAcknowledgment,
  SelfProvingAffidavit,
  styles,
  WitnessAttestation,
} from "./shared-components";

export function WillPDFGenerator({ data }: { data: LegalDocumentPDFData }) {
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
        <DocumentHeader
          title="Last Will and Testament"
          subtitle={`of ${r.fullName || "[YOUR FULL LEGAL NAME]"}`}
          state={data.state}
        />

        {/* Preamble and Declaration */}
        <View style={styles.section}>
          <Text style={styles.legalClause}>
            I, {r.fullName || "[YOUR FULL LEGAL NAME]"}, a resident of{" "}
            {r.address || "[YOUR ADDRESS]"}, County of {r.county || "_________________"}, State of{" "}
            {stateName}, being of the age of majority in this state, of sound mind and memory, and
            not acting under duress, menace, fraud, or the undue influence of any person, do hereby
            make, publish, and declare this instrument to be my Last Will and Testament, hereby
            expressly revoking all wills and codicils heretofore made by me.
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
            approval, the following powers to be exercised in the Executor&apos;s sole discretion:
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
          {r.waiveExecutorBond !== false ? (
            <Text style={[styles.legalClause, { marginTop: 8 }]}>
              I expressly waive the requirement for any bond or surety for my Executor and any
              successor Executor.
            </Text>
          ) : (
            <Text style={[styles.legalClause, { marginTop: 8 }]}>
              My Executor and any successor Executor shall be required to furnish bond as provided
              by law.
            </Text>
          )}
        </View>

        <DocumentFooter
          documentName="Last Will and Testament"
          principalName={(r.fullName as string) || "[YOUR NAME]"}
          generatedDate={data.generatedDate}
        />
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
            entitled to at the time of my death (hereinafter &quot;Residuary Estate&quot;),
            including all lapsed legacies and devises, as follows:
          </Text>
          <View style={styles.subSection}>
            <Text style={styles.articleContent}>
              (a) PRIMARY DISTRIBUTION: To {r.residuaryBeneficiary || "[PRIMARY BENEFICIARY]"}
              {r.residuaryRelationship ? ` (${r.residuaryRelationship})` : ""}
              {r.residuaryPercentage ? `, ${r.residuaryPercentage}%` : ", 100%"} of my Residuary
              Estate, if they survive me by {survivalPeriod} days.
              {"\n\n"}
              (b) FIRST CONTINGENT: If the primary beneficiary does not survive me by{" "}
              {survivalPeriod} days,
              {r.residuaryContingent === "descendants_per_stirpes"
                ? " I give my Residuary Estate to my descendants then living, per stirpes."
                : r.residuaryContingent === "specific_person"
                  ? ` I give my Residuary Estate to ${r.contingentBeneficiary || "[CONTINGENT BENEFICIARY]"}.`
                  : " I give my Residuary Estate to my descendants then living, per stirpes."}
              {"\n\n"}
              (c) SECOND CONTINGENT: If the primary beneficiary and first contingent beneficiaries
              do not survive me, I give my Residuary Estate to{" "}
              {r.secondContingentBeneficiary || r.contingentBeneficiary || "[SECOND CONTINGENT]"}.
              {"\n\n"}
              (d) FINAL CONTINGENT: If none of the beneficiaries named above survive me by{" "}
              {survivalPeriod} days, I give my Residuary Estate to{" "}
              {r.finalContingentBeneficiary ||
                `my heirs at law as determined under the laws of the State of ${stateName}`}
              .
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
        {(r.grantDigitalAccess ||
          r.digitalExecutor ||
          r.digitalAssetsInstructions ||
          r.passwordLocation ||
          r.socialMediaInstructions ||
          r.cryptocurrencyInfo) && (
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
            {r.socialMediaInstructions && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionLabel}>Social Media Accounts:</Text>
                <Text style={styles.articleContent}>
                  {r.socialMediaInstructions === "delete"
                    ? "Delete all social media accounts"
                    : r.socialMediaInstructions === "memorialize"
                      ? "Memorialize or convert to legacy mode where available"
                      : r.socialMediaInstructions === "download_delete"
                        ? "Download content then delete accounts"
                        : r.socialMediaInstructions === "agent_decides"
                          ? "Executor to decide handling of social media accounts"
                          : String(r.socialMediaInstructions)}
                </Text>
              </View>
            )}
            {r.cryptocurrencyInfo && (
              <View style={styles.subSection}>
                <Text style={styles.subSectionLabel}>Cryptocurrency Holdings:</Text>
                <Text style={styles.articleContent}>{r.cryptocurrencyInfo}</Text>
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

        <DocumentFooter
          documentName="Last Will and Testament"
          principalName={(r.fullName as string) || "[YOUR NAME]"}
          pageNumber={2}
        />
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
          <Text style={styles.definitionTerm}>&quot;Descendants&quot; or &quot;Issue&quot;</Text>
          <Text style={styles.definitionText}>
            means children, grandchildren, and more remote descendants in any degree, whether by
            blood or by legal adoption.
          </Text>
          <Text style={styles.definitionTerm}>&quot;Per Stirpes&quot;</Text>
          <Text style={styles.definitionText}>
            means that if any beneficiary predeceases me but leaves descendants who survive me, such
            deceased beneficiary&apos;s share shall pass to such surviving descendants by right of
            representation.
          </Text>
          <Text style={styles.definitionTerm}>&quot;Survive&quot; or &quot;Surviving&quot;</Text>
          <Text style={styles.definitionText}>
            means living at the time of my death and for {survivalPeriod} days thereafter.
          </Text>
          <Text style={styles.definitionTerm}>&quot;Digital Assets&quot;</Text>
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
          <Text style={styles.sectionTitle}>Testator&apos;s Signature</Text>
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

        <DocumentFooter
          documentName="Last Will and Testament"
          principalName={(r.fullName as string) || "[YOUR NAME]"}
          pageNumber={3}
        />
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

          <DocumentFooter
            documentName="Last Will and Testament"
            principalName={(r.fullName as string) || "[YOUR NAME]"}
            pageNumber={4}
          />
        </Page>
      )}
    </Document>
  );
}
