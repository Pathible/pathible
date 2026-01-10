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
  WitnessAttestation,
} from "./shared-components";

export function FinancialPOAPDFGenerator({ data }: { data: LegalDocumentPDFData }) {
  const r = data.responses;
  const requirements = getStateLegalRequirements(data.state as USState);
  const finReqs = requirements?.financial_poa;
  const stateName = STATE_NAMES[data.state as USState] || data.state;
  const documentTitle = finReqs?.documentName || "Durable Power of Attorney";

  // Check if all powers are granted or specific ones
  const allPowers = r.powerSelection === "all" || r.allPowers === true;
  const powers = Array.isArray(r.powers)
    ? r.powers
    : typeof r.powers === "string"
      ? [r.powers]
      : [];

  // Helper function to check if a power is granted
  const hasPower = (power: string): boolean => {
    if (allPowers) return true;
    if (powers.includes(power)) return true;
    // Also check for individual power flags like powerBanking, powerRealEstate, etc.
    const capitalizedPower = power.charAt(0).toUpperCase() + power.slice(1);
    return r[`power${capitalizedPower}`] === true;
  };

  return (
    <Document>
      {/* ==================== PAGE 1 ==================== */}
      <Page size="LETTER" style={styles.page}>
        <DocumentHeader title={documentTitle} subtitle="for Financial Matters" state={data.state} />

        {/* IMPORTANT NOTICE - Durability */}
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
            IMPORTANT NOTICE - DURABILITY
          </Text>
          <Text style={[styles.legalClause, { fontWeight: "bold" }]}>
            THIS IS A DURABLE POWER OF ATTORNEY. THIS POWER OF ATTORNEY SHALL NOT TERMINATE OR BE
            AFFECTED BY MY SUBSEQUENT DISABILITY OR INCAPACITY. This power of attorney shall remain
            in full force and effect unless and until I revoke it in a writing delivered to my
            Agent.
          </Text>
        </View>

        {/* Article I: Appointment of Agent */}
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
                Address: {r.alternateAgentAddress || "[ADDRESS]"}
                {"\n"}
                Phone: {r.alternateAgentPhone || "[PHONE]"}
                {"\n"}
                Relationship: {r.alternateAgentRelationship || "[RELATIONSHIP]"}
              </Text>
              <Text style={[styles.articleContent, { marginTop: 4 }]}>
                If my Primary Agent is unable or unwilling to serve, or ceases to serve as my Agent,
                I appoint my Successor Agent to serve in their place with all powers granted herein.
              </Text>
            </View>
          )}
        </View>

        {/* Article II: Powers Granted */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article II: Powers Granted</Text>
          <Text style={styles.legalClause}>
            I grant my Agent the following specific powers (checked items indicate granted powers):
          </Text>
          <View style={{ marginTop: 6 }}>
            <Checkbox
              checked={hasPower("banking")}
              label="(a) BANKING: Open, close, and manage bank accounts; make deposits and withdrawals; sign checks; access safe deposit boxes; wire funds; conduct all banking transactions"
            />
            <Checkbox
              checked={hasPower("realEstate") || hasPower("real_property")}
              label="(b) REAL PROPERTY: Buy, sell, lease, manage, improve, mortgage, or otherwise deal with real estate; execute deeds and contracts; collect rents"
            />
            <Checkbox
              checked={hasPower("investments")}
              label="(c) INVESTMENTS: Buy, sell, and manage stocks, bonds, mutual funds; manage brokerage accounts; exercise voting rights; receive dividends"
            />
            <Checkbox
              checked={hasPower("retirement")}
              label="(d) RETIREMENT ACCOUNTS: Manage IRAs, 401(k)s, pension plans; make contributions and withdrawals; change beneficiaries as permitted"
            />
            <Checkbox
              checked={hasPower("taxes")}
              label="(e) TAXES: Prepare, sign, and file tax returns; represent me before tax authorities; make tax elections; pay taxes"
            />
            <Checkbox
              checked={hasPower("insurance")}
              label="(f) INSURANCE: Purchase, maintain, modify, cancel insurance policies; file claims; change beneficiaries; receive proceeds"
            />
            <Checkbox
              checked={hasPower("business")}
              label="(g) BUSINESS: Conduct business affairs; form or dissolve entities; sign contracts; hire employees; exercise business interests"
            />
            <Checkbox
              checked={hasPower("government") || hasPower("benefits")}
              label="(h) GOVERNMENT BENEFITS: Apply for and manage Social Security, Medicare, Medicaid, veterans benefits; complete applications"
            />
            <Checkbox
              checked={hasPower("legal")}
              label="(i) LEGAL MATTERS: Hire attorneys; commence or defend legal actions; settle claims; access legal documents"
            />
            <Checkbox
              checked={hasPower("digital")}
              label="(j) DIGITAL ASSETS: Access and manage email, social media, online accounts, cryptocurrency, and digital files"
            />
            <Checkbox
              checked={hasPower("personal")}
              label="(k) PERSONAL PROPERTY: Buy, sell, lease, or dispose of tangible personal property; maintain my personal effects"
            />
            <Checkbox
              checked={hasPower("claims")}
              label="(l) CLAIMS AND LITIGATION: Settle, compromise, or abandon claims; participate in alternative dispute resolution"
            />
            <Checkbox
              checked={hasPower("estate")}
              label="(m) ESTATE TRANSACTIONS: Claim property by intestate succession; receive property or disclaim interests"
            />
          </View>
        </View>

        <DocumentFooter
          documentName={documentTitle}
          principalName={(r.fullName as string) || "[YOUR NAME]"}
          pageNumber={1}
        />
      </Page>

      {/* ==================== PAGE 2 ==================== */}
      <Page size="LETTER" style={styles.page}>
        {/* Article III: Special Powers Requiring Express Grant */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Article III: Special Powers Requiring Express Grant
          </Text>
          <Text style={styles.legalClause}>
            The following powers are NOT automatically granted and require my express authorization.
            I grant my Agent only those special powers I have initialed below:
          </Text>
          <View style={{ marginTop: 8 }}>
            <View style={styles.checkboxRow}>
              <View style={[styles.checkbox, { width: 25, marginRight: 8 }]}>
                <Text style={{ fontSize: 7 }}>
                  {r.powerGifts === true || r.giftingAuthority === true ? "INIT" : "_____"}
                </Text>
              </View>
              <Text style={styles.checkboxLabel}>
                <Text style={{ fontWeight: "bold" }}>GIFT-MAKING POWERS: </Text>
                To make gifts of my property to individuals or organizations, subject to the
                limitations specified below.
              </Text>
            </View>

            {(r.powerGifts === true || r.giftingAuthority === true) && (
              <View style={[styles.subSection, { marginLeft: 40, marginTop: 4 }]}>
                <Text style={styles.subSectionLabel}>Gifting Limitations:</Text>
                <Text style={styles.articleContent}>
                  {r.giftLimitations ||
                    "Gifts shall not exceed the federal annual gift tax exclusion amount per recipient per calendar year, and shall be consistent with my established pattern of giving. My Agent may NOT make gifts to themselves unless such gifts are consistent with my documented gifting history."}
                </Text>
              </View>
            )}

            <View style={[styles.checkboxRow, { marginTop: 6 }]}>
              <View style={[styles.checkbox, { width: 25, marginRight: 8 }]}>
                <Text style={{ fontSize: 7 }}>
                  {r.estatePlanningAuthority === true ? "INIT" : "_____"}
                </Text>
              </View>
              <Text style={styles.checkboxLabel}>
                <Text style={{ fontWeight: "bold" }}>CREATE/AMEND/REVOKE TRUSTS: </Text>
                To create, amend, or revoke inter vivos trusts for my benefit.
              </Text>
            </View>

            <View style={[styles.checkboxRow, { marginTop: 6 }]}>
              <View style={[styles.checkbox, { width: 25, marginRight: 8 }]}>
                <Text style={{ fontSize: 7 }}>
                  {r.beneficiaryDesignations === true ? "INIT" : "_____"}
                </Text>
              </View>
              <Text style={styles.checkboxLabel}>
                <Text style={{ fontWeight: "bold" }}>CHANGE BENEFICIARY DESIGNATIONS: </Text>
                To change beneficiary designations on insurance policies and retirement accounts.
              </Text>
            </View>

            <View style={[styles.checkboxRow, { marginTop: 6 }]}>
              <View style={[styles.checkbox, { width: 25, marginRight: 8 }]}>
                <Text style={{ fontSize: 7 }}>
                  {r.delegateAuthority === true ? "INIT" : "_____"}
                </Text>
              </View>
              <Text style={styles.checkboxLabel}>
                <Text style={{ fontWeight: "bold" }}>DELEGATE AUTHORITY: </Text>
                To delegate any powers granted in this document to another person.
              </Text>
            </View>

            <View style={[styles.checkboxRow, { marginTop: 6 }]}>
              <View style={[styles.checkbox, { width: 25, marginRight: 8 }]}>
                <Text style={{ fontSize: 7 }}>
                  {r.disclaimProperty === true ? "INIT" : "_____"}
                </Text>
              </View>
              <Text style={styles.checkboxLabel}>
                <Text style={{ fontWeight: "bold" }}>DISCLAIM PROPERTY: </Text>
                To disclaim or refuse an interest in property that would otherwise pass to me.
              </Text>
            </View>
          </View>
        </View>

        {/* Article IV: Self-Dealing Restrictions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article IV: Self-Dealing Restrictions</Text>
          <Text style={styles.legalClause}>
            {r.allowSelfDealing === true
              ? "Notwithstanding any other provision of this Power of Attorney, I authorize my Agent to engage in transactions that benefit the Agent, provided such transactions are in my best interest and are made in good faith."
              : "My Agent shall NOT use my property for the Agent&apos;s own benefit, directly or indirectly, and shall NOT engage in any transaction in which the Agent has a financial interest adverse to mine. This prohibition includes, but is not limited to: (a) borrowing my funds; (b) using my property as collateral; (c) purchasing my assets; (d) making gifts to the Agent (unless expressly authorized above and consistent with my established pattern of giving); and (e) any other self-dealing transaction."}
          </Text>
        </View>

        {/* Article V: Effective Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article V: Effective Date</Text>
          <Text style={styles.legalClause}>
            {r.effectiveTiming === "immediate" || r.effectiveDate === "immediate"
              ? "This Power of Attorney is effective IMMEDIATELY upon execution and delivery to my Agent. My Agent may act on my behalf from the date this document is signed."
              : `This Power of Attorney shall become effective ONLY UPON A DETERMINATION THAT I AM INCAPACITATED (Springing Power of Attorney). Incapacity shall be determined by ${
                  r.springIncapacityMethod === "one_physician"
                    ? "written certification of one (1) licensed physician who has personally examined me and determined that I am unable to manage my property and financial affairs due to mental or physical incapacity"
                    : r.springIncapacityMethod === "court"
                      ? "a court of competent jurisdiction declaring me incapacitated or incompetent"
                      : "written certification of two (2) licensed physicians who have personally examined me and determined that I am unable to manage my property and financial affairs due to mental or physical incapacity"
                }.`}
          </Text>
          {r.incapacityDetermination && r.effectiveTiming !== "immediate" && (
            <View style={[styles.subSection, { marginTop: 8 }]}>
              <Text style={styles.subSectionLabel}>
                Additional Incapacity Determination Instructions:
              </Text>
              <Text style={styles.articleContent}>{r.incapacityDetermination}</Text>
            </View>
          )}
        </View>

        {/* Article VI: Agent&apos;s Duties and Standards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article VI: Agent Duties and Standards</Text>
          <Text style={styles.legalClause}>
            My Agent is a fiduciary who must: (a) act in my best interest; (b) act in good faith;
            (c) act only within the scope of authority granted herein; (d) attempt to preserve my
            estate plan, to the extent known; (e) keep my property separate from the Agent&apos;s
            property; and (f) keep records of all transactions conducted on my behalf.
            {r.accountingRequired
              ? " My Agent shall maintain detailed records of all transactions and provide an accounting upon request by me, my guardian, my conservator, or a court of competent jurisdiction."
              : ""}
          </Text>
        </View>

        {/* Article VII: Limitations on Powers */}
        {r.limitations && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Article VII: Limitations on Powers</Text>
            <Text style={styles.legalClause}>
              Notwithstanding any other provision of this Power of Attorney, my Agent shall NOT have
              authority to:
              {"\n\n"}
              {r.limitations}
            </Text>
          </View>
        )}

        <DocumentFooter
          documentName={documentTitle}
          principalName={(r.fullName as string) || "[YOUR NAME]"}
          pageNumber={2}
        />
      </Page>

      {/* ==================== PAGE 3 ==================== */}
      <Page size="LETTER" style={styles.page}>
        {/* Article VIII: Third-Party Reliance and Protection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article VIII: Third-Party Reliance and Protection</Text>
          <Text style={styles.legalClause}>
            Any third party who receives a copy of this Power of Attorney may rely upon it without
            further investigation. Third parties are protected in relying upon the representations
            of my Agent as to matters relating to the agency. I agree to indemnify and hold harmless
            any third party who acts in good faith reliance on this Power of Attorney.
            {"\n\n"}A third party may not require: (a) an additional or different form of power of
            attorney; (b) a certification of the agent&apos;s authority beyond a copy of this
            document and a written statement by my Agent that this Power of Attorney has not been
            revoked and that I am alive; or (c) the Principal to appear before the third party,
            except as required by applicable law.
            {"\n\n"}A copy or facsimile of this Power of Attorney shall have the same force and
            effect as the original. A third party who refuses to honor this Power of Attorney may be
            liable for damages, including attorney fees, as provided by applicable law.
          </Text>
        </View>

        {/* Article IX: Agent Compensation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article IX: Agent Compensation</Text>
          <Text style={styles.legalClause}>
            {r.agentCompensation === "reasonable"
              ? "My Agent shall be entitled to reasonable compensation for services rendered, consistent with compensation paid to agents in similar circumstances in this state."
              : r.agentCompensation === "none"
                ? "My Agent shall serve without compensation but shall be reimbursed for all reasonable out-of-pocket expenses incurred in the performance of duties as my Agent."
                : r.agentCompensation === "specific"
                  ? `My Agent shall be entitled to compensation of ${r.compensationAmount || "[SPECIFY AMOUNT]"}.`
                  : "My Agent shall be entitled to reasonable compensation for services rendered and reimbursement for reasonable expenses incurred."}
          </Text>
        </View>

        {/* Article X: Revocation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article X: Revocation</Text>
          <Text style={styles.legalClause}>
            I may revoke this Power of Attorney at any time by a written instrument delivered to my
            Agent. Such revocation shall be effective upon actual notice to my Agent. I may also
            revoke this Power of Attorney by destroying this document with the intent to revoke.
            This Power of Attorney automatically revokes any prior general power of attorney I have
            executed. Any third party may rely upon this document until that party has received
            actual written notice of termination, revocation, or expiration.
          </Text>
        </View>

        {/* Article XI: Governing Law */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article XI: Governing Law</Text>
          <Text style={styles.legalClause}>
            This Power of Attorney shall be construed in accordance with the laws of the State of{" "}
            {stateName}
            {finReqs?.specialRequirements
              ? `, including ${finReqs.specialRequirements}`
              : ", including applicable provisions of the Uniform Power of Attorney Act if adopted"}
            . If any provision of this Power of Attorney is deemed invalid or unenforceable, the
            remaining provisions shall continue in full force and effect.
          </Text>
        </View>

        {/* Principal&apos;s Signature */}
        <View style={styles.signatureSection}>
          <Text style={styles.sectionTitle}>Principal Signature</Text>
          <Text style={styles.legalClause}>
            I sign this Durable Power of Attorney voluntarily. I understand that this document gives
            my Agent broad powers to manage my financial affairs. I have read and understand this
            document. I am signing this Power of Attorney of my own free will.
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
            <View style={[styles.signatureLine, { width: "45%" }]} />
            <Text style={styles.signatureLabel}>
              Printed Name: {r.fullName || "[YOUR FULL LEGAL NAME]"}
            </Text>
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

        <DocumentFooter
          documentName={documentTitle}
          principalName={(r.fullName as string) || "[YOUR NAME]"}
          pageNumber={3}
        />
      </Page>

      {/* ==================== PAGE 4 ==================== */}
      <Page size="LETTER" style={styles.page}>
        {/* Notary */}
        {finReqs?.notaryRequired && (
          <NotaryAcknowledgment
            state={data.state}
            principalName={(r.fullName as string) || "[YOUR NAME]"}
          />
        )}

        {/* Article XII: Agent Acceptance and Acknowledgment */}
        <View style={[styles.section, { marginTop: finReqs?.notaryRequired ? 20 : 0 }]}>
          <Text style={styles.sectionTitle}>Article XII: Agent Acceptance and Acknowledgment</Text>
          <Text style={styles.legalClause}>
            By signing below, the Agent named in this Power of Attorney acknowledges that:
          </Text>
          <View style={styles.subSection}>
            <Text style={styles.articleContent}>
              1. The Agent has read and understands this Power of Attorney;{"\n\n"}
              2. The Agent owes a fiduciary duty to the Principal;{"\n\n"}
              3. The Agent must act in good faith and in the Principal&apos;s best interests;
              {"\n\n"}
              4. The Agent must keep the Principal&apos;s property separate from the Agent&apos;s
              property;
              {"\n\n"}
              5. The Agent must maintain records of all transactions conducted on behalf of the
              Principal;{"\n\n"}
              6. The Agent may be liable for breach of fiduciary duty.
            </Text>
          </View>

          <View style={[styles.signatureBlock, { marginTop: 15 }]}>
            <Text style={styles.fieldLabel}>PRIMARY AGENT ACCEPTANCE:</Text>
            <View style={styles.signatureRow}>
              <View style={styles.signatureColumn}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>Agent Signature</Text>
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
            <Text style={styles.sectionTitle}>Successor Agent Acceptance and Acknowledgment</Text>
            <Text style={styles.legalClause}>
              By signing below, the Successor Agent named in this Power of Attorney acknowledges the
              same duties and responsibilities listed above for the Primary Agent, and agrees to
              serve if the Primary Agent is unable or unwilling to serve.
            </Text>

            <View style={[styles.signatureBlock, { marginTop: 15 }]}>
              <Text style={styles.fieldLabel}>SUCCESSOR AGENT ACCEPTANCE:</Text>
              <View style={styles.signatureRow}>
                <View style={styles.signatureColumn}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureLabel}>Successor Agent Signature</Text>
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

        {/* Important Notices */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Important Notices</Text>
          <Text style={[styles.legalClause, { fontSize: 8 }]}>
            TO THE PRINCIPAL: This Power of Attorney grants broad powers to your Agent. You should
            select your Agent carefully and consider limiting the powers granted. An Agent must act
            in your best interest, keep accurate records, and keep your money and property separate
            from their own. You have the right to revoke this Power of Attorney at any time.
            {"\n\n"}
            TO THE AGENT: You have been granted authority to act on behalf of the Principal. You
            must act within the scope of authority granted, exercise reasonable care, and keep
            accurate records. You may be liable for damages if you violate your duties.
            {"\n\n"}
            TO THIRD PARTIES: You may rely on this Power of Attorney and must accept it unless you
            have actual knowledge that it is void, invalid, or terminated. If you refuse without
            reasonable cause, you may be liable for damages including attorney fees.
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
