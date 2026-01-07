"use client";

import { Document, Page, Text, View } from "@react-pdf/renderer";
import {
  getStateLegalRequirements,
  STATE_NAMES,
  type USState,
} from "@/lib/state-legal-requirements";
import { type LegalDocumentPDFData, NotaryAcknowledgment, styles } from "./shared-components";

export function TrustPDFGenerator({ data }: { data: LegalDocumentPDFData }) {
  const r = data.responses;
  const requirements = getStateLegalRequirements(data.state as USState);
  const trustReqs = requirements?.revocable_trust;
  const stateName = STATE_NAMES[data.state as USState] || data.state;

  // Helper function to get dynamic article numbers based on optional sections
  const getArticleNumbers = () => {
    let articleNum = 8; // After governing law (Article VIII)
    const articles: { noContest?: number; poA?: number } = {};

    if (r.includeNoContest) {
      articleNum++;
      articles.noContest = articleNum;
    }
    if (r.includePoA) {
      articleNum++;
      articles.poA = articleNum;
    }
    return articles;
  };

  const articleNumbers = getArticleNumbers();

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
            This Revocable Living Trust Agreement (the &quot;Trust&quot; or &quot;Trust
            Agreement&quot;) is made this _____ day of _______________, 20___, by and between:
            {"\n\n"}
            GRANTOR: {r.fullName || "[YOUR FULL LEGAL NAME]"}, of {r.address || "[YOUR ADDRESS]"}
            (hereinafter &quot;Grantor&quot; or &quot;Settlor&quot;)
            {"\n\n"}
            and
            {"\n\n"}
            TRUSTEE: {r.initialTrustee || r.fullName || "[TRUSTEE NAME]"} (hereinafter
            &quot;Trustee&quot;)
            {"\n\n"}
            This Trust shall be known as &quot;{r.trustName || "The [YOUR NAME] Living Trust"}&quot;
            dated [DATE].
          </Text>
        </View>

        {/* Article I: Trust Property - Enhanced */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article I: Trust Property</Text>
          <Text style={styles.legalClause}>
            Section 1.1. Initial Trust Property. The Grantor hereby transfers to the Trustee the
            property described in Schedule A attached hereto and incorporated herein by reference
            (the &quot;Initial Trust Property&quot;). The Trustee agrees to hold such property,
            together with any other property subsequently transferred to the Trust, as trust
            property, to be administered according to the terms of this Trust Agreement.
            {"\n\n"}
            Section 1.2. Schedule A Reference. Schedule A, attached hereto and made a part of this
            Trust Agreement, contains a description of all property initially transferred to this
            Trust. Schedule A may be amended from time to time by the Grantor during the
            Grantor&apos;s lifetime to reflect additional property transferred to the Trust, without
            the necessity of amending this Trust Agreement.
            {"\n\n"}
            Section 1.3. Additional Contributions. The Grantor, or any other person with the
            Trustee&apos;s consent, may transfer additional property to this Trust at any time
            during the Grantor&apos;s lifetime. Such property shall be added to Schedule A or a
            supplemental schedule and shall be held, administered, and distributed as part of the
            Trust estate according to the terms of this Trust Agreement.
            {"\n\n"}
            Section 1.4. Retirement Account Designations. The Trustee is authorized to accept as
            trust property the proceeds of any Individual Retirement Account (IRA), 401(k), pension,
            profit-sharing plan, or other retirement account or plan for which the Trust has been
            designated as beneficiary. Such proceeds shall be administered as part of the trust
            estate, subject to any required minimum distribution rules. The Trustee shall have the
            authority to make elections regarding distribution options for such accounts as the
            Trustee deems appropriate.
            {"\n\n"}
            Section 1.5. Life Insurance Proceeds. The Trustee is authorized to accept as trust
            property the proceeds of any life insurance policy for which the Trust has been
            designated as beneficiary. Such proceeds shall be added to the trust estate and
            administered according to the terms of this Trust Agreement.
          </Text>
        </View>

        {/* Article II: During Grantor&apos;s Lifetime */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Article II: Provisions During Grantor&apos;s Lifetime and Capacity
          </Text>
          <Text style={styles.legalClause}>
            Section 2.1. During the Grantor&apos;s lifetime and while the Grantor has capacity, the
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
            Article III: Provisions During Grantor&apos;s Incapacity
          </Text>
          <Text style={styles.legalClause}>
            Section 3.1. Determination of Incapacity. The Grantor shall be considered incapacitated
            when two licensed physicians certify in writing that the Grantor is unable to manage
            financial affairs due to mental or physical infirmity.
            {"\n\n"}
            Section 3.2. Management During Incapacity. During incapacity: (a) the Trustee shall
            manage the Trust estate for the Grantor&apos;s benefit; (b) pay net income to or for the
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
          <Text style={styles.sectionTitle}>
            Article IV: Distribution Upon Grantor&apos;s Death
          </Text>
          <Text style={styles.legalClause}>
            Section 4.1. Payment of Debts and Expenses. The Trustee may pay from the Trust estate
            the Grantor&apos;s legally enforceable debts, funeral expenses, and costs of
            administration.
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
              : "\nContingent: To Grantor&apos;s descendants, per stirpes"}
            {"\n\n"}
            Section 4.4. Distribution Timing:{" "}
            {r.distributionTiming === "immediate"
              ? "Immediately upon Grantor&apos;s death"
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

        {/* Article V: Trustee Provisions - Enhanced */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article V: Trustee Provisions</Text>
          <Text style={styles.legalClause}>
            Section 5.1. Successor Trustees. If the initial Trustee is unable or unwilling to serve:
            {"\n"}
            First Successor: {r.successorTrustee || "[SUCCESSOR TRUSTEE]"}
            {r.successorRelationship ? ` (${r.successorRelationship})` : ""}
            {r.secondSuccessorTrustee ? `\nSecond Successor: ${r.secondSuccessorTrustee}` : ""}
            {"\n\n"}
            Section 5.2. Comprehensive Trustee Powers. In addition to all powers conferred by law,
            the Trustee shall have the following powers, to be exercised in the Trustee&apos;s sole
            discretion:
            {"\n\n"}
            (a) Investment Powers. To invest and reinvest trust funds in any kind of property, real,
            personal, or mixed, including but not limited to stocks, bonds, mutual funds, real
            estate, mortgages, and other investments, without being limited by any statute or rule
            of law concerning investments by fiduciaries. The Trustee may retain any property
            received as part of the Trust estate, regardless of diversification requirements.
            {"\n\n"}
            (b) Real Estate Powers. To acquire, hold, manage, improve, repair, lease, sell,
            exchange, partition, subdivide, grant options on, and dispose of real property; to
            construct, renovate, demolish, or alter buildings or structures; to grant easements and
            covenants; and to take any other action concerning real property that an individual
            owner could take.
            {"\n\n"}
            (c) Business Powers. To continue, participate in, sell, or liquidate any business
            interest held by the Trust; to become a limited or general partner; to form or
            participate in corporations, limited liability companies, or other business entities;
            and to exercise all rights of a business owner or partner.
            {"\n\n"}
            (d) Power to Hire Professionals. To employ and compensate attorneys, accountants,
            investment advisors, tax professionals, property managers, custodians, and any other
            agents, professionals, or experts as the Trustee deems necessary for proper
            administration of the Trust. The Trustee may rely upon the advice of such professionals
            without liability.
            {"\n\n"}
            (e) Power to Make Loans. To lend money to any person, including beneficiaries, with or
            without security, at such interest rates as the Trustee deems appropriate; and to
            guarantee obligations of others when in the best interest of the Trust.
            {"\n\n"}
            (f) Power to Distribute in Kind. To make distributions in cash or in kind, or partly in
            each, and to allocate specific assets among beneficiaries without regard to the income
            tax basis of such assets. The Trustee&apos;s determination of values for purposes of
            distribution shall be binding on all beneficiaries.
            {"\n\n"}
            (g) Power to Borrow. To borrow money from any source, including from trust
            beneficiaries, and to encumber trust property as security for such loans.
            {"\n\n"}
            (h) Tax Elections. To make any tax elections permitted by law, including elections
            regarding Subchapter S corporations, income tax allocations, and estate tax deductions.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>{r.trustName || "Living Trust"} | Page 2</Text>
        </View>
      </Page>

      {/* Page 3 - Continued Provisions */}
      <Page size="LETTER" style={styles.page}>
        {/* Trustee Provisions Continued */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article V: Trustee Provisions (Continued)</Text>
          <Text style={styles.legalClause}>
            Section 5.3. Compensation. The Trustee shall be entitled to reasonable compensation for
            services rendered, in accordance with the fee schedules of professional trustees in the
            area, or as otherwise agreed. The Trustee shall also be entitled to reimbursement for
            all reasonable expenses incurred in administering the Trust.
            {"\n\n"}
            Section 5.4. Bond Waiver. No Trustee shall be required to post bond or other security in
            any jurisdiction.
            {"\n\n"}
            Section 5.5. Limitation of Liability. No Trustee shall be liable for any act or omission
            except for willful misconduct or gross negligence. A Trustee shall not be liable for
            acts of any predecessor, successor, or co-trustee.
            {"\n\n"}
            Section 5.6. Resignation. Any Trustee may resign at any time by giving thirty (30) days
            written notice to the Grantor (if living and competent) or to the adult beneficiaries
            then entitled to receive distributions.
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
            Grantor&apos;s lifetime, provided the Grantor has capacity. Any amendment must be in
            writing, signed by the Grantor, and delivered to the Trustee. This Trust shall become
            irrevocable upon the Grantor&apos;s death.
          </Text>
        </View>

        {/* Article VIII: Governing Law */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Article VIII: Governing Law</Text>
          <Text style={styles.legalClause}>
            This Trust shall be governed by the laws of the State of {stateName}.
            {trustReqs?.specialRequirements ? ` ${trustReqs.specialRequirements}` : ""}
          </Text>
        </View>

        {/* Article IX: No-Contest Provision (Optional) */}
        {r.includeNoContest && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Article {articleNumbers.noContest}: No-Contest Provision
            </Text>
            <Text style={styles.legalClause}>
              If any beneficiary under this Trust, directly or indirectly, contests or attacks this
              Trust or any of its provisions, or any amendment hereto, or conspires with or assists
              anyone in any such contest, or pursues any creditor&apos;s claim or other legal
              proceeding that is adverse to the Trust or its administration, any share or interest
              in the Trust given to that beneficiary shall be revoked and distributed as if the
              contesting beneficiary had predeceased the Grantor without surviving descendants.
              {"\n\n"}
              This no-contest provision shall be enforced to the maximum extent permitted by the
              laws of the State of {stateName}. A beneficiary shall not be deemed to have contested
              this Trust merely by: (a) asserting a claim as a creditor of the Grantor&apos;s
              estate; or (b) seeking clarification of the Trust terms from a court of competent
              jurisdiction.
            </Text>
          </View>
        )}

        {/* Article X: Powers of Appointment (Optional) */}
        {r.includePoA && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Article {articleNumbers.poA}: Powers of Appointment
            </Text>
            <Text style={styles.legalClause}>
              The Grantor reserves a limited testamentary power of appointment over the trust
              property, exercisable by specific reference to this power in the Grantor&apos;s Last
              Will and Testament, to appoint any part or all of the trust property among such
              persons (other than the Grantor, the Grantor&apos;s estate, the Grantor&apos;s
              creditors, or creditors of the Grantor&apos;s estate) as the Grantor may designate.
              {"\n\n"}
              Any exercise of this power of appointment must be in writing and must specifically
              refer to this Trust by name and date. To the extent this power is not exercised, the
              trust property shall be distributed according to the other provisions of this Trust
              Agreement.
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text>{r.trustName || "Living Trust"} | Page 3</Text>
        </View>
      </Page>

      {/* Page 4 - Signatures */}
      <Page size="LETTER" style={styles.page}>
        {/* Execution */}
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

        <View style={styles.footer}>
          <Text>{r.trustName || "Living Trust"} | Page 4</Text>
        </View>
      </Page>

      {/* Schedule A - Initial Trust Property */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Schedule A</Text>
          <Text style={styles.subtitle}>Initial Trust Property</Text>
        </View>

        <Text style={styles.legalClause}>
          The following property is hereby transferred to{" "}
          {r.trustName || "The [YOUR NAME] Living Trust"}:
        </Text>

        {r.realProperty || r.realEstate ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Real Property</Text>
            <Text style={styles.articleContent}>
              {(r.realProperty as string) || (r.realEstate as string)}
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Real Property</Text>
            <Text style={styles.articleContent}>
              [List all real property by legal description, including address, county, and state.
              Attach deeds as necessary.]
            </Text>
          </View>
        )}

        {r.bankAccounts ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bank and Deposit Accounts</Text>
            <Text style={styles.articleContent}>{r.bankAccounts as string}</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bank and Deposit Accounts</Text>
            <Text style={styles.articleContent}>
              [List all checking, savings, money market, and certificate of deposit accounts by
              institution name and account number (last 4 digits).]
            </Text>
          </View>
        )}

        {r.investmentAccounts || r.investments ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Investment Accounts</Text>
            <Text style={styles.articleContent}>
              {(r.investmentAccounts as string) || (r.investments as string)}
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Investment Accounts</Text>
            <Text style={styles.articleContent}>
              [List all brokerage, mutual fund, and other investment accounts by institution name
              and account number (last 4 digits).]
            </Text>
          </View>
        )}

        {r.personalProperty ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Property</Text>
            <Text style={styles.articleContent}>{r.personalProperty as string}</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Property</Text>
            <Text style={styles.articleContent}>
              [List all tangible personal property such as vehicles, jewelry, artwork, collectibles,
              and household items of significant value.]
            </Text>
          </View>
        )}

        {r.businessInterests ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Interests</Text>
            <Text style={styles.articleContent}>{r.businessInterests as string}</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Interests</Text>
            <Text style={styles.articleContent}>
              [List all business ownership interests, including corporation stock, LLC membership
              interests, partnership interests, and sole proprietorships.]
            </Text>
          </View>
        )}

        {r.otherAssets && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Other Assets</Text>
            <Text style={styles.articleContent}>{r.otherAssets as string}</Text>
          </View>
        )}

        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={styles.fieldLabel}>
            Additional Property (attach additional pages as needed):
          </Text>
          <View style={{ height: 100, borderWidth: 1, borderColor: "#ccc", marginTop: 8 }} />
        </View>

        <View style={styles.footer}>
          <Text>Schedule A | {r.trustName || "Living Trust"}</Text>
        </View>
      </Page>

      {/* Certification of Trust Page */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Certification of Trust</Text>
          <Text style={styles.stateInfo}>State of {stateName}</Text>
        </View>

        <Text style={styles.legalClause}>
          The undersigned Trustee(s) of {r.trustName || "The [YOUR NAME] Living Trust"} hereby
          certify that:
        </Text>

        <View style={styles.subSection}>
          <Text style={styles.articleContent}>
            1. The Trust was created on {(r.trustDate as string) || "[DATE]"}.{"\n\n"}
            2. The Trust has not been revoked, modified, or amended in any manner that would cause
            this certification to be incorrect.
            {"\n\n"}
            3. The currently acting Trustee(s) are:{" "}
            {(r.initialTrustee as string) || (r.fullName as string) || "[TRUSTEE]"}.{"\n\n"}
            4. The Trustee(s) have full power and authority under the Trust to engage in
            transactions involving real property, personal property, and financial accounts,
            including but not limited to the power to:
            {"\n"}
            {"   "}a. Buy, sell, exchange, and convey real and personal property;
            {"\n"}
            {"   "}b. Borrow money and encumber trust property as security;
            {"\n"}
            {"   "}c. Open, maintain, and close bank and investment accounts;
            {"\n"}
            {"   "}d. Enter into contracts and execute documents on behalf of the Trust.
            {"\n\n"}
            5. The Trust is revocable by the Grantor during the Grantor&apos;s lifetime.
            {"\n\n"}
            6. The tax identification number of the Trust is the Grantor&apos;s Social Security
            Number during the Grantor&apos;s lifetime. After the Grantor&apos;s death, the Trust
            will obtain a separate Employer Identification Number (EIN).
            {"\n\n"}
            7. The title to trust assets should be held in the following manner:
            {"\n"}
            {"   "}
            {(r.initialTrustee as string) || (r.fullName as string) || "[TRUSTEE NAME]"}, Trustee of
            the {r.trustName || "[TRUST NAME]"} dated [DATE].
          </Text>
        </View>

        <Text style={[styles.legalClause, { marginTop: 12 }]}>
          This certification is made pursuant to {stateName} law. The Trustee(s) understand that any
          person or entity may rely upon this certification without liability to the Trust,
          Trustee(s), or beneficiaries, and that a copy of this certification may be accepted in
          lieu of the original.
        </Text>

        <View style={[styles.signatureBlock, { marginTop: 20 }]}>
          <View style={styles.signatureRow}>
            <View style={styles.signatureColumn}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Trustee Signature</Text>
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
              <Text style={styles.signatureLabel}></Text>
            </View>
          </View>
        </View>

        <NotaryAcknowledgment
          state={data.state}
          principalName={(r.fullName as string) || "[TRUSTEE]"}
        />

        <View style={styles.footer}>
          <Text>Certification of Trust | {r.trustName || "Living Trust"}</Text>
        </View>
      </Page>
    </Document>
  );
}
