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

export function PourOverWillPDFGenerator({ data }: { data: LegalDocumentPDFData }) {
  const r = data.responses;
  const requirements = getStateLegalRequirements(data.state as USState);
  const willReqs = requirements?.will;
  const stateName = STATE_NAMES[data.state as USState] || data.state;

  // Article numbering counter
  let articleCounter = 0;
  const getArticleNum = () => {
    articleCounter++;
    return articleCounter;
  };

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <DocumentHeader
          title="Pour-Over Last Will and Testament"
          subtitle={`of ${r.fullName || "[YOUR FULL LEGAL NAME]"}`}
          state={data.state}
        />

        {/* Declaration */}
        <View style={styles.section}>
          <Text style={styles.legalClause}>
            I, {r.fullName || "[YOUR FULL LEGAL NAME]"}, a resident of{" "}
            {r.address || "[YOUR ADDRESS]"}, State of {stateName}, being of sound mind and memory,
            do hereby make, publish, and declare this instrument to be my Last Will and Testament,
            hereby revoking all prior wills and codicils.
          </Text>
        </View>

        {/* Article: Trust Identification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Article {getArticleNum()}: Identification of Trust
          </Text>
          <Text style={styles.legalClause}>
            I have created a Revocable Living Trust known as &quot;{r.trustName || "[TRUST NAME]"}
            &quot; dated {r.trustDate || "[DATE OF TRUST]"} (the &quot;Trust&quot;). The Trust may
            have been amended from time to time. I refer to the Trust as it exists at the time of my
            death, including any amendments thereto.
          </Text>
        </View>

        {/* Article: Pour-Over Provision */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article {getArticleNum()}: Pour-Over Provision</Text>
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

        {/* Article: Coordination */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Article {getArticleNum()}: Coordination with Trust
          </Text>
          <Text style={styles.legalClause}>
            This Will is intended to work in conjunction with the Trust. The terms of the Trust
            shall control the distribution of any property passing under this Will, and this Will
            shall be interpreted accordingly.
          </Text>
        </View>

        {/* Article: Executor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article {getArticleNum()}: Executor</Text>
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

        {/* Article: Guardian */}
        {r.hasMinorChildren && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Article {getArticleNum()}: Guardian of Minor Children
            </Text>
            <Text style={styles.legalClause}>
              I nominate {r.guardianName || "[GUARDIAN NAME]"} as Guardian of the person of any
              minor child of mine. If this person is unable or unwilling to serve, I nominate{" "}
              {r.alternateGuardian || "[ALTERNATE GUARDIAN]"} as successor Guardian. No Guardian
              shall be required to furnish bond.
            </Text>
          </View>
        )}

        {/* Article: Taxes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article {getArticleNum()}: Taxes and Expenses</Text>
          <Text style={styles.legalClause}>
            All estate, inheritance, and death taxes, and all expenses of administration, shall be
            paid from the residuary estate passing to the Trust, and shall not be apportioned or
            charged against any specific gift or any beneficiary.
          </Text>
        </View>

        {/* Article: Simultaneous Death */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article {getArticleNum()}: Simultaneous Death</Text>
          <Text style={styles.legalClause}>
            If any beneficiary under this Will and I die under circumstances where it cannot be
            established by clear and convincing evidence who died first, such beneficiary shall be
            deemed to have predeceased me for all purposes of this Will. If my spouse and I die
            under such circumstances, my spouse shall be deemed to have predeceased me.
          </Text>
        </View>

        {/* Article: Fiduciary Powers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article {getArticleNum()}: Fiduciary Powers</Text>
          <Text style={styles.legalClause}>
            I grant my Executor, and any successor Executor, the following powers without court
            approval:
          </Text>
          <View style={styles.subSection}>
            <Text style={styles.articleContent}>
              (a) To retain any property received from my estate for such time as my Executor deems
              advisable;{"\n\n"}
              (b) To sell, lease, exchange, or dispose of any property at public or private sale,
              upon such terms as my Executor deems proper;{"\n\n"}
              (c) To borrow money for any estate purpose and to pledge estate property as security;
              {"\n\n"}
              (d) To compromise, settle, or abandon any claims by or against my estate;{"\n\n"}
              (e) To employ attorneys, accountants, and other professionals;{"\n\n"}
              (f) To make distributions in cash or in kind, or partly in each;{"\n\n"}
              (g) To exercise all powers granted under the laws of {stateName}.
            </Text>
          </View>
        </View>

        {/* Article: Severability */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article {getArticleNum()}: Severability</Text>
          <Text style={styles.legalClause}>
            If any provision of this Will is held to be invalid, illegal, or unenforceable by a
            court of competent jurisdiction, the validity, legality, and enforceability of the
            remaining provisions shall not be affected or impaired thereby, and shall continue in
            full force and effect.
          </Text>
        </View>

        {/* Signature */}
        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>Testator&apos;s Signature</Text>
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

        <DocumentFooter
          documentName="Pour-Over Will"
          principalName={(r.fullName as string) || "[YOUR NAME]"}
          pageNumber={1}
        />
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

          <DocumentFooter
            documentName="Pour-Over Will"
            principalName={(r.fullName as string) || "[YOUR NAME]"}
            pageNumber={2}
          />
        </Page>
      )}
    </Document>
  );
}
