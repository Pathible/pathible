/**
 * Estate Checklist Templates
 *
 * Default checklist items seeded when estate mode is activated.
 * Categories follow a progressive disclosure pattern:
 * - "first_things_first" items appear immediately
 * - "when_ready" items hidden until 50%+ of first_things_first are complete
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
  // FIRST THINGS FIRST - Immediate priorities (days 1-7)
  // ============================================================================
  {
    title: "Obtain certified copies of the death certificate",
    description:
      "Request at least 10-12 certified copies from the funeral home or vital records office. You will need these for banks, insurance, government agencies, and more.",
    category: "first_things_first",
    sortOrder: 100,
  },
  {
    title: "Locate the original will and/or trust documents",
    description:
      "Check the deceased's files, safe deposit box, or attorney's office for the original will and any trust documents.",
    category: "first_things_first",
    sortOrder: 200,
  },
  {
    title: "Contact the estate attorney",
    description:
      "Reach out to the deceased's attorney or find one who specializes in probate and estate administration in your state.",
    category: "first_things_first",
    sortOrder: 300,
  },
  {
    title: "Secure the deceased's property",
    description:
      "Ensure homes, vehicles, and valuables are locked and secured. Change locks if necessary and check that insurance coverage is active.",
    category: "first_things_first",
    sortOrder: 400,
  },
  {
    title: "Notify the employer and check for benefits",
    description:
      "Contact the deceased's employer about final paycheck, life insurance, retirement accounts, and any other death benefits.",
    category: "first_things_first",
    sortOrder: 500,
  },
  {
    title: "File the will with the probate court",
    description:
      "Most states require the will to be filed with the local probate court, even if full probate isn't needed.",
    category: "first_things_first",
    sortOrder: 600,
  },
  {
    title: "Apply for Letters Testamentary or Letters of Administration",
    description:
      "This court-issued document gives you legal authority to act on behalf of the estate. Required for accessing accounts and managing assets.",
    category: "first_things_first",
    sortOrder: 700,
  },

  // ============================================================================
  // LEGAL & FINANCIAL - Court and financial matters
  // ============================================================================
  {
    title: "Obtain an EIN (Employer Identification Number) for the estate",
    description:
      "Apply for an EIN from the IRS (free, online at irs.gov). This is needed to open an estate bank account and file estate taxes.",
    category: "legal_and_financial",
    sortOrder: 100,
  },
  {
    title: "Open an estate bank account",
    description:
      "Open a checking account in the name of the estate. All estate income and expenses should flow through this account.",
    category: "legal_and_financial",
    sortOrder: 200,
  },
  {
    title: "Notify banks and financial institutions",
    description:
      "Contact all banks, brokerages, and financial institutions where the deceased held accounts. Provide a death certificate and Letters Testamentary.",
    category: "legal_and_financial",
    sortOrder: 300,
  },
  {
    title: "Contact life insurance companies",
    description:
      "File claims with all life insurance carriers. Gather policy numbers and beneficiary information.",
    category: "legal_and_financial",
    sortOrder: 400,
  },
  {
    title: "Review and manage retirement accounts",
    description:
      "Contact 401(k), IRA, and pension administrators. Beneficiary designations may allow these to pass outside of probate.",
    category: "legal_and_financial",
    sortOrder: 500,
  },
  {
    title: "File the final personal income tax return",
    description:
      "File a federal (and state, if applicable) income tax return for the deceased for the year of death. Due April 15 of the following year.",
    category: "legal_and_financial",
    sortOrder: 600,
  },
  {
    title: "File estate income tax returns if needed",
    description:
      "If the estate earns income (interest, rent, etc.), file Form 1041. Consult a tax professional for guidance.",
    category: "legal_and_financial",
    sortOrder: 700,
  },
  {
    title: "Determine if a federal estate tax return is required",
    description:
      "For 2024, estates exceeding $13.61 million must file Form 706. Some states have lower thresholds. Consult a tax professional.",
    category: "legal_and_financial",
    sortOrder: 800,
  },
  {
    title: "Pay outstanding debts and final expenses",
    description:
      "Identify and pay legitimate debts from estate funds, including medical bills, credit cards, and funeral costs. Follow your state's priority rules.",
    category: "legal_and_financial",
    sortOrder: 900,
  },

  // ============================================================================
  // PROPERTY & ASSETS - Physical and digital assets
  // ============================================================================
  {
    title: "Create a complete inventory of assets",
    description:
      "List all assets including real estate, vehicles, bank accounts, investments, personal property, and digital assets with their estimated values.",
    category: "property_and_assets",
    sortOrder: 100,
  },
  {
    title: "Arrange for property appraisals",
    description:
      "Get professional appraisals for real estate, valuable personal property, and business interests for tax and distribution purposes.",
    category: "property_and_assets",
    sortOrder: 200,
  },
  {
    title: "Transfer vehicle titles",
    description:
      "Contact your state's DMV to transfer vehicle titles. You'll need the death certificate, Letters Testamentary, and title documents.",
    category: "property_and_assets",
    sortOrder: 300,
  },
  {
    title: "Manage real estate",
    description:
      "Maintain insurance, pay property taxes and mortgage, and arrange for upkeep. Determine whether to sell, transfer, or distribute the property.",
    category: "property_and_assets",
    sortOrder: 400,
  },
  {
    title: "Secure digital assets and online accounts",
    description:
      "Identify email, social media, cloud storage, and subscription accounts. Follow each platform's process for deceased user accounts.",
    category: "property_and_assets",
    sortOrder: 500,
  },
  {
    title: "Handle business interests",
    description:
      "If the deceased owned a business, review partnership agreements, operating agreements, or shareholder documents for succession provisions.",
    category: "property_and_assets",
    sortOrder: 600,
  },

  // ============================================================================
  // NOTIFICATIONS - Government and institutional notifications
  // ============================================================================
  {
    title: "Notify Social Security Administration",
    description:
      "Report the death to SSA (1-800-772-1213). The funeral home may do this, but verify. Surviving spouses may be eligible for benefits.",
    category: "notifications",
    sortOrder: 100,
  },
  {
    title: "Cancel or transfer health insurance",
    description:
      "Notify health insurance providers. Dependents may be eligible for COBRA continuation or need to find new coverage.",
    category: "notifications",
    sortOrder: 200,
  },
  {
    title: "Notify the post office",
    description:
      "Forward mail to the executor's address to ensure important correspondence is not missed.",
    category: "notifications",
    sortOrder: 300,
  },
  {
    title: "Cancel or transfer utilities and subscriptions",
    description:
      "Review and cancel or transfer utility accounts, streaming services, memberships, and recurring subscriptions.",
    category: "notifications",
    sortOrder: 400,
  },
  {
    title: "Notify credit reporting agencies",
    description:
      "Report the death to Equifax, Experian, and TransUnion to prevent identity theft. Request a deceased alert on the credit file.",
    category: "notifications",
    sortOrder: 500,
  },
  {
    title: "Contact the Department of Veterans Affairs if applicable",
    description:
      "If the deceased was a veteran, contact the VA (1-800-827-1000) about burial benefits, survivor benefits, and a memorial marker.",
    category: "notifications",
    sortOrder: 600,
  },

  // ============================================================================
  // ONGOING - Recurring responsibilities during administration
  // ============================================================================
  {
    title: "Keep detailed records of all estate transactions",
    description:
      "Document every payment, receipt, and decision. You may need to provide a formal accounting to the court and beneficiaries.",
    category: "ongoing",
    sortOrder: 100,
  },
  {
    title: "Communicate regularly with beneficiaries",
    description:
      "Keep beneficiaries informed of progress. Transparency reduces disputes and builds trust during the administration process.",
    category: "ongoing",
    sortOrder: 200,
  },
  {
    title: "Maintain insurance coverage on estate property",
    description:
      "Keep homeowner's, auto, and other insurance policies active until assets are distributed or sold.",
    category: "ongoing",
    sortOrder: 300,
  },
  {
    title: "Monitor estate bank account and cash flow",
    description:
      "Ensure there are sufficient funds to pay estate expenses. Track all income and disbursements carefully.",
    category: "ongoing",
    sortOrder: 400,
  },

  // ============================================================================
  // WHEN READY - Final distribution (shown after 50%+ of first_things_first done)
  // ============================================================================
  {
    title: "Prepare the final accounting",
    description:
      "Create a detailed accounting of all estate assets, income, expenses, and proposed distributions for court and beneficiary review.",
    category: "when_ready",
    sortOrder: 100,
  },
  {
    title: "Obtain beneficiary consent or court approval for distribution",
    description:
      "Depending on your state, you may need written consent from all beneficiaries or court approval before distributing assets.",
    category: "when_ready",
    sortOrder: 200,
  },
  {
    title: "Distribute assets to beneficiaries",
    description:
      "Transfer assets according to the will or state law. Obtain signed receipts from each beneficiary for your records.",
    category: "when_ready",
    sortOrder: 300,
  },
  {
    title: "File final tax returns and obtain tax clearance",
    description:
      "Ensure all tax returns are filed and any taxes owed are paid. Some states require a tax clearance letter before closing.",
    category: "when_ready",
    sortOrder: 400,
  },
  {
    title: "Close the estate with the probate court",
    description:
      "File the final accounting and petition to close the estate. Once approved, your duties as executor are formally complete.",
    category: "when_ready",
    sortOrder: 500,
  },
];
