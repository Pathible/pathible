/**
 * Estate Checklist Templates
 *
 * Default checklist items seeded when estate mode is activated.
 * Categories follow a progressive disclosure pattern:
 * - "first_things_first" items appear immediately
 * - "when_ready" items hidden until 50%+ of first_things_first are complete
 *
 * Sources consulted:
 * - AARP: https://www.aarp.org/family-relationships/when-loved-one-dies-checklist/
 * - American Bar Association: https://www.americanbar.org/groups/real_property_trust_estate/resources/estate-planning/guidelines-individual-executors-trustees/
 * - Nolo: https://www.nolo.com/legal-encyclopedia/executor-estate-checklist-29458.html
 * - Executor.org: https://executor.org/
 * - IRS: https://www.irs.gov/businesses/small-businesses-self-employed/estate-tax
 */

export interface ChecklistTemplate {
  title: string;
  description: string;
  category:
    | "first_things_first"
    | "legal_and_financial"
    | "property_and_assets"
    | "notifications"
    | "ongoing"
    | "when_ready";
  sortOrder: number;
}

export const estateChecklistTemplates: ChecklistTemplate[] = [
  // ============================================================================
  // FIRST THINGS FIRST - Immediate priorities (days 1-14)
  // ============================================================================
  {
    title: "Obtain certified copies of the death certificate",
    description:
      "Request at least 10-15 certified copies from the funeral home or vital records office. Banks, insurance companies, government agencies, the probate court, and financial institutions each require an original certified copy. Photocopies are generally not accepted. Complex estates with multiple properties or accounts may need 15-20. It's easier and cheaper to order extra copies now than to request more later. Source: AARP recommends at least a dozen; Nolo and Fidelity recommend 10-12 minimum.",
    category: "first_things_first",
    sortOrder: 100,
  },
  {
    title: "Locate the original will and/or trust documents",
    description:
      "Check the deceased's files, safe deposit box, or attorney's office for the original will and any trust documents. A photocopy of the will is generally not sufficient for probate. The original with wet signatures is required. Also look for any codicils (amendments to the will) or revocable living trust documents.",
    category: "first_things_first",
    sortOrder: 200,
  },
  {
    title: "Access and inventory safe deposit boxes",
    description:
      "Safe deposit boxes may be sealed upon death in some states and require specific legal procedures to access. You may need the death certificate and Letters Testamentary, or a court order depending on your state. The box may need to be inventoried in the presence of a bank representative. Critical estate documents (will, deeds, insurance policies) are often stored here.",
    category: "first_things_first",
    sortOrder: 250,
  },
  {
    title: "Contact the estate attorney",
    description:
      "Reach out to the deceased's attorney or find one who specializes in probate and estate administration in your state. An experienced probate attorney can guide you through your state's specific requirements, filing deadlines, and help you avoid personal liability. Many offer a free initial consultation.",
    category: "first_things_first",
    sortOrder: 300,
  },
  {
    title: "Secure the deceased's property",
    description:
      "Make sure homes, vehicles, and valuables are locked and secured. Change locks if necessary and verify that homeowner's, renter's, and auto insurance coverage is active. Some policies lapse upon the policyholder's death, so contact each insurer right away. Remove perishable items and keep utilities on to prevent property damage.",
    category: "first_things_first",
    sortOrder: 400,
  },
  {
    title: "Arrange care for pets",
    description:
      "Pets need immediate attention. Arrange temporary care or boarding, and check the will for any pet-related bequests or designated caretakers. The estate can cover care and boarding costs. If no caretaker is designated, arrange for rehoming. Pets are legally considered estate property in most states.",
    category: "first_things_first",
    sortOrder: 450,
  },
  {
    title: "Notify the employer and check for benefits",
    description:
      "Contact the deceased's employer (or former employer) about final paycheck, accrued vacation pay, life insurance through work, retirement accounts (401k, pension), and any other death benefits such as survivor income or EAP benefits. Ask about COBRA continuation coverage for dependents.",
    category: "first_things_first",
    sortOrder: 500,
  },
  {
    title: "File the will with the probate court",
    description:
      "Most states require the original will to be filed with the local probate court within a specific timeframe (often 30 days of death), even if full probate isn't needed. Failure to file can result in legal penalties in some jurisdictions. The court will determine if probate is required based on the estate's assets and how they're titled.",
    category: "first_things_first",
    sortOrder: 600,
  },
  {
    title: "Apply for Letters Testamentary or Letters of Administration",
    description:
      "This court-issued document gives you legal authority to act on behalf of the estate. Without it, banks, financial institutions, and government agencies won't let you access or manage the deceased's accounts and assets. The process requires filing a petition with the probate court and may include a hearing.",
    category: "first_things_first",
    sortOrder: 700,
  },
  {
    title: "Publish notice to creditors",
    description:
      "Most states legally require the executor to publish a notice to creditors in a local newspaper of general circulation, typically once per week for 3-4 consecutive weeks. This creates a statutory deadline (commonly 3-6 months) for creditors to file claims against the estate. Without proper notice, the executor may be personally liable for debts paid to beneficiaries instead of legitimate creditors. Your probate attorney can handle this filing. Source: Required in most U.S. states; see your state's probate code.",
    category: "first_things_first",
    sortOrder: 800,
  },

  // ============================================================================
  // LEGAL & FINANCIAL - Court and financial matters
  // ============================================================================
  {
    title: "Obtain an EIN (Employer Identification Number) for the estate",
    description:
      "Apply for an EIN from the IRS. It's free and you can do it online. You'll need this to open an estate bank account, file estate tax returns, and manage estate finances. The estate is a separate tax entity from the deceased individual. https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online",
    category: "legal_and_financial",
    sortOrder: 100,
  },
  {
    title: "Open an estate bank account",
    description:
      "Open a checking account in the name of the estate (e.g., 'Estate of [Name], [Your Name] Executor'). You'll need the EIN and Letters Testamentary. All estate income and expenses must flow through this account. Never co-mingle estate funds with personal funds, as this can create personal liability.",
    category: "legal_and_financial",
    sortOrder: 200,
  },
  {
    title: "Notify banks and financial institutions",
    description:
      "Contact all banks, brokerages, and financial institutions where the deceased held accounts. Provide a certified death certificate and Letters Testamentary. Accounts will typically be frozen or retitled. Request current account statements and balances for the estate inventory.",
    category: "legal_and_financial",
    sortOrder: 300,
  },
  {
    title: "Notify institutions of power of attorney termination",
    description:
      "While power of attorney automatically terminates at death, you need to notify all financial institutions and agents where a POA was active. Present the death certificate and request that any agent access be revoked immediately. This prevents unauthorized post-death transactions and protects the estate from fraud.",
    category: "legal_and_financial",
    sortOrder: 350,
  },
  {
    title: "Review all beneficiary designations",
    description:
      "Beneficiary designations on life insurance, retirement accounts (401k, IRA), payable-on-death (POD) bank accounts, and transfer-on-death (TOD) investment accounts override the will. Verify that all designations are current and reflect the deceased's intent. Assets with valid beneficiary designations pass outside of probate directly to the named beneficiaries.",
    category: "legal_and_financial",
    sortOrder: 375,
  },
  {
    title: "Contact life insurance companies",
    description:
      "File claims with all life insurance carriers. Gather policy numbers and beneficiary information. Life insurance proceeds are generally paid directly to named beneficiaries and aren't part of the probate estate. Contact the employer for any group life insurance policies as well. If you can't find policies, try the NAIC Life Insurance Policy Locator at https://eapps.naic.org/life-policy-locator/",
    category: "legal_and_financial",
    sortOrder: 400,
  },
  {
    title: "Review and manage retirement accounts",
    description:
      "Contact 401(k), IRA, and pension administrators. Beneficiary designations typically allow these to pass outside of probate. Non-spouse beneficiaries of inherited IRAs generally must withdraw all funds within 10 years under the SECURE Act. Consult a tax professional about the tax implications of different distribution options.",
    category: "legal_and_financial",
    sortOrder: 500,
  },
  {
    title: "File the final personal income tax return",
    description:
      "File a federal (and state, if applicable) income tax return for the deceased for the year of death (Form 1040). This covers income from January 1 through the date of death. Due April 15 of the following year. Write 'DECEASED' across the top of the return with the date of death. The surviving spouse (if any) may file jointly for the year of death.",
    category: "legal_and_financial",
    sortOrder: 600,
  },
  {
    title: "File estate income tax returns if needed",
    description:
      "If the estate earns income after the date of death (interest, rent, dividends, business income, etc.), file IRS Form 1041 (U.S. Income Tax Return for Estates and Trusts). The estate's tax year begins on the day after death. Consult a tax professional, as estate income tax rules are complex. More at https://www.irs.gov/forms-pubs/about-form-1041",
    category: "legal_and_financial",
    sortOrder: 700,
  },
  {
    title: "Determine if a federal or state estate tax return is required",
    description:
      "For 2025, estates exceeding $13.99 million must file federal Form 706. Starting in 2026, the threshold is $15 million (permanently set by the One Big Beautiful Bill Act, signed July 2025). However, 13 states and D.C. have their own estate taxes with much lower thresholds, as low as $1 million in Massachusetts and Oregon. Other states with estate taxes include: Connecticut, Hawaii, Illinois, Maine, Maryland, Minnesota, New York, Rhode Island, Vermont, Washington, and D.C. Consult a tax professional. More at https://www.irs.gov/businesses/small-businesses-self-employed/estate-tax",
    category: "legal_and_financial",
    sortOrder: 800,
  },
  {
    title: "Pay outstanding debts in the order required by state law",
    description:
      "State law mandates a specific priority order for paying debts. Paying debts out of order can expose the executor to personal liability. Typical priority: (1) estate administration costs (attorney, executor fees), (2) funeral expenses, (3) federal taxes, (4) final medical expenses, (5) state taxes and Medicaid recovery claims, (6) other secured debts, (7) unsecured debts. Wait until the creditor claims period expires before making final payments. Consult your estate attorney for your state's specific rules.",
    category: "legal_and_financial",
    sortOrder: 900,
  },
  {
    title: "Review Medicaid Estate Recovery Program (MERP) claims",
    description:
      "If the deceased received Medicaid benefits for long-term care (nursing home, home health), the state may file a claim against the estate to recover those costs. Medicaid Estate Recovery is required by federal law in all states. The claim can be substantial and takes priority over distributions to beneficiaries. Check with your state's Medicaid agency early in the process. Learn more at https://www.medicaidplanningassistance.org/medicaid-estate-recovery-program/",
    category: "legal_and_financial",
    sortOrder: 950,
  },

  // ============================================================================
  // PROPERTY & ASSETS - Physical and digital assets
  // ============================================================================
  {
    title: "Create a complete inventory of assets",
    description:
      "List all assets including real estate, vehicles, bank accounts, investments, personal property, digital assets, and business interests with their estimated values as of the date of death. This inventory is required for the probate court, tax filings, and equitable distribution. Include account numbers, locations, and current balances where available.",
    category: "property_and_assets",
    sortOrder: 100,
  },
  {
    title: "Search for unclaimed property and assets",
    description:
      "Search state unclaimed property databases for forgotten bank accounts, uncashed checks, matured insurance policies, and abandoned assets. Every state maintains a searchable database. Also check for unclaimed tax refunds, utility deposits, and class action settlement funds. A good starting point is https://www.missingmoney.com which searches multiple states at once.",
    category: "property_and_assets",
    sortOrder: 150,
  },
  {
    title: "Arrange for property appraisals",
    description:
      "Get professional appraisals for real estate, valuable personal property (jewelry, art, collectibles, antiques), and business interests. The date-of-death fair market value is needed for tax purposes and equitable distribution. Use qualified appraisers. The IRS requires qualified appraisals for items valued over $5,000.",
    category: "property_and_assets",
    sortOrder: 200,
  },
  {
    title: "Transfer vehicle titles",
    description:
      "Contact your state's DMV to transfer vehicle titles. You'll need the death certificate, Letters Testamentary, current title documents, and potentially an odometer disclosure. Each state has its own forms and procedures. Also cancel the deceased's vehicle registration and return license plates if required by your state.",
    category: "property_and_assets",
    sortOrder: 300,
  },
  {
    title: "Manage real estate",
    description:
      "Maintain insurance, pay property taxes and mortgage, and arrange for ongoing upkeep and maintenance. Determine whether to sell, transfer, or distribute each property. For sales, you may need court approval depending on your state. Have properties professionally inspected before listing. Notify the mortgage company of the death, as some mortgages have a due-on-sale clause.",
    category: "property_and_assets",
    sortOrder: 400,
  },
  {
    title: "Secure digital assets and online accounts",
    description:
      "Identify email, social media, cloud storage, cryptocurrency, and subscription accounts. Follow each platform's process for deceased user accounts. Major platforms: Google Inactive Account Manager, Facebook Memorialization, Apple Digital Legacy. For cryptocurrency, locate wallet addresses and private keys. Without these, assets may be permanently inaccessible. See each platform's legacy contact or deceased user policies.",
    category: "property_and_assets",
    sortOrder: 500,
  },
  {
    title: "Handle business interests",
    description:
      "If the deceased owned a business, review partnership agreements, operating agreements, buy-sell agreements, or shareholder documents for succession provisions. Secure business assets and records. You may need to continue operating the business or arrange an orderly wind-down. Consult a business attorney for ownership transfer, valuation, and tax implications.",
    category: "property_and_assets",
    sortOrder: 600,
  },
  {
    title: "Manage storage units and secure personal belongings",
    description:
      "Locate all storage units and rental lockers. Rental payments continue and are the estate's obligation. Missed payments can result in auction of contents. Document and inventory all contents for the estate records. Arrange for consolidation or disposition of items as appropriate.",
    category: "property_and_assets",
    sortOrder: 700,
  },
  {
    title: "Identify and address pending lawsuits or legal claims",
    description:
      "Determine if the deceased was involved in any pending litigation, whether as plaintiff or defendant. The executor must continue, settle, or dismiss these cases. Also assess whether the estate has any claims to pursue (wrongful death, personal injury survival actions, breach of contract). Consult the estate attorney for guidance on each matter.",
    category: "property_and_assets",
    sortOrder: 800,
  },

  // ============================================================================
  // NOTIFICATIONS - Government and institutional notifications
  // ============================================================================
  {
    title: "Notify Social Security Administration",
    description:
      "Report the death to SSA by calling 1-800-772-1213. The funeral home may do this, but verify. Return any Social Security payments received after the date of death. Surviving spouses and minor children may be eligible for survivor benefits. Apply promptly, as some benefits have retroactivity limits. Learn more at https://www.ssa.gov/benefits/survivors/",
    category: "notifications",
    sortOrder: 100,
  },
  {
    title: "Cancel or transfer health insurance",
    description:
      "Notify health insurance providers of the death. Dependents covered under the deceased's plan are eligible for COBRA continuation coverage (typically 36 months for death of the covered employee) or may need to find new coverage through the marketplace or employer. File any outstanding medical claims before canceling the policy.",
    category: "notifications",
    sortOrder: 200,
  },
  {
    title: "Notify the post office",
    description:
      "Forward the deceased's mail to the executor's address so important correspondence (bills, tax documents, account statements, legal notices) isn't missed. File USPS Form 3575 online or at your local post office. Mail forwarding lasts up to 12 months.",
    category: "notifications",
    sortOrder: 300,
  },
  {
    title: "Cancel or transfer utilities and subscriptions",
    description:
      "Review and cancel or transfer utility accounts (electric, gas, water, internet, phone), streaming services, gym memberships, newspaper subscriptions, and all recurring charges. Check bank and credit card statements for recurring charges that may not be obvious. Keep utilities active on properties until they're sold or transferred.",
    category: "notifications",
    sortOrder: 400,
  },
  {
    title: "Place fraud alerts, credit freezes, and notify credit agencies",
    description:
      "Report the death to all three credit bureaus: Equifax (1-888-298-0045), Experian (1-888-397-3742), and TransUnion (1-800-680-7289). Request a deceased alert on the credit file. Go further: place a credit freeze to prevent new accounts from being opened. Deceased individuals are prime targets for identity theft. Monitor credit reports for 12-24 months after death for fraudulent activity. FTC has helpful guidance at https://consumer.ftc.gov/articles/what-do-about-identity-theft-deceased-person",
    category: "notifications",
    sortOrder: 500,
  },
  {
    title: "Cancel driver's license and notify the DMV",
    description:
      "Contact the state DMV where the deceased's license was issued to cancel it. This is a separate step from transferring vehicle titles and is important for preventing identity theft. You'll need the death certificate and may need to surrender the physical license. Each state has its own form and process.",
    category: "notifications",
    sortOrder: 550,
  },
  {
    title: "Cancel professional licenses, certifications, and memberships",
    description:
      "Cancel or notify: professional licenses (medical, legal, real estate, CPA, etc.), union memberships, professional association memberships, trade organizations, alumni associations, and social clubs. Ongoing fees drain the estate, and active professional licenses can be misused for identity fraud. Each organization typically requires a death certificate copy.",
    category: "notifications",
    sortOrder: 575,
  },
  {
    title: "Contact the Department of Veterans Affairs if applicable",
    description:
      "If the deceased was a veteran, contact the VA at 1-800-827-1000 about burial benefits (up to $2,000 for service-related death, or burial allowance for non-service-related), survivor benefits (DIC), a memorial marker or headstone, and a Presidential Memorial Certificate. Surviving spouses and dependents may be eligible for ongoing benefits. More at https://www.va.gov/survivors/",
    category: "notifications",
    sortOrder: 600,
  },

  // ============================================================================
  // ONGOING - Recurring responsibilities during administration
  // ============================================================================
  {
    title: "Keep detailed records of all estate transactions",
    description:
      "Document every payment, receipt, decision, and communication with a date and explanation. You'll need to provide a formal accounting to the probate court and beneficiaries. Keep records of why decisions were made. This protects you if your decisions are later questioned. The ABA recommends maintaining a separate file for each asset, creditor, and beneficiary.",
    category: "ongoing",
    sortOrder: 100,
  },
  {
    title: "Communicate regularly with beneficiaries",
    description:
      "Keep beneficiaries informed of progress, timeline, and any issues. Many states require formal notice to beneficiaries at key milestones (filing, inventory, proposed distribution). Transparency reduces disputes and builds trust. Document all communications. Consider sending written updates at least quarterly during extended administrations.",
    category: "ongoing",
    sortOrder: 200,
  },
  {
    title: "Maintain insurance coverage on all estate property",
    description:
      "Keep homeowner's, auto, liability, and other insurance policies active until assets are distributed or sold. Contact each insurer to update the named insured to the estate. Some policies may lapse or provide reduced coverage if not retitled. The executor can be personally liable for uninsured losses to estate property.",
    category: "ongoing",
    sortOrder: 300,
  },
  {
    title: "Monitor estate bank account and cash flow",
    description:
      "Make sure there are sufficient funds to pay estate expenses (attorney fees, taxes, maintenance, insurance). Track all income (interest, rent, dividends) and disbursements. If the estate lacks liquidity, you may need to sell assets. Consult with the attorney and beneficiaries before doing so.",
    category: "ongoing",
    sortOrder: 400,
  },

  // ============================================================================
  // WHEN READY - Final distribution (shown after 50%+ of first_things_first done)
  // ============================================================================
  {
    title: "Prepare the final accounting",
    description:
      "Create a detailed accounting of all estate assets, income, expenses, and proposed distributions for court and beneficiary review. This formal document must account for every dollar that entered and left the estate. Many states have specific formats required by the probate court.",
    category: "when_ready",
    sortOrder: 100,
  },
  {
    title: "Obtain beneficiary consent or court approval for distribution",
    description:
      "Depending on your state, you may need written consent from all beneficiaries or court approval before distributing assets. Some states allow informal closing with beneficiary consent; others require a formal court order. Make sure all debts, taxes, and claims are fully resolved before distributing. The executor can be personally liable for premature distributions.",
    category: "when_ready",
    sortOrder: 200,
  },
  {
    title: "Distribute assets to beneficiaries",
    description:
      "Transfer assets according to the will, trust, or state intestacy law. Obtain signed receipts and releases from each beneficiary acknowledging what they received. For real property, file new deeds. For financial accounts, follow each institution's transfer process. Keep copies of all distribution documents for your records.",
    category: "when_ready",
    sortOrder: 300,
  },
  {
    title: "File final tax returns and obtain tax clearance",
    description:
      "Make sure all income tax returns (personal and estate) and any estate tax returns are filed and taxes paid. Some states require a tax clearance letter or closing letter before the estate can be formally closed. Request IRS Form 5495 (Discharge of Property from Federal Tax Lien) if applicable. Don't distribute all assets until tax clearance is obtained.",
    category: "when_ready",
    sortOrder: 400,
  },
  {
    title: "Close the estate with the probate court",
    description:
      "File the final accounting and a petition to close the estate with the probate court. Once the court approves, your duties and legal liability as executor are formally complete. Retain estate records for at least 3-7 years after closing (check your state's requirements) in case of future tax audits or beneficiary questions.",
    category: "when_ready",
    sortOrder: 500,
  },
];
