import { AlertTriangle, Mail, Phone, Shield } from "lucide-react";

// Styled section components for consistent formatting
function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-crimson text-2xl sm:text-3xl leading-snug text-foreground mb-6 mt-14 pb-3 border-b border-pathible-sage/20">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SubSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-24 mt-8">
      <h3 className="font-crimson text-xl sm:text-2xl leading-snug text-foreground mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground leading-relaxed mb-5 text-base sm:text-lg">{children}</p>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-foreground">{children}</strong>;
}

function BulletList({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ul className="list-none space-y-3 mb-6 pl-0">
      {items.map((item, index) => (
        <li
          key={index}
          className="text-muted-foreground leading-relaxed text-base sm:text-lg pl-6 relative before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-2 before:h-2 before:bg-pathible-sage/40 before:rounded-full"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function ImportantNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
      <div className="flex gap-4">
        <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-amber-900 font-medium">{children}</div>
      </div>
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="my-8 overflow-x-auto rounded-xl border border-pathible-sage/20 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-pathible-sand/60 border-b border-pathible-sage/20">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 font-crimson font-semibold text-foreground text-sm sm:text-base whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-pathible-sage/10">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-pathible-sand/30 transition-colors">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-3 text-muted-foreground text-sm sm:text-base"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Divider() {
  return <hr className="my-12 border-t-2 border-pathible-sage/20" />;
}

function ContactCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 bg-pathible-sand/50 rounded-xl border border-pathible-sage/20">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-pathible-forest/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-pathible-forest" />
        </div>
        <h4 className="font-crimson text-lg font-semibold text-foreground">{title}</h4>
      </div>
      <div className="text-muted-foreground text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function PrivacyPolicyContent() {
  return (
    <div className="legal-content">
      {/* Important Legal Disclaimer */}
      <ImportantNotice>
        <p className="mb-4">
          THIS PRIVACY POLICY DESCRIBES HOW PATHIBLE (&ldquo;WE,&rdquo; &ldquo;US,&rdquo; OR
          &ldquo;OUR&rdquo;) COLLECTS, USES, AND PROTECTS YOUR PERSONAL INFORMATION. PLEASE READ
          THIS POLICY CAREFULLY.
        </p>
        <p className="mb-4">
          PATHIBLE IS AN INFORMATIONAL AND EDUCATIONAL TOOL ONLY. WE ARE NOT A FINANCIAL
          INSTITUTION, FINANCIAL ADVISOR, FINANCIAL PLANNER, LEGAL SERVICE PROVIDER, OR ATTORNEY.
          THE INSIGHTS, ANALYSIS, AND INFORMATION PROVIDED THROUGH OUR PLATFORM ARE FOR
          INFORMATIONAL PURPOSES ONLY AND DO NOT CONSTITUTE FINANCIAL ADVICE, LEGAL ADVICE, OR
          PROFESSIONAL SERVICES OF ANY KIND.
        </p>
        <p>
          YOU ARE SOLELY RESPONSIBLE FOR VERIFYING ANY INFORMATION PROVIDED BY OUR PLATFORM AND FOR
          MAKING YOUR OWN INDEPENDENT DECISIONS REGARDING YOUR FINANCIAL AND LEGAL MATTERS. WE
          STRONGLY RECOMMEND CONSULTING WITH QUALIFIED FINANCIAL ADVISORS, ATTORNEYS, AND OTHER
          PROFESSIONALS BEFORE MAKING ANY FINANCIAL OR LEGAL DECISIONS.
        </p>
      </ImportantNotice>

      <Divider />

      {/* Table of Contents */}
      <nav className="my-8 p-6 bg-pathible-sand/30 rounded-2xl border border-pathible-sage/10">
        <h2 className="font-crimson text-xl font-semibold text-foreground mb-4">
          Table of Contents
        </h2>
        <ol className="grid sm:grid-cols-2 gap-2 text-sm">
          {[
            "Introduction",
            "Information We Collect",
            "How We Use Your Information",
            "Legal Basis for Processing (GDPR)",
            "Data Storage and Security",
            "Artificial Intelligence and Automated Processing",
            "Data Sharing and Third-Party Services",
            "Your Privacy Rights",
            "Cookies and Tracking Technologies",
            "Children's Privacy",
            "International Data Transfers",
            "Data Retention",
            "Security Breach Notification",
            "California Privacy Rights (CCPA/CPRA)",
            "European Union Privacy Rights (GDPR)",
            "Other Jurisdictions",
            "Changes to This Privacy Policy",
            "Contact Information",
            "Dispute Resolution",
          ].map((item, index) => (
            <li key={index}>
              <a
                href={`#${item.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="text-pathible-forest hover:text-pathible-green-hover transition-colors"
              >
                {index + 1}. {item}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <Divider />

      {/* Section 1: Introduction */}
      <Section id="introduction" title="1. Introduction">
        <Paragraph>
          Welcome to Pathible. This Privacy Policy explains how we collect, use, disclose, and
          safeguard your personal information when you use our web and mobile application
          (collectively, the &ldquo;Service&rdquo; or &ldquo;Platform&rdquo;).
        </Paragraph>
        <Paragraph>
          By accessing or using our Service, you acknowledge that you have read, understood, and
          agree to be bound by this Privacy Policy. If you do not agree with the terms of this
          Privacy Policy, please do not access or use the Service.
        </Paragraph>

        <SubSection title="1.1 Nature of Our Service">
          <Paragraph>
            Pathible is a document analysis and information organization tool designed to help
            families understand their financial and legal situations by:
          </Paragraph>
          <BulletList
            items={[
              "Analyzing documents you upload (financial statements, legal documents, etc.)",
              "Organizing information about your circumstances",
              "Providing visual representations and summaries of your data",
              "Offering educational insights about financial and legal concepts",
            ]}
          />
          <Paragraph>
            <Strong>IMPORTANT:</Strong> Pathible does NOT:
          </Paragraph>
          <BulletList
            items={[
              "Provide financial advice, financial planning services, or investment recommendations",
              "Offer legal advice or legal services",
              "Act as a fiduciary, financial advisor, attorney, or licensed professional",
              "Make decisions on your behalf or recommend specific actions",
              "Guarantee the accuracy, completeness, or reliability of any analysis or information",
            ]}
          />
        </SubSection>

        <SubSection title="1.2 Your Responsibility">
          <Paragraph>You are solely responsible for:</Paragraph>
          <BulletList
            items={[
              "The accuracy of information and documents you provide",
              "Verifying any insights, analysis, or information generated by our Platform",
              "Consulting with qualified professionals (financial advisors, attorneys, accountants, etc.) before making any decisions",
              "Maintaining the confidentiality of your account credentials",
              "Complying with all applicable laws in your jurisdiction",
            ]}
          />
        </SubSection>
      </Section>

      {/* Section 2: Information We Collect */}
      <Section id="information-we-collect" title="2. Information We Collect">
        <Paragraph>
          We collect various types of information to provide and improve our Service:
        </Paragraph>

        <SubSection title="2.1 Information You Provide Directly">
          <h4 className="font-crimson text-lg font-medium text-foreground mb-3 mt-6">
            Account Information
          </h4>
          <BulletList
            items={[
              "Full name",
              "Email address",
              "Password (encrypted and hashed)",
              "Profile information (optional: phone number, address, date of birth)",
              "Account preferences and settings",
            ]}
          />

          <h4 className="font-crimson text-lg font-medium text-foreground mb-3 mt-6">
            Financial and Document Information
          </h4>
          <BulletList
            items={[
              "Financial documents (bank statements, investment accounts, tax returns, pay stubs, etc.)",
              "Legal documents (wills, trusts, powers of attorney, court documents, contracts, etc.)",
              "Property records and ownership documents",
              "Insurance policies and benefits information",
              "Debt and loan documentation",
              "Income and expense information",
              "Asset and liability details",
              "Family structure information (relationships, dependents, beneficiaries)",
            ]}
          />

          <h4 className="font-crimson text-lg font-medium text-foreground mb-3 mt-6">
            User-Generated Content
          </h4>
          <BulletList
            items={[
              "Notes, comments, and annotations you create",
              "Questions you ask our AI analysis tools",
              "Custom categories and tags you create",
              "Feedback and communications with our support team",
            ]}
          />
        </SubSection>

        <SubSection title="2.2 Information Collected Automatically">
          <h4 className="font-crimson text-lg font-medium text-foreground mb-3 mt-6">Usage Data</h4>
          <BulletList
            items={[
              "Device information (device type, operating system, browser type)",
              "IP address and general location information (city/country level)",
              "Log data (access times, pages viewed, actions taken)",
              "Application interaction data (features used, buttons clicked)",
              "Session duration and frequency of use",
              "Error reports and crash data",
            ]}
          />

          <h4 className="font-crimson text-lg font-medium text-foreground mb-3 mt-6">
            Cookies and Similar Technologies
          </h4>
          <BulletList
            items={[
              "Session cookies for authentication",
              "Persistent cookies for preferences",
              "Analytics cookies for usage statistics",
              "Performance cookies for optimization",
              "Security cookies for fraud prevention",
            ]}
          />
          <Paragraph>See Section 9 for detailed cookie information.</Paragraph>
        </SubSection>

        <SubSection title="2.3 Information from Third-Party Sources">
          <Paragraph>We may receive information from:</Paragraph>
          <BulletList
            items={[
              "Authentication providers (if you use social login features)",
              "Payment processors (transaction data, billing information)",
              "Analytics providers (aggregated usage statistics)",
              "Public records (to verify information you provide, if applicable)",
              "Data enrichment services (to improve our analysis capabilities)",
            ]}
          />
        </SubSection>

        <SubSection title="2.4 Sensitive Personal Information">
          <Paragraph>
            Due to the nature of our Service, you may upload documents containing sensitive personal
            information including:
          </Paragraph>
          <BulletList
            items={[
              "Financial account numbers and balances",
              "Social Security numbers or tax identification numbers",
              "Government-issued identification numbers",
              "Health information or insurance details",
              "Biometric data (if present in uploaded documents)",
              "Genetic information (if present in uploaded documents)",
              "Precise geolocation data",
              "Personal information about minors",
            ]}
          />
          <ImportantNotice>
            We do not require you to provide sensitive personal information. You should only upload
            information necessary for the analysis you seek. You may redact sensitive details
            (account numbers, SSNs, etc.) before uploading documents.
          </ImportantNotice>
        </SubSection>
      </Section>

      {/* Section 3: How We Use Your Information */}
      <Section id="how-we-use-your-information" title="3. How We Use Your Information">
        <Paragraph>We use your information for the following purposes:</Paragraph>

        <SubSection title="3.1 Providing and Improving Our Service">
          <BulletList
            items={[
              <>
                <Strong>Account Management:</Strong> Creating and maintaining your account,
                authenticating your identity, and managing your subscription
              </>,
              <>
                <Strong>Document Analysis:</Strong> Processing and analyzing documents you upload
                using AI and machine learning technologies
              </>,
              <>
                <Strong>Insight Generation:</Strong> Creating summaries, visualizations, and
                educational insights about your financial and legal situation
              </>,
              <>
                <Strong>Personalization:</Strong> Customizing the Service based on your preferences
                and usage patterns
              </>,
              <>
                <Strong>Customer Support:</Strong> Responding to your questions, providing technical
                assistance, and resolving issues
              </>,
              <>
                <Strong>Service Improvement:</Strong> Analyzing usage patterns to improve features,
                fix bugs, and enhance user experience
              </>,
            ]}
          />
        </SubSection>

        <SubSection title="3.2 Communication">
          <BulletList
            items={[
              "Sending transactional emails (account verification, password resets, subscription confirmations)",
              "Providing service updates and important notices",
              "Responding to your inquiries and requests",
              "Sending optional marketing communications (with your consent)",
              "Conducting surveys and research (with your consent)",
            ]}
          />
        </SubSection>

        <SubSection title="3.3 Security and Fraud Prevention">
          <BulletList
            items={[
              "Detecting and preventing fraudulent activity, unauthorized access, and security threats",
              "Monitoring for violations of our Terms of Service",
              "Protecting the rights, property, and safety of Pathible, our users, and the public",
              "Enforcing our legal rights and complying with legal obligations",
            ]}
          />
        </SubSection>

        <SubSection title="3.4 Legal Compliance and Protection">
          <BulletList
            items={[
              "Complying with applicable laws, regulations, and legal processes",
              "Responding to lawful requests from government authorities",
              "Establishing, exercising, or defending legal claims",
              "Protecting against legal liability",
            ]}
          />
        </SubSection>

        <SubSection title="3.5 Research and Development">
          <BulletList
            items={[
              "Developing new features and services",
              "Training and improving our AI and machine learning models (using aggregated, de-identified data only)",
              "Conducting internal research and analytics",
              "Testing new technologies and methodologies",
            ]}
          />
        </SubSection>

        <Paragraph>
          <Strong>IMPORTANT LIMITATIONS:</Strong>
        </Paragraph>
        <BulletList
          items={[
            "We do NOT sell your personal information to third parties",
            "We do NOT use your information to provide financial or legal advice",
            "We do NOT share your documents or sensitive information with third parties except as explicitly described in Section 7",
            "We do NOT use your information for automated decision-making that has legal or similarly significant effects on you (except with your explicit consent or as required by law)",
          ]}
        />
      </Section>

      {/* Section 4: Legal Basis for Processing */}
      <Section id="legal-basis-for-processing-gdpr" title="4. Legal Basis for Processing (GDPR)">
        <Paragraph>
          If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, we
          process your personal data based on the following legal grounds:
        </Paragraph>

        <SubSection title="4.1 Contractual Necessity">
          <Paragraph>
            Processing necessary to perform our contract with you (Terms of Service), including:
          </Paragraph>
          <BulletList
            items={[
              "Providing access to the Service",
              "Processing your documents and generating insights",
              "Managing your account and subscription",
              "Providing customer support",
            ]}
          />
        </SubSection>

        <SubSection title="4.2 Legitimate Interests">
          <Paragraph>
            Processing necessary for our legitimate business interests, including:
          </Paragraph>
          <BulletList
            items={[
              "Improving and developing our Service",
              "Marketing and promoting our Service (where permitted)",
              "Detecting and preventing fraud and security threats",
              "Conducting research and analytics",
              "Managing business operations",
            ]}
          />
          <Paragraph>
            We balance these interests against your rights and only process data where our interests
            are not overridden by your data protection rights.
          </Paragraph>
        </SubSection>

        <SubSection title="4.3 Legal Obligation">
          <Paragraph>Processing required to comply with legal obligations, including:</Paragraph>
          <BulletList
            items={[
              "Responding to lawful requests from authorities",
              "Complying with tax and accounting requirements",
              "Maintaining records as required by law",
              "Enforcing legal rights",
            ]}
          />
        </SubSection>

        <SubSection title="4.4 Consent">
          <Paragraph>Processing based on your explicit consent, including:</Paragraph>
          <BulletList
            items={[
              "Marketing communications (where consent is required)",
              "Optional features requiring sensitive data processing",
              "Cookies and tracking technologies (where required)",
              "Processing of special categories of personal data",
            ]}
          />
          <Paragraph>
            You may withdraw your consent at any time, but this will not affect the lawfulness of
            processing based on consent before withdrawal.
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 5: Data Storage and Security */}
      <Section id="data-storage-and-security" title="5. Data Storage and Security">
        <SubSection title="5.1 Data Storage Infrastructure">
          <Paragraph>
            We use industry-standard cloud infrastructure providers to store your data, including:
          </Paragraph>
          <BulletList
            items={[
              <>
                <Strong>Convex:</Strong> Backend database and real-time data synchronization
              </>,
              <>
                <Strong>Cloud Storage Providers:</Strong> Secure encrypted storage for uploaded
                documents
              </>,
              <>
                <Strong>Content Delivery Networks (CDNs):</Strong> For fast, secure content delivery
              </>,
            ]}
          />
          <Paragraph>All data is stored in secure data centers with:</Paragraph>
          <BulletList
            items={[
              "24/7 physical security monitoring",
              "Redundant power and network systems",
              "Regular security audits and compliance certifications",
              "Geographic redundancy for disaster recovery",
            ]}
          />
        </SubSection>

        <SubSection title="5.2 Security Measures">
          <Paragraph>We implement comprehensive security measures to protect your data:</Paragraph>

          <h4 className="font-crimson text-lg font-medium text-foreground mb-3 mt-6">
            Technical Security
          </h4>
          <BulletList
            items={[
              <>
                <Strong>Encryption in Transit:</Strong> All data transmitted to and from our servers
                uses TLS 1.3 or higher encryption
              </>,
              <>
                <Strong>Encryption at Rest:</Strong> All stored data, including documents and
                database records, is encrypted using AES-256 or equivalent encryption
              </>,
              <>
                <Strong>Secure Authentication:</Strong> Passwords are hashed using industry-standard
                algorithms (bcrypt with salt)
              </>,
              <>
                <Strong>Multi-Factor Authentication:</Strong> Available for additional account
                security
              </>,
              <>
                <Strong>API Security:</Strong> All API endpoints are authenticated and rate-limited
              </>,
              <>
                <Strong>Secure File Upload:</Strong> Document uploads are scanned for malware and
                viruses
              </>,
            ]}
          />

          <h4 className="font-crimson text-lg font-medium text-foreground mb-3 mt-6">
            Organizational Security
          </h4>
          <BulletList
            items={[
              <>
                <Strong>Access Controls:</Strong> Strict role-based access controls limit employee
                access to personal data
              </>,
              <>
                <Strong>Background Checks:</Strong> All employees with access to personal data
                undergo background checks
              </>,
              <>
                <Strong>Security Training:</Strong> Regular security awareness training for all
                employees
              </>,
              <>
                <Strong>Confidentiality Agreements:</Strong> All employees and contractors sign
                confidentiality agreements
              </>,
              <>
                <Strong>Incident Response Plan:</Strong> Documented procedures for responding to
                security incidents
              </>,
              <>
                <Strong>Regular Audits:</Strong> Periodic security audits and penetration testing
              </>,
            ]}
          />
        </SubSection>

        <SubSection title="5.3 Security Limitations">
          <ImportantNotice>
            <Strong>NO SYSTEM IS COMPLETELY SECURE.</Strong> While we implement strong security
            measures:
            <ul className="mt-3 space-y-1 list-disc list-inside">
              <li>We cannot guarantee absolute security of your data</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You should not share your password or account access with others</li>
              <li>You should enable multi-factor authentication for additional security</li>
              <li>You are responsible for securing your own devices and internet connection</li>
            </ul>
          </ImportantNotice>
          <Paragraph>
            If you believe your account has been compromised, contact us immediately at{" "}
            <a
              href="mailto:security@pathible.com"
              className="text-pathible-forest hover:text-pathible-green-hover underline"
            >
              security@pathible.com
            </a>
            .
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 6: AI and Automated Processing */}
      <Section
        id="artificial-intelligence-and-automated-processing"
        title="6. Artificial Intelligence and Automated Processing"
      >
        <SubSection title="6.1 AI-Powered Features">
          <Paragraph>
            Our Service uses artificial intelligence (AI) and machine learning (ML) technologies to
            analyze your documents and data, including:
          </Paragraph>
          <BulletList
            items={[
              <>
                <Strong>Document Processing:</Strong> Optical Character Recognition (OCR) to extract
                text from uploaded documents
              </>,
              <>
                <Strong>Natural Language Processing (NLP):</Strong> Understanding document content,
                structure, and meaning
              </>,
              <>
                <Strong>Data Extraction:</Strong> Identifying and extracting financial figures,
                dates, names, and other relevant information
              </>,
              <>
                <Strong>Classification:</Strong> Categorizing documents and information types
              </>,
              <>
                <Strong>Insight Generation:</Strong> Creating summaries, identifying patterns, and
                generating educational explanations
              </>,
              <>
                <Strong>Question Answering:</Strong> Responding to your questions about your
                documents and data
              </>,
            ]}
          />
        </SubSection>

        <SubSection title="6.2 Accuracy and Limitations">
          <ImportantNotice>
            <Strong>IMPORTANT AI LIMITATIONS:</Strong>
            <p className="mt-3">
              AI analysis is not perfect and may contain errors, inaccuracies, or omissions:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>
                <Strong>Document Processing Errors:</Strong> OCR may misread text, especially with
                poor quality scans or handwriting
              </li>
              <li>
                <Strong>Extraction Errors:</Strong> AI may incorrectly identify or extract
                information from documents
              </li>
              <li>
                <Strong>Interpretation Errors:</Strong> AI may misunderstand context, meaning, or
                relationships in data
              </li>
              <li>
                <Strong>Hallucinations:</Strong> AI may generate plausible-sounding but incorrect
                information
              </li>
              <li>
                <Strong>Bias:</Strong> AI models may reflect biases present in their training data
              </li>
              <li>
                <Strong>Incomplete Analysis:</Strong> AI may miss important information or nuances
              </li>
            </ul>
          </ImportantNotice>

          <Paragraph>
            <Strong>YOU ARE SOLELY RESPONSIBLE FOR:</Strong>
          </Paragraph>
          <BulletList
            items={[
              "Verifying the accuracy of all AI-generated insights and analysis",
              "Reviewing original documents to confirm extracted information",
              "Consulting with qualified professionals before making decisions based on our analysis",
              "Understanding that AI insights are educational tools only, not professional advice",
            ]}
          />
        </SubSection>

        <SubSection title="6.3 Your Rights Regarding AI Processing">
          <Paragraph>You have the right to:</Paragraph>
          <BulletList
            items={[
              "Opt out of AI processing (though this may limit Service functionality)",
              "Request human review of AI-generated insights",
              "Receive explanations of how AI processes your data",
              "Challenge AI-generated results you believe are inaccurate",
            ]}
          />
          <Paragraph>
            Contact us at{" "}
            <a
              href="mailto:support@pathible.com"
              className="text-pathible-forest hover:text-pathible-green-hover underline"
            >
              support@pathible.com
            </a>{" "}
            to exercise these rights.
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 7: Data Sharing */}
      <Section
        id="data-sharing-and-third-party-services"
        title="7. Data Sharing and Third-Party Services"
      >
        <SubSection title="7.1 When We Share Your Information">
          <Paragraph>
            We share your information only in the following limited circumstances:
          </Paragraph>

          <h4 className="font-crimson text-lg font-medium text-foreground mb-3 mt-6">
            With Your Consent
          </h4>
          <BulletList
            items={[
              "When you explicitly authorize us to share your information",
              "When you use features that inherently involve sharing (e.g., sharing insights with family members)",
            ]}
          />

          <h4 className="font-crimson text-lg font-medium text-foreground mb-3 mt-6">
            Service Providers
          </h4>
          <Paragraph>
            We share information with trusted third-party service providers who perform services on
            our behalf:
          </Paragraph>
          <BulletList
            items={[
              "Cloud hosting providers (servers, databases, file storage)",
              "AI and machine learning service providers",
              "Payment processors and billing systems",
              "Customer support and helpdesk platforms",
              "Email delivery services",
              "Security and fraud prevention services",
            ]}
          />

          <h4 className="font-crimson text-lg font-medium text-foreground mb-3 mt-6">
            Legal Requirements
          </h4>
          <Paragraph>We may disclose your information when required by law:</Paragraph>
          <BulletList
            items={[
              "In response to valid subpoenas, court orders, or legal processes",
              "To comply with regulatory requirements or government requests",
              "To protect against legal liability or defend legal claims",
              "When necessary to protect the rights, property, or safety of Pathible, our users, or the public",
            ]}
          />
        </SubSection>

        <SubSection title="7.2 Third-Party Services We Use">
          <Paragraph>
            Below is a list of key third-party services that may process your data:
          </Paragraph>
          <DataTable
            headers={["Service Type", "Provider", "Purpose", "Data Shared"]}
            rows={[
              [
                "Backend Database",
                "Convex",
                "Data storage and sync",
                "Account info, documents, user data",
              ],
              ["Authentication", "Clerk", "User authentication", "Email, profile info"],
              ["Email Delivery", "Resend", "Transactional emails", "Email address, name"],
              ["Payment Processing", "Stripe", "Subscription billing", "Name, email, payment info"],
              ["AI Processing", "Various", "Document analysis", "Document content, queries"],
            ]}
          />
        </SubSection>

        <SubSection title="7.3 Data Sharing Limitations">
          <Paragraph>
            <Strong>WE DO NOT:</Strong>
          </Paragraph>
          <BulletList
            items={[
              "Sell your personal information to third parties for monetary consideration",
              "Share your documents or sensitive financial/legal information except as described above",
              "Use your information for purposes incompatible with this Privacy Policy",
              "Share your data with advertisers or marketing companies (except aggregated, de-identified data)",
            ]}
          />
        </SubSection>
      </Section>

      {/* Section 8: Your Privacy Rights */}
      <Section id="your-privacy-rights" title="8. Your Privacy Rights">
        <Paragraph>
          You have important rights regarding your personal information. The specific rights
          available to you depend on your location and applicable privacy laws.
        </Paragraph>

        <SubSection title="8.1 Rights Available to All Users">
          <Paragraph>Regardless of your location, you have the following rights:</Paragraph>

          <h4 className="font-crimson text-lg font-medium text-foreground mb-3 mt-6">
            Access Your Information
          </h4>
          <BulletList
            items={[
              "Request a copy of the personal information we hold about you",
              "Receive information about how we process your data",
            ]}
          />

          <h4 className="font-crimson text-lg font-medium text-foreground mb-3 mt-6">
            Update Your Information
          </h4>
          <BulletList
            items={[
              "Correct inaccurate or incomplete personal information",
              "Update your account details and preferences",
            ]}
          />

          <h4 className="font-crimson text-lg font-medium text-foreground mb-3 mt-6">
            Delete Your Information
          </h4>
          <BulletList
            items={[
              "Request deletion of your personal information (subject to legal exceptions)",
              "Close your account and remove your data from our systems",
            ]}
          />

          <h4 className="font-crimson text-lg font-medium text-foreground mb-3 mt-6">
            Export Your Data
          </h4>
          <BulletList
            items={[
              "Download your information in a portable format",
              "Transfer your data to another service",
            ]}
          />
        </SubSection>

        <SubSection title="8.2 How to Exercise Your Rights">
          <Paragraph>To exercise any of these rights, you may:</Paragraph>
          <div className="grid sm:grid-cols-2 gap-4 my-6">
            <ContactCard icon={Mail} title="Email Us">
              Send a request to:{" "}
              <a
                href="mailto:privacy@pathible.com"
                className="text-pathible-forest hover:underline"
              >
                privacy@pathible.com
              </a>
            </ContactCard>
            <ContactCard icon={Shield} title="Account Settings">
              Access your account settings and privacy dashboard within the app
            </ContactCard>
          </div>
          <Paragraph>
            <Strong>Response Timeline:</Strong> We will acknowledge your request within 5-10
            business days and respond substantively within 30-45 days, depending on applicable law.
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 9: Cookies */}
      <Section id="cookies-and-tracking-technologies" title="9. Cookies and Tracking Technologies">
        <SubSection title="9.1 What Are Cookies">
          <Paragraph>
            Cookies are small text files stored on your device when you visit our Service. We use
            cookies and similar tracking technologies to provide functionality, analyze usage, and
            improve your experience.
          </Paragraph>
        </SubSection>

        <SubSection title="9.2 Types of Cookies We Use">
          <h4 className="font-crimson text-lg font-medium text-foreground mb-3 mt-6">
            Essential Cookies (Required)
          </h4>
          <Paragraph>
            These cookies are necessary for the Service to function and cannot be disabled:
          </Paragraph>
          <BulletList
            items={[
              "Authentication: Keeping you logged in to your account",
              "Security: Protecting against fraud and unauthorized access",
              "Session Management: Maintaining your session as you navigate the Service",
            ]}
          />

          <h4 className="font-crimson text-lg font-medium text-foreground mb-3 mt-6">
            Functional Cookies (Optional)
          </h4>
          <Paragraph>These cookies enhance functionality and personalization:</Paragraph>
          <BulletList
            items={[
              "Preferences: Remembering your settings and preferences",
              "UI State: Saving your interface customizations",
              "Language: Remembering your language selection",
            ]}
          />

          <h4 className="font-crimson text-lg font-medium text-foreground mb-3 mt-6">
            Analytics Cookies (Optional)
          </h4>
          <Paragraph>These cookies help us understand how you use the Service:</Paragraph>
          <BulletList
            items={[
              "Usage Statistics: Pages visited, features used, time spent",
              "Performance Metrics: Load times, errors, response times",
              "User Flow: Navigation patterns and user journeys",
            ]}
          />
        </SubSection>

        <SubSection title="9.3 Managing Cookies">
          <Paragraph>
            <Strong>Browser Settings:</Strong> Most browsers allow you to block or delete cookies.
            Access your browser&apos;s privacy settings to manage cookies.
          </Paragraph>
          <Paragraph>
            <Strong>Do Not Track (DNT):</Strong> We currently do not respond to DNT browser signals
            as there is no industry standard for DNT interpretation.
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 10: Children's Privacy */}
      <Section id="childrens-privacy" title="10. Children's Privacy">
        <SubSection title="10.1 Age Requirements">
          <Paragraph>
            Our Service is <Strong>NOT intended for children under the age of 18</Strong>.
          </Paragraph>
          <BulletList
            items={[
              "You must be at least 18 years old to create an account",
              "Users under 18 may not use the Service, even with parental consent",
              "We do not knowingly collect information from individuals under 18",
            ]}
          />
        </SubSection>

        <SubSection title="10.2 If We Discover Underage Users">
          <Paragraph>
            If we learn that we have collected information from a child under 18:
          </Paragraph>
          <BulletList
            items={[
              "We will immediately delete the account and all associated data",
              "We will not use or disclose the information for any purpose",
              "We will not knowingly retain any information from the child",
            ]}
          />
        </SubSection>

        <SubSection title="10.3 Parental Notification">
          <Paragraph>
            If you are a parent or guardian and believe your child under 18 has created an account,
            contact us immediately at{" "}
            <a href="mailto:privacy@pathible.com" className="text-pathible-forest hover:underline">
              privacy@pathible.com
            </a>
            . We will promptly delete the account and all data.
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 11: International Data Transfers */}
      <Section id="international-data-transfers" title="11. International Data Transfers">
        <SubSection title="11.1 Data Storage Locations">
          <Paragraph>
            Your information may be stored and processed in countries other than your country of
            residence, including the United States of America.
          </Paragraph>
        </SubSection>

        <SubSection title="11.2 EEA/UK Data Transfers">
          <Paragraph>
            If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland,
            we ensure adequate protection for data transfers through:
          </Paragraph>
          <BulletList
            items={[
              <>
                <Strong>Standard Contractual Clauses (SCCs):</Strong> We use European
                Commission-approved Standard Contractual Clauses with service providers outside the
                EEA
              </>,
              <>
                <Strong>Adequacy Decisions:</Strong> We may transfer data to countries deemed
                &ldquo;adequate&rdquo; by the European Commission
              </>,
              <>
                <Strong>Additional Safeguards:</Strong> Encryption of data in transit and at rest,
                contractual obligations, and regular audits
              </>,
            ]}
          />
        </SubSection>
      </Section>

      {/* Section 12: Data Retention */}
      <Section id="data-retention" title="12. Data Retention">
        <SubSection title="12.1 Retention Principles">
          <Paragraph>
            We retain your information only as long as necessary for the purposes described in this
            Privacy Policy, unless a longer retention period is required or permitted by law.
          </Paragraph>
        </SubSection>

        <SubSection title="12.2 Retention Periods by Data Type">
          <DataTable
            headers={["Data Type", "Retention Period"]}
            rows={[
              ["Account Information", "Duration of account + 90 days after closure"],
              ["Uploaded Documents", "Until you delete them or close your account + 30 days"],
              ["AI-Generated Insights", "Until you delete them or close your account"],
              ["Usage and Analytics Data", "90 days (detailed), indefinitely (aggregated)"],
              ["Support Communications", "2 years after resolution"],
              ["Payment Information", "7 years for tax and accounting purposes"],
            ]}
          />
        </SubSection>

        <SubSection title="12.3 Account Closure and Data Deletion">
          <Paragraph>To close your account and request data deletion:</Paragraph>
          <BulletList
            items={[
              "Log into your account settings",
              'Select "Close Account" or "Delete My Data"',
              "Confirm your request via email verification",
              "Your account will be closed within 24-48 hours",
              "Data will be deleted according to schedules above",
            ]}
          />
        </SubSection>
      </Section>

      {/* Section 13: Security Breach Notification */}
      <Section id="security-breach-notification" title="13. Security Breach Notification">
        <SubSection title="13.1 Our Commitment to Security">
          <Paragraph>
            We take data security seriously and implement comprehensive measures to protect your
            information. Despite our efforts, no system is entirely secure from all threats.
          </Paragraph>
        </SubSection>

        <SubSection title="13.2 User Notification">
          <Paragraph>We will notify you if a breach:</Paragraph>
          <BulletList
            items={[
              "Involves your personal information",
              "Creates a risk of identity theft, fraud, or harm",
              "Is required to be reported under applicable law",
            ]}
          />
          <Paragraph>
            <Strong>Notification will include:</Strong>
          </Paragraph>
          <BulletList
            items={[
              "Description of the incident and when it occurred",
              "Types of information that were involved",
              "Steps we have taken to address the breach",
              "Measures you can take to protect yourself",
              "Contact information for questions",
            ]}
          />
        </SubSection>
      </Section>

      {/* Section 14: California Privacy Rights */}
      <Section
        id="california-privacy-rights-ccpacpra"
        title="14. California Privacy Rights (CCPA/CPRA)"
      >
        <Paragraph>
          This section provides additional information for California residents under the California
          Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA).
        </Paragraph>

        <SubSection title="14.1 Your California Privacy Rights">
          <Paragraph>California residents have the following rights:</Paragraph>
          <BulletList
            items={[
              <>
                <Strong>Right to Know:</Strong> Request disclosure of personal information
                collected, used, and shared
              </>,
              <>
                <Strong>Right to Delete:</Strong> Request deletion of personal information (subject
                to exceptions)
              </>,
              <>
                <Strong>Right to Correct:</Strong> Request correction of inaccurate personal
                information
              </>,
              <>
                <Strong>Right to Opt Out:</Strong> Opt out of &ldquo;sale&rdquo; or
                &ldquo;sharing&rdquo; of personal information (Note: We do not sell or share
                personal information)
              </>,
              <>
                <Strong>Right to Non-Discrimination:</Strong> Equal service and pricing regardless
                of exercising privacy rights
              </>,
            ]}
          />
        </SubSection>

        <SubSection title="14.2 Sale and Sharing of Personal Information">
          <Paragraph>
            <Strong>
              We do NOT &ldquo;sell&rdquo; or &ldquo;share&rdquo; personal information
            </Strong>{" "}
            as defined by CCPA. We do not sell personal information to third parties for monetary
            consideration, and we do not share personal information for cross-context behavioral
            advertising.
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 15: European Union Privacy Rights */}
      <Section
        id="european-union-privacy-rights-gdpr"
        title="15. European Union Privacy Rights (GDPR)"
      >
        <Paragraph>
          This section provides additional information for individuals in the European Economic Area
          (EEA), United Kingdom, and Switzerland under the General Data Protection Regulation
          (GDPR).
        </Paragraph>

        <SubSection title="15.1 Your GDPR Rights">
          <Paragraph>You have the following rights under GDPR:</Paragraph>
          <BulletList
            items={[
              <>
                <Strong>Right of Access (Article 15):</Strong> Obtain confirmation that we process
                your data and access your personal data
              </>,
              <>
                <Strong>Right to Rectification (Article 16):</Strong> Correct inaccurate personal
                data
              </>,
              <>
                <Strong>Right to Erasure (Article 17):</Strong> Request deletion of your personal
                data (&ldquo;right to be forgotten&rdquo;)
              </>,
              <>
                <Strong>Right to Restriction (Article 18):</Strong> Restrict processing in certain
                circumstances
              </>,
              <>
                <Strong>Right to Data Portability (Article 20):</Strong> Receive your data in a
                structured, commonly used format
              </>,
              <>
                <Strong>Right to Object (Article 21):</Strong> Object to processing based on
                legitimate interests
              </>,
              <>
                <Strong>Right to Withdraw Consent (Article 7):</Strong> Withdraw consent at any time
              </>,
              <>
                <Strong>Right to Lodge a Complaint (Article 77):</Strong> File a complaint with your
                supervisory authority
              </>,
            ]}
          />
        </SubSection>

        <SubSection title="15.2 Data Protection Authority">
          <Paragraph>
            <Strong>EEA Supervisory Authorities:</Strong> Find your local authority at{" "}
            <a
              href="https://edpb.europa.eu/about-edpb/board/members_en"
              className="text-pathible-forest hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              edpb.europa.eu
            </a>
          </Paragraph>
          <Paragraph>
            <Strong>UK Information Commissioner&apos;s Office (ICO):</Strong>{" "}
            <a
              href="https://ico.org.uk/"
              className="text-pathible-forest hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              ico.org.uk
            </a>
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 16: Other Jurisdictions */}
      <Section id="other-jurisdictions" title="16. Other Jurisdictions">
        <Paragraph>
          We comply with data protection laws in jurisdictions where we operate or have users,
          including:
        </Paragraph>
        <BulletList
          items={[
            "Canada (PIPEDA)",
            "Brazil (LGPD)",
            "Australia (Privacy Act)",
            "Japan (APPI)",
            "Singapore (PDPA)",
            "Other jurisdictions as applicable",
          ]}
        />
        <Paragraph>
          If you have questions about how we comply with your local data protection laws, contact us
          at{" "}
          <a href="mailto:privacy@pathible.com" className="text-pathible-forest hover:underline">
            privacy@pathible.com
          </a>{" "}
          and specify your country/jurisdiction.
        </Paragraph>
      </Section>

      {/* Section 17: Changes to This Privacy Policy */}
      <Section id="changes-to-this-privacy-policy" title="17. Changes to This Privacy Policy">
        <SubSection title="17.1 Updates and Modifications">
          <Paragraph>We may update this Privacy Policy from time to time to reflect:</Paragraph>
          <BulletList
            items={[
              "Changes in our data practices",
              "New features or services",
              "Changes in applicable laws and regulations",
              "Feedback from users and regulators",
              "Changes in technology or security practices",
            ]}
          />
        </SubSection>

        <SubSection title="17.2 Material Changes">
          <Paragraph>
            For material changes that significantly affect your privacy rights, we will:
          </Paragraph>
          <BulletList
            items={[
              "Provide prominent notice on our Service (banner, popup, etc.)",
              "Send email notification to registered users",
              "Provide at least 30 days' notice before changes take effect",
              "Give you the opportunity to review changes and make decisions about your account",
            ]}
          />
        </SubSection>

        <SubSection title="17.3 Your Options After Changes">
          <Paragraph>If you disagree with changes to this Privacy Policy:</Paragraph>
          <BulletList
            items={[
              "You may close your account (see Section 12)",
              "You may exercise your privacy rights (see Section 8)",
              "You may contact us with concerns at privacy@pathible.com",
            ]}
          />
          <Paragraph>
            <Strong>
              Continued use of the Service after changes take effect constitutes acceptance of the
              updated Privacy Policy.
            </Strong>
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 18: Contact Information */}
      <Section id="contact-information" title="18. Contact Information">
        <div className="grid sm:grid-cols-2 gap-4 my-6">
          <ContactCard icon={Mail} title="Privacy Inquiries">
            <a href="mailto:privacy@pathible.com" className="text-pathible-forest hover:underline">
              privacy@pathible.com
            </a>
          </ContactCard>
          <ContactCard icon={Shield} title="Security Issues">
            <a href="mailto:security@pathible.com" className="text-pathible-forest hover:underline">
              security@pathible.com
            </a>
          </ContactCard>
          <ContactCard icon={Mail} title="Customer Support">
            <a href="mailto:support@pathible.com" className="text-pathible-forest hover:underline">
              support@pathible.com
            </a>
          </ContactCard>
          <ContactCard icon={Phone} title="Legal Department">
            <a href="mailto:legal@pathible.com" className="text-pathible-forest hover:underline">
              legal@pathible.com
            </a>
          </ContactCard>
        </div>

        <Paragraph>
          <Strong>Mailing Address:</Strong>
          <br />
          Pathible, Inc.
          <br />
          Attn: Privacy Officer
          <br />
          [Address to be provided]
        </Paragraph>
      </Section>

      {/* Section 19: Dispute Resolution */}
      <Section id="dispute-resolution" title="19. Dispute Resolution">
        <SubSection title="19.1 Informal Resolution">
          <Paragraph>
            <Strong>We encourage you to contact us first.</Strong> Many privacy concerns can be
            resolved through direct communication. Email{" "}
            <a href="mailto:privacy@pathible.com" className="text-pathible-forest hover:underline">
              privacy@pathible.com
            </a>{" "}
            with your concerns, and we will work with you in good faith to resolve issues.
          </Paragraph>
        </SubSection>

        <SubSection title="19.2 Regulatory Complaints">
          <Paragraph>You have the right to file complaints with regulatory authorities:</Paragraph>
          <BulletList
            items={[
              <>
                <Strong>European Union:</Strong> European Data Protection Board (EDPB)
              </>,
              <>
                <Strong>United Kingdom:</Strong> Information Commissioner&apos;s Office (ICO)
              </>,
              <>
                <Strong>United States:</Strong> Federal Trade Commission (FTC), California Attorney
                General
              </>,
              <>
                <Strong>Canada:</Strong> Office of the Privacy Commissioner
              </>,
            ]}
          />
        </SubSection>
      </Section>

      <Divider />

      {/* Summary */}
      <div className="my-8 p-6 bg-pathible-forest/5 rounded-2xl border border-pathible-forest/10">
        <h2 className="font-crimson text-2xl font-semibold text-foreground mb-4">
          Summary of Key Points
        </h2>
        <p className="text-muted-foreground text-sm mb-4 italic">
          This summary is for convenience only. Please read the full Privacy Policy above.
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-pathible-forest mt-2 flex-shrink-0" />
            <span>
              <Strong>We collect:</Strong> Account information, documents you upload, usage data,
              and cookies
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-pathible-forest mt-2 flex-shrink-0" />
            <span>
              <Strong>We use your data to:</Strong> Provide our Service, analyze documents with AI,
              improve our platform, and communicate with you
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-pathible-forest mt-2 flex-shrink-0" />
            <span>
              <Strong>We share data with:</Strong> Service providers (cloud hosting, AI, payment
              processors) and as required by law
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-pathible-forest mt-2 flex-shrink-0" />
            <span>
              <Strong>We do NOT:</Strong> Sell your personal information or use it to provide
              financial/legal advice
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-pathible-forest mt-2 flex-shrink-0" />
            <span>
              <Strong>Your rights:</Strong> Access, correct, delete, export your data; opt out of
              marketing; file complaints with regulators
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-pathible-forest mt-2 flex-shrink-0" />
            <span>
              <Strong>Security:</Strong> We encrypt data, use secure infrastructure, and implement
              comprehensive security measures
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-pathible-forest mt-2 flex-shrink-0" />
            <span>
              <Strong>Contact:</Strong> privacy@pathible.com for any privacy questions or to
              exercise your rights
            </span>
          </li>
        </ul>
      </div>

      <Divider />

      {/* Footer disclaimer */}
      <div className="text-center text-muted-foreground text-sm">
        <p className="mb-2">
          <Strong>Effective Date:</Strong> January 1, 2026 | <Strong>Last Updated:</Strong> December
          14, 2024 | <Strong>Version:</Strong> 1.0
        </p>
        <p>&copy; 2026 Pathible, Inc. All rights reserved.</p>
      </div>
    </div>
  );
}
