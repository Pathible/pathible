import { AlertTriangle } from "lucide-react";

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
      {items.map((item, index) => {
        const key = typeof item === "string" ? item : `bullet-${index}`;
        return (
          <li
            key={key}
            className="text-muted-foreground leading-relaxed text-base sm:text-lg pl-6 relative before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-2 before:h-2 before:bg-pathible-sage/40 before:rounded-full"
          >
            {item}
          </li>
        );
      })}
    </ul>
  );
}

function NumberedList({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ol className="list-none space-y-3 mb-6 pl-0 counter-reset-list">
      {items.map((item, index) => {
        const key = typeof item === "string" ? item : `numbered-${index}`;
        return (
          <li
            key={key}
            className="text-muted-foreground leading-relaxed text-base sm:text-lg pl-10 relative"
          >
            <span className="absolute left-0 top-0 w-7 h-7 rounded-full bg-pathible-forest/10 flex items-center justify-center text-sm font-medium text-pathible-forest">
              {String.fromCharCode(97 + index)}
            </span>
            {item}
          </li>
        );
      })}
    </ol>
  );
}

function ImportantNotice({
  children,
  variant = "warning",
}: {
  children: React.ReactNode;
  variant?: "warning" | "info";
}) {
  const styles = {
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    info: "bg-pathible-forest/5 border-pathible-forest/20 text-foreground",
  };

  return (
    <div className={`my-8 p-6 border rounded-2xl ${styles[variant]}`}>
      <div className="flex gap-4">
        <AlertTriangle
          className={`w-6 h-6 shrink-0 mt-0.5 ${
            variant === "warning" ? "text-amber-600" : "text-pathible-forest"
          }`}
        />
        <div className="font-medium">{children}</div>
      </div>
    </div>
  );
}

function Divider() {
  return <hr className="my-12 border-t-2 border-pathible-sage/20" />;
}

export function TermsOfServiceContent() {
  return (
    <div className="legal-content">
      {/* Important Legal Notice */}
      <ImportantNotice>
        <p className="mb-4">
          PLEASE READ THESE TERMS OF SERVICE CAREFULLY BEFORE USING THE PATHIBLE SERVICE. BY
          ACCESSING OR USING PATHIBLE, YOU AGREE TO BE BOUND BY THESE TERMS. IF YOU DO NOT AGREE TO
          THESE TERMS, DO NOT USE THIS SERVICE.
        </p>
        <p>
          <Strong>
            PATHIBLE IS NOT A FINANCIAL ADVISOR, FINANCIAL INSTITUTION, LEGAL ADVISOR, TAX ADVISOR,
            OR ANY OTHER TYPE OF PROFESSIONAL SERVICE PROVIDER. THE SERVICE IS PROVIDED FOR
            INFORMATIONAL AND EDUCATIONAL PURPOSES ONLY.
          </Strong>
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
            "Acceptance of Terms",
            "Description of Service",
            "User Eligibility and Account Requirements",
            "User Responsibilities and Conduct",
            "Subscription, Payment, and Billing Terms",
            "Intellectual Property Rights",
            "User-Generated Content and Uploaded Documents",
            "Disclaimers",
            "Limitation of Liability",
            "Indemnification",
            "Arbitration and Dispute Resolution",
            "Class Action Waiver",
            "Governing Law and Jurisdiction",
            "Termination Rights",
            "Modifications to Terms and Service",
            "Severability",
            "Entire Agreement",
            "Additional Provisions",
            "Contact Information",
            "Acknowledgment and Acceptance",
          ].map((item, index) => (
            <li key={item}>
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

      {/* Section 1: Acceptance of Terms */}
      <Section id="acceptance-of-terms" title="1. Acceptance of Terms">
        <SubSection title="1.1 Agreement to Terms">
          <Paragraph>
            By accessing, browsing, or using Pathible (the &ldquo;Service&rdquo;), whether through
            our website, mobile application, or any other platform (collectively, the
            &ldquo;Platform&rdquo;), you (&ldquo;User,&rdquo; &ldquo;you,&rdquo; or
            &ldquo;your&rdquo;) acknowledge that you have read, understood, and agree to be bound by
            these Terms of Service (&ldquo;Terms&rdquo;), as well as our Privacy Policy, which is
            incorporated herein by reference.
          </Paragraph>
        </SubSection>

        <SubSection title="1.2 Binding Agreement">
          <Paragraph>
            These Terms constitute a legally binding agreement between you and Pathible, Inc.
            (&ldquo;Pathible,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), a
            Delaware corporation. Your use of the Service signifies your acceptance of these Terms
            and creates a binding contractual relationship.
          </Paragraph>
        </SubSection>

        <SubSection title="1.3 Modifications to Terms">
          <Paragraph>
            We reserve the right to modify, amend, or update these Terms at any time, in our sole
            discretion, with or without notice. Any changes will be effective immediately upon
            posting of the revised Terms on the Platform. The &ldquo;Effective Date&rdquo; at the
            top of these Terms indicates when they were last updated. Your continued use of the
            Service after any modifications constitutes your acceptance of the modified Terms. It is
            your responsibility to review these Terms periodically.
          </Paragraph>
        </SubSection>

        <SubSection title="1.4 Additional Terms">
          <Paragraph>
            Certain features, services, or functionalities of the Platform may be subject to
            additional terms, conditions, guidelines, or rules (&ldquo;Additional Terms&rdquo;). All
            Additional Terms are incorporated into these Terms by reference. In the event of a
            conflict between these Terms and any Additional Terms, the Additional Terms shall
            control with respect to that specific feature, service, or functionality.
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 2: Description of Service */}
      <Section id="description-of-service" title="2. Description of Service">
        <SubSection title="2.1 Service Overview">
          <Paragraph>
            Pathible is a web and mobile application platform designed to help families organize,
            analyze, and understand their financial and legal documents and data. The Service
            provides informational summaries, visual representations, and educational content about
            users&apos; financial and legal circumstances based on documents and information
            uploaded by users.
          </Paragraph>
        </SubSection>

        <SubSection title="2.2 Informational Purpose Only">
          <ImportantNotice variant="info">
            <p>
              <Strong>
                THE SERVICE IS PROVIDED SOLELY FOR INFORMATIONAL AND EDUCATIONAL PURPOSES.
              </Strong>{" "}
              Pathible is a technology tool that helps organize and present information.
            </p>
          </ImportantNotice>

          <Paragraph>It does not:</Paragraph>
          <BulletList
            items={[
              "Provide financial advice, financial planning services, or investment advice",
              "Act as a financial advisor, registered investment advisor, broker-dealer, or financial institution",
              "Provide legal advice or legal services",
              "Act as an attorney, law firm, or legal advisor",
              "Provide tax advice or tax preparation services",
              "Act as a certified public accountant, tax advisor, or tax preparer",
              "Create any professional-client relationship of any kind",
              "Recommend, endorse, or advise on any specific financial products, legal actions, or tax strategies",
              "Guarantee any specific outcomes, results, or benefits",
            ]}
          />
        </SubSection>

        <SubSection title="2.3 Not a Substitute for Professional Advice">
          <ImportantNotice>
            <Strong>
              YOU ACKNOWLEDGE AND AGREE THAT PATHIBLE IS NOT A SUBSTITUTE FOR PROFESSIONAL ADVICE.
            </Strong>{" "}
            The Service is not intended to replace, and should not be used as a replacement for,
            advice from qualified licensed professionals including but not limited to:
            <ul className="mt-3 space-y-1 list-disc list-inside">
              <li>Financial advisors, financial planners, or investment advisors</li>
              <li>Attorneys or legal counsel</li>
              <li>Certified public accountants or tax professionals</li>
              <li>Insurance professionals</li>
              <li>Estate planning professionals</li>
              <li>Banking or lending professionals</li>
              <li>Any other licensed professional advisors</li>
            </ul>
          </ImportantNotice>
        </SubSection>

        <SubSection title="2.4 User Responsibility for Professional Consultation">
          <Paragraph>
            <Strong>
              YOU ARE SOLELY RESPONSIBLE FOR CONSULTING WITH APPROPRIATE QUALIFIED PROFESSIONALS
            </Strong>{" "}
            before making any financial, legal, tax, or other decisions. Any information, analysis,
            summary, or content provided through the Service should be independently verified with
            qualified professionals before you take any action or make any decisions based on such
            information.
          </Paragraph>
        </SubSection>

        <SubSection title="2.5 Service Capabilities and Limitations">
          <Paragraph>The Service may include features such as:</Paragraph>
          <BulletList
            items={[
              "Document upload, storage, and organization",
              "Automated analysis and summarization of financial and legal documents",
              "Visual dashboards and reports based on user-provided data",
              "Educational content about financial and legal concepts",
              "Tools for tracking and organizing family information",
              "Artificial intelligence-powered document analysis and insights",
            ]}
          />
          <Paragraph>
            <Strong>
              These features are provided as informational tools only and do not constitute
              professional advice of any kind.
            </Strong>
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 3: User Eligibility */}
      <Section
        id="user-eligibility-and-account-requirements"
        title="3. User Eligibility and Account Requirements"
      >
        <SubSection title="3.1 Age Requirement">
          <Paragraph>
            You must be at least <Strong>18 years of age</Strong> to use the Service. If you are
            under 18 years of age, you may not access or use the Service under any circumstances. By
            using the Service, you represent and warrant that you are at least 18 years of age.
          </Paragraph>
        </SubSection>

        <SubSection title="3.2 Legal Capacity">
          <Paragraph>
            You represent and warrant that you have the legal capacity to enter into these Terms and
            that you are not prohibited by law from accessing or using the Service. If you are using
            the Service on behalf of an organization or entity, you represent and warrant that you
            have the authority to bind that organization or entity to these Terms.
          </Paragraph>
        </SubSection>

        <SubSection title="3.3 Account Registration">
          <Paragraph>
            To access certain features of the Service, you may be required to create an account.
            When creating an account, you agree to:
          </Paragraph>
          <BulletList
            items={[
              "Provide accurate, current, and complete information",
              "Maintain and promptly update your account information to keep it accurate, current, and complete",
              "Maintain the security and confidentiality of your account credentials",
              "Notify us immediately of any unauthorized access to or use of your account",
              "Accept responsibility for all activities that occur under your account",
            ]}
          />
        </SubSection>

        <SubSection title="3.4 Account Restrictions">
          <Paragraph>You may not:</Paragraph>
          <BulletList
            items={[
              "Create an account using false or misleading information",
              "Create an account for anyone other than yourself without permission",
              "Use another person's account without permission",
              "Sell, transfer, or assign your account to any other person or entity",
              "Maintain more than one account without our express written permission",
              "Create an account if we have previously terminated your account for violation of these Terms",
            ]}
          />
        </SubSection>
      </Section>

      {/* Section 4: User Responsibilities */}
      <Section id="user-responsibilities-and-conduct" title="4. User Responsibilities and Conduct">
        <SubSection title="4.1 Acceptable Use">
          <Paragraph>
            You agree to use the Service only for lawful purposes and in accordance with these
            Terms. You agree not to use the Service:
          </Paragraph>
          <BulletList
            items={[
              "In any way that violates any applicable federal, state, local, or international law or regulation",
              "To transmit, or procure the sending of, any advertising or promotional material without our prior written consent",
              "To impersonate or attempt to impersonate Pathible, a Pathible employee, another user, or any other person or entity",
              "To engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service",
              "In any manner that could disable, overburden, damage, or impair the Service or interfere with any other party's use of the Service",
            ]}
          />
        </SubSection>

        <SubSection title="4.2 Prohibited Activities">
          <Paragraph>You expressly agree not to:</Paragraph>
          <BulletList
            items={[
              "Use any robot, spider, scraper, or other automated means to access the Service for any purpose without our express written permission",
              "Attempt to gain unauthorized access to any portion of the Service, other users' accounts, or any systems or networks connected to the Service",
              "Probe, scan, or test the vulnerability of the Service or any network connected to the Service",
              "Breach or attempt to breach any security or authentication measures",
              "Reverse engineer, decompile, disassemble, or otherwise attempt to discover the source code of the Service",
              "Introduce any viruses, trojan horses, worms, logic bombs, or other material that is malicious or technologically harmful",
              "Attack the Service via a denial-of-service attack or a distributed denial-of-service attack",
              "Collect or harvest any personally identifiable information from the Service without consent",
              "Use the Service for any commercial purpose without our express written permission",
            ]}
          />
        </SubSection>

        <SubSection title="4.3 Data Accuracy">
          <Paragraph>
            You are solely responsible for the accuracy, quality, integrity, legality, reliability,
            and appropriateness of all data, documents, and information you upload, submit, or
            otherwise provide to the Service. Pathible is not responsible for verifying the accuracy
            or completeness of any information you provide, and any analysis, summaries, or insights
            generated by the Service are only as accurate as the information you provide.
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 4A: Subscription and Payment */}
      <Section
        id="subscription-payment-and-billing-terms"
        title="4A. Subscription, Payment, and Billing Terms"
      >
        <SubSection title="4A.1 Subscription Plans">
          <Paragraph>
            Pathible offers subscription-based access to the Service. By subscribing to Pathible,
            you agree to the following terms:
          </Paragraph>
          <BulletList
            items={[
              "We may offer various subscription plans with different features, limitations, and pricing",
              "Plan details, pricing, and features are available on our website and may change from time to time",
              "Some features may only be available on certain subscription tiers",
            ]}
          />
        </SubSection>

        <SubSection title="4A.2 Third-Party Payment Processing">
          <ImportantNotice variant="info">
            <Strong>IMPORTANT:</Strong> All payment processing for Pathible is handled by Stripe,
            Inc. (&ldquo;Stripe&rdquo;), a third-party payment processor.
            <ul className="mt-3 space-y-1 list-disc list-inside font-normal">
              <li>
                By subscribing to Pathible, you agree to Stripe&apos;s Terms of Service and Privacy
                Policy
              </li>
              <li>
                Pathible does NOT store your full credit card number, CVV, or other sensitive
                payment card data
              </li>
              <li>
                All payment card information is collected, stored, and processed directly by Stripe
                in accordance with PCI DSS compliance standards
              </li>
            </ul>
          </ImportantNotice>
        </SubSection>

        <SubSection title="4A.3 Billing and Payment Terms">
          <Paragraph>
            <Strong>Recurring Billing:</Strong>
          </Paragraph>
          <BulletList
            items={[
              "Subscriptions are billed on a recurring basis (monthly or annually, depending on your plan)",
              "By subscribing, you authorize Stripe to charge your payment method automatically at each billing cycle",
              "Billing cycles begin on the date you subscribe and renew automatically",
            ]}
          />
          <Paragraph>
            <Strong>Price Changes:</Strong>
          </Paragraph>
          <BulletList
            items={[
              "We reserve the right to change subscription prices at any time",
              "Price changes will be communicated at least 30 days before taking effect",
              "Continued use after a price change constitutes acceptance of the new price",
              "You may cancel before the price change takes effect",
            ]}
          />
        </SubSection>

        <SubSection title="4A.4 Automatic Renewal">
          <ImportantNotice>
            <Strong>AUTO-RENEWAL NOTICE:</Strong> YOUR SUBSCRIPTION WILL AUTOMATICALLY RENEW AT THE
            END OF EACH BILLING PERIOD UNLESS YOU CANCEL BEFORE THE RENEWAL DATE.
            <ul className="mt-3 space-y-1 list-disc list-inside font-normal">
              <li>
                Your subscription automatically renews at the end of each billing period (monthly or
                annually)
              </li>
              <li>You will be charged the then-current subscription price plus applicable taxes</li>
              <li>Renewal charges are processed through Stripe using your stored payment method</li>
              <li>You will receive a reminder email before each renewal (where required by law)</li>
            </ul>
          </ImportantNotice>
        </SubSection>

        <SubSection title="4A.5 Refund Policy">
          <Paragraph>
            <Strong>General Policy:</Strong>
          </Paragraph>
          <BulletList
            items={[
              <>
                <Strong>All fees are generally non-refundable</Strong> except as required by
                applicable law
              </>,
              "We do not provide refunds for partial billing periods, unused time, or downgrade differences",
            ]}
          />
          <Paragraph>
            <Strong>Exceptions:</Strong> Refunds may be provided in our sole discretion for:
          </Paragraph>
          <BulletList
            items={[
              "Technical issues that prevent access to the Service for an extended period",
              "Billing errors (duplicate charges, incorrect amounts)",
              "As required by applicable consumer protection laws",
            ]}
          />
          <Paragraph>
            <Strong>How to Request a Refund:</Strong> Email{" "}
            <a href="mailto:support@pathible.com" className="text-pathible-forest hover:underline">
              support@pathible.com
            </a>{" "}
            with your account email, transaction date, and reason for refund request. We will
            respond within 5-10 business days.
          </Paragraph>
        </SubSection>

        <SubSection title="4A.6 Cancellation">
          <Paragraph>
            <Strong>How to Cancel:</Strong>
          </Paragraph>
          <BulletList
            items={[
              <>
                <Strong>Online:</Strong> Through your account settings at pathible.com/settings
              </>,
              <>
                <Strong>Email:</Strong> Send cancellation request to support@pathible.com
              </>,
              <>
                <Strong>Effective Date:</Strong> Cancellation is effective at the end of your
                current billing period
              </>,
            ]}
          />
          <Paragraph>
            <Strong>Effect of Cancellation:</Strong>
          </Paragraph>
          <BulletList
            items={[
              "You retain full access to paid features until the end of your current billing period",
              "After cancellation takes effect, your account will be downgraded to free tier (if available) or deactivated",
              "You will lose access to premium features",
              "Your data will be retained according to our Privacy Policy (you may request deletion)",
              "You may resubscribe at any time at the then-current rates",
            ]}
          />
        </SubSection>
      </Section>

      {/* Section 5: Intellectual Property */}
      <Section id="intellectual-property-rights" title="5. Intellectual Property Rights">
        <SubSection title="5.1 Pathible's Intellectual Property">
          <Paragraph>
            The Service and all of its contents, features, functionality, and underlying technology
            (including but not limited to all information, software, code, text, displays, graphics,
            photographs, video, audio, design, presentation, selection, and arrangement) are owned
            by Pathible, its licensors, or other providers of such material and are protected by
            United States and international copyright, trademark, patent, trade secret, and other
            intellectual property or proprietary rights laws.
          </Paragraph>
        </SubSection>

        <SubSection title="5.2 Limited License to Use">
          <Paragraph>
            Subject to your compliance with these Terms, Pathible grants you a limited,
            non-exclusive, non-transferable, non-sublicensable, revocable license to access and use
            the Service for your personal, non-commercial use only. This license does not include
            any right to:
          </Paragraph>
          <BulletList
            items={[
              "Modify, copy, distribute, transmit, display, perform, reproduce, publish, license, create derivative works from, transfer, or sell any information, software, products, or services obtained from the Service",
              "Use the Service for any commercial purpose or for the benefit of any third party",
              "Remove, obscure, or alter any legal notices displayed in or along with the Service",
              "Use the Service in any way that is unlawful or in violation of these Terms",
            ]}
          />
        </SubSection>

        <SubSection title="5.3 Trademarks">
          <Paragraph>
            Pathible&apos;s name, logo, and all related names, logos, product and service names,
            designs, and slogans are trademarks of Pathible or its affiliates or licensors. You must
            not use such marks without our prior written permission. All other names, logos, product
            and service names, designs, and slogans on the Service are the trademarks of their
            respective owners.
          </Paragraph>
        </SubSection>

        <SubSection title="5.4 Feedback">
          <Paragraph>
            If you provide us with any feedback, suggestions, ideas, or other information or
            materials regarding the Service (&ldquo;Feedback&rdquo;), you grant to Pathible a
            perpetual, irrevocable, worldwide, royalty-free, fully paid-up, sublicensable, and
            transferable right and license to use, reproduce, modify, adapt, publish, translate,
            create derivative works from, distribute, perform, and display such Feedback in any
            form, medium, or technology, whether now known or hereafter developed, for any purpose,
            including commercial purposes, without compensation or attribution to you.
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 6: User-Generated Content */}
      <Section
        id="user-generated-content-and-uploaded-documents"
        title="6. User-Generated Content and Uploaded Documents"
      >
        <SubSection title="6.1 User Content">
          <Paragraph>
            You may have the opportunity to upload, submit, store, or otherwise make available
            documents, data, information, text, images, or other content through the Service
            (&ldquo;User Content&rdquo;). You retain all ownership rights in your User Content.
          </Paragraph>
        </SubSection>

        <SubSection title="6.2 License Grant to Pathible">
          <Paragraph>
            By uploading, submitting, or otherwise making available any User Content through the
            Service, you grant to Pathible a worldwide, non-exclusive, royalty-free, fully paid-up,
            sublicensable, and transferable license to use, reproduce, modify, adapt, publish,
            translate, create derivative works from, distribute, perform, and display such User
            Content solely for the purposes of:
          </Paragraph>
          <BulletList
            items={[
              "Operating, providing, maintaining, and improving the Service",
              "Developing new features and services",
              "Analyzing and understanding how the Service is used",
              "Complying with legal obligations",
              "Enforcing these Terms",
              "Providing support and responding to your inquiries",
            ]}
          />
          <Paragraph>
            This license terminates when you delete your User Content or your account, except to the
            extent that the content has been shared with others and they have not deleted it, or as
            necessary for legal compliance or enforcement of these Terms.
          </Paragraph>
        </SubSection>

        <SubSection title="6.3 Representations and Warranties">
          <Paragraph>You represent and warrant that:</Paragraph>
          <BulletList
            items={[
              "You own or have the necessary rights, licenses, consents, and permissions to use and authorize Pathible to use your User Content as described in these Terms",
              "Your User Content does not and will not infringe, violate, or misappropriate any third party's intellectual property rights, privacy rights, publicity rights, or other personal or proprietary rights",
              "Your User Content does not contain any material that is unlawful, defamatory, libelous, threatening, harassing, obscene, or otherwise objectionable",
              "Your User Content does not contain any viruses, malware, or other harmful code",
              "You have obtained all necessary consents and permissions from any individuals whose personal information is included in your User Content",
            ]}
          />
        </SubSection>

        <SubSection title="6.4 Backup and Data Loss">
          <Paragraph>
            While we implement backup procedures, you are solely responsible for maintaining your
            own backup copies of your User Content. Pathible shall not be liable for any loss,
            corruption, or destruction of User Content.
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 7: Disclaimers */}
      <Section id="disclaimers" title="7. DISCLAIMERS">
        <SubSection title="7.1 NO PROFESSIONAL ADVICE">
          <ImportantNotice>
            <Strong>PATHIBLE IS NOT A PROFESSIONAL ADVISOR OF ANY KIND.</Strong> THE SERVICE DOES
            NOT PROVIDE, AND SHOULD NOT BE CONSTRUED AS PROVIDING, ANY PROFESSIONAL ADVICE INCLUDING
            BUT NOT LIMITED TO:
            <ul className="mt-3 space-y-2 list-disc list-inside font-normal">
              <li>
                <Strong>FINANCIAL ADVICE:</Strong> Pathible is not a financial advisor, registered
                investment advisor, broker-dealer, financial planner, or financial institution.
                Nothing on the Service constitutes investment advice, financial advice, trading
                advice, or any other sort of financial recommendation.
              </li>
              <li>
                <Strong>LEGAL ADVICE:</Strong> Pathible is not a law firm, attorney, or legal
                advisor. Nothing on the Service constitutes legal advice or creates an
                attorney-client relationship.
              </li>
              <li>
                <Strong>TAX ADVICE:</Strong> Pathible is not a certified public accountant, tax
                advisor, enrolled agent, or tax preparer. Nothing on the Service constitutes tax
                advice.
              </li>
            </ul>
          </ImportantNotice>
        </SubSection>

        <SubSection title="7.2 NO PROFESSIONAL RELATIONSHIP">
          <Paragraph>
            <Strong>NO PROFESSIONAL-CLIENT RELATIONSHIP IS CREATED</Strong> by your use of the
            Service. Your use of the Service does not create a financial advisor-client
            relationship, attorney-client relationship, accountant-client relationship, or any other
            professional relationship.
          </Paragraph>
        </SubSection>

        <SubSection title="7.3 CONSULT QUALIFIED PROFESSIONALS">
          <Paragraph>
            <Strong>YOU MUST CONSULT WITH QUALIFIED LICENSED PROFESSIONALS</Strong> before making
            any financial, legal, tax, or other important decisions. The Service is intended to help
            you organize information, not to make decisions for you. Always seek independent
            professional advice tailored to your specific circumstances before:
          </Paragraph>
          <BulletList
            items={[
              "Making investment decisions",
              "Entering into financial transactions",
              "Making legal decisions or taking legal action",
              "Preparing tax returns or making tax planning decisions",
              "Making estate planning decisions",
              "Purchasing insurance products",
              "Making any other decision that could have significant financial, legal, or personal consequences",
            ]}
          />
        </SubSection>

        <SubSection title="7.4 NO GUARANTEE OF ACCURACY">
          <ImportantNotice>
            <Strong>
              WE MAKE NO REPRESENTATIONS OR WARRANTIES ABOUT THE ACCURACY, RELIABILITY,
              COMPLETENESS, CURRENTNESS, OR TIMELINESS
            </Strong>{" "}
            of any information, analysis, summary, insight, or content provided through the Service.
            Information provided by the Service is based on:
            <ul className="mt-3 space-y-1 list-disc list-inside font-normal">
              <li>Data and documents you upload and provide</li>
              <li>Automated analysis that may contain errors</li>
              <li>Artificial intelligence models that may produce inaccurate results</li>
              <li>Third-party data sources that may be incomplete or incorrect</li>
              <li>General information that may not apply to your specific circumstances</li>
            </ul>
          </ImportantNotice>
        </SubSection>

        <SubSection title="7.5 'AS IS' AND 'AS AVAILABLE'">
          <Paragraph>
            <Strong>
              THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS
            </Strong>{" "}
            without warranties of any kind, either express or implied. TO THE FULLEST EXTENT
            PERMISSIBLE UNDER APPLICABLE LAW, PATHIBLE DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED,
            INCLUDING BUT NOT LIMITED TO:
          </Paragraph>
          <BulletList
            items={[
              "Implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement",
              "Warranties that the Service will be uninterrupted, secure, error-free, or virus-free",
              "Warranties regarding the accuracy, reliability, or completeness of any content",
              "Warranties regarding the quality of any products, services, information, or other material obtained through the Service",
            ]}
          />
        </SubSection>

        <SubSection title="7.6 NO FIDUCIARY DUTY">
          <Paragraph>
            <Strong>PATHIBLE DOES NOT OWE YOU ANY FIDUCIARY DUTY OR DUTY OF CARE.</Strong> We are
            not acting as your fiduciary, agent, or advisor. We have no obligation to act in your
            best interest, to monitor your account, to provide warnings, to review your decisions,
            or to provide any protections beyond those expressly stated in these Terms.
          </Paragraph>
        </SubSection>

        <SubSection title="7.7 ASSUMPTION OF RISK">
          <Paragraph>
            <Strong>
              YOU ASSUME ALL RISK ASSOCIATED WITH YOUR USE OF THE SERVICE AND ANY DECISIONS YOU MAKE
              BASED ON INFORMATION PROVIDED BY THE SERVICE.
            </Strong>{" "}
            You are solely responsible for evaluating the accuracy and usefulness of all
            information, analysis, and content provided by the Service.
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 8: Limitation of Liability */}
      <Section id="limitation-of-liability" title="8. Limitation of Liability">
        <SubSection title="8.1 EXCLUSION OF DAMAGES">
          <ImportantNotice>
            <Strong>
              TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL PATHIBLE, ITS
              AFFILIATES, LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS, OR DIRECTORS BE
              LIABLE FOR ANY DAMAGES OF ANY KIND ARISING FROM OR RELATED TO YOUR USE OF OR INABILITY
              TO USE THE SERVICE, INCLUDING BUT NOT LIMITED TO:
            </Strong>
            <ul className="mt-3 space-y-1 list-disc list-inside font-normal">
              <li>Direct, indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, business, data, or use</li>
              <li>Loss of goodwill or reputation</li>
              <li>Financial losses of any kind</li>
              <li>Legal fees or costs of litigation</li>
              <li>Personal injury or emotional distress</li>
              <li>Any other losses or damages</li>
            </ul>
            <p className="mt-3 font-normal">
              WHETHER BASED ON CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, STATUTE, OR
              ANY OTHER LEGAL THEORY, EVEN IF PATHIBLE HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH
              DAMAGES.
            </p>
          </ImportantNotice>
        </SubSection>

        <SubSection title="8.2 Examples of Excluded Liability">
          <Paragraph>
            Without limiting the generality of Section 8.1, Pathible shall not be liable for any
            damages arising from or related to:
          </Paragraph>
          <BulletList
            items={[
              <>
                <Strong>Financial Decisions:</Strong> Any financial losses, investment losses,
                trading losses, or other financial damages resulting from financial decisions made
                based on information provided by the Service
              </>,
              <>
                <Strong>Legal Matters:</Strong> Any adverse legal outcomes, legal judgments,
                penalties, fines, or legal costs resulting from legal decisions made based on
                information provided by the Service
              </>,
              <>
                <Strong>Tax Matters:</Strong> Any tax penalties, interest, audits, or other
                tax-related consequences resulting from tax decisions made based on information
                provided by the Service
              </>,
              <>
                <Strong>Inaccurate Information:</Strong> Any damages resulting from inaccurate,
                incomplete, or outdated information provided by the Service
              </>,
              <>
                <Strong>System Failures:</Strong> Any damages resulting from Service interruptions,
                errors, bugs, data loss, security breaches, or other technical issues
              </>,
            ]}
          />
        </SubSection>

        <SubSection title="8.3 CAP ON LIABILITY">
          <Paragraph>
            <Strong>
              TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE TOTAL LIABILITY OF PATHIBLE TO
              YOU FOR ANY AND ALL CLAIMS ARISING FROM OR RELATED TO YOUR USE OF THE SERVICE OR THESE
              TERMS SHALL NOT EXCEED THE GREATER OF:
            </Strong>
          </Paragraph>
          <NumberedList
            items={[
              "THE TOTAL AMOUNT YOU PAID TO PATHIBLE FOR ACCESS TO THE SERVICE IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY; OR",
              "ONE HUNDRED DOLLARS ($100.00).",
            ]}
          />
        </SubSection>
      </Section>

      {/* Section 9: Indemnification */}
      <Section id="indemnification" title="9. Indemnification">
        <SubSection title="9.1 Your Indemnification Obligation">
          <Paragraph>
            <Strong>
              YOU AGREE TO INDEMNIFY, DEFEND, AND HOLD HARMLESS PATHIBLE, ITS PARENT, SUBSIDIARIES,
              AFFILIATES, LICENSORS, SERVICE PROVIDERS, AND THEIR RESPECTIVE OFFICERS, DIRECTORS,
              EMPLOYEES, CONTRACTORS, AGENTS, LICENSORS, SUPPLIERS, SUCCESSORS, AND ASSIGNS
            </Strong>{" "}
            (collectively, the &ldquo;Pathible Parties&rdquo;) from and against any and all claims,
            liabilities, damages, losses, costs, expenses, fees (including reasonable
            attorneys&apos; fees and court costs) arising from or relating to:
          </Paragraph>
          <NumberedList
            items={[
              "Your use or misuse of the Service",
              "Your violation of these Terms",
              "Your violation of any law, regulation, or third-party right",
              "Your User Content, including any claim that your User Content infringes or violates any third-party intellectual property, privacy, or other rights",
              "Any decisions you make based on information provided by or through the Service, including but not limited to financial decisions, legal decisions, tax decisions, investment decisions, or any other decisions",
              "Any financial losses, legal liabilities, tax penalties, or other consequences you experience that are related in any way to your use of the Service",
              "Your failure to seek or obtain professional advice from qualified licensed professionals",
            ]}
          />
        </SubSection>
      </Section>

      {/* Section 10: Arbitration */}
      <Section
        id="arbitration-and-dispute-resolution"
        title="10. Arbitration and Dispute Resolution"
      >
        <ImportantNotice>
          <Strong>
            PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS, INCLUDING YOUR RIGHT
            TO FILE A LAWSUIT IN COURT.
          </Strong>
        </ImportantNotice>

        <SubSection title="10.1 Binding Arbitration">
          <Paragraph>
            You and Pathible agree that any dispute, claim, or controversy arising out of or
            relating to these Terms, the Service, or your relationship with Pathible (collectively,
            &ldquo;Disputes&rdquo;) will be resolved by binding individual arbitration, except as
            specified in Section 10.3 below.
          </Paragraph>
        </SubSection>

        <SubSection title="10.2 Arbitration Rules and Forum">
          <Paragraph>
            The arbitration will be administered by the American Arbitration Association
            (&ldquo;AAA&rdquo;) under its Commercial Arbitration Rules and Supplementary Procedures
            for Consumer Related Disputes (the &ldquo;AAA Rules&rdquo;), as modified by these Terms.
            The AAA Rules are available at{" "}
            <a
              href="https://www.adr.org"
              className="text-pathible-forest hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.adr.org
            </a>{" "}
            or by calling 1-800-778-7879.
          </Paragraph>
        </SubSection>

        <SubSection title="10.3 Exceptions to Arbitration">
          <Paragraph>
            Notwithstanding Section 10.1, the following Disputes may be brought in court:
          </Paragraph>
          <BulletList
            items={[
              <>
                <Strong>Small Claims:</Strong> Any Dispute that qualifies for small claims court may
                be brought in small claims court in lieu of arbitration
              </>,
              <>
                <Strong>Intellectual Property:</Strong> Any Dispute concerning the validity or
                infringement of a party&apos;s intellectual property rights
              </>,
              <>
                <Strong>Injunctive Relief:</Strong> Either party may seek injunctive or other
                equitable relief in court to prevent actual or threatened infringement
              </>,
            ]}
          />
        </SubSection>

        <SubSection title="10.4 Opt-Out Right">
          <Paragraph>
            <Strong>YOU HAVE THE RIGHT TO OPT OUT OF BINDING ARBITRATION</Strong> within 30 days
            after you first accept these Terms by sending written notice of your decision to opt out
            to{" "}
            <a href="mailto:legal@pathible.com" className="text-pathible-forest hover:underline">
              legal@pathible.com
            </a>
            . The notice must include your name, mailing address, email address associated with your
            account, and a clear statement that you wish to opt out of arbitration.
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 11: Class Action Waiver */}
      <Section id="class-action-waiver" title="11. Class Action Waiver">
        <ImportantNotice>
          <Strong>
            YOU AND PATHIBLE AGREE THAT EACH PARTY MAY BRING DISPUTES AGAINST THE OTHER PARTY ONLY
            IN AN INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED
            CLASS, REPRESENTATIVE, OR COLLECTIVE ACTION OR PROCEEDING.
          </Strong>
          <p className="mt-3 font-normal">
            Unless both you and Pathible agree otherwise, the arbitrator may not consolidate more
            than one person&apos;s claims and may not otherwise preside over any form of
            representative, class, or collective proceeding.
          </p>
        </ImportantNotice>

        <SubSection title="11.1 No Class Actions in Court">
          <Paragraph>
            To the extent that arbitration is not required or if the arbitration agreement is found
            to be unenforceable, you and Pathible agree that any judicial proceeding must be brought
            in an individual capacity and not as a plaintiff or class member in any purported class,
            collective, or representative proceeding.
          </Paragraph>
        </SubSection>

        <SubSection title="11.2 Representative Actions">
          <Paragraph>
            <Strong>
              YOU WAIVE ANY RIGHT TO PURSUE CLAIMS ON A REPRESENTATIVE OR PRIVATE ATTORNEY GENERAL
              BASIS.
            </Strong>{" "}
            You may not act as a representative or private attorney general, or in any other
            representative capacity, on behalf of others in any arbitration or court proceeding
            against Pathible.
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 12: Governing Law */}
      <Section id="governing-law-and-jurisdiction" title="12. Governing Law and Jurisdiction">
        <SubSection title="12.1 Governing Law">
          <Paragraph>
            These Terms and any Dispute arising out of or related to these Terms or the Service
            shall be governed by and construed in accordance with the laws of the State of Delaware,
            United States of America, without regard to its conflict of law principles.
          </Paragraph>
        </SubSection>

        <SubSection title="12.2 Waiver of Jury Trial">
          <Paragraph>
            <Strong>
              TO THE FULLEST EXTENT PERMITTED BY LAW, YOU AND PATHIBLE WAIVE ANY RIGHT TO A JURY
              TRIAL FOR ANY DISPUTE ARISING OUT OF OR RELATED TO THESE TERMS OR THE SERVICE.
            </Strong>
          </Paragraph>
        </SubSection>

        <SubSection title="12.3 International Users">
          <Paragraph>
            The Service is controlled and operated from the United States. If you access or use the
            Service from outside the United States, you do so at your own risk and are responsible
            for compliance with the laws of your jurisdiction. By using the Service, you consent to
            the transfer of your data to the United States.
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 13: Termination */}
      <Section id="termination-rights" title="13. Termination Rights">
        <SubSection title="13.1 Termination by You">
          <Paragraph>
            You may terminate your account and stop using the Service at any time by:
          </Paragraph>
          <BulletList
            items={[
              "Deleting your account through your account settings, if available; or",
              <>
                Sending written notice to Pathible at{" "}
                <a
                  href="mailto:legal@pathible.com"
                  className="text-pathible-forest hover:underline"
                >
                  legal@pathible.com
                </a>
              </>,
            ]}
          />
        </SubSection>

        <SubSection title="13.2 Termination by Pathible">
          <Paragraph>
            Pathible reserves the right to suspend or terminate your account and your access to the
            Service at any time, with or without cause, with or without notice, effective
            immediately, for any reason or no reason, including but not limited to:
          </Paragraph>
          <BulletList
            items={[
              "Violation of these Terms",
              "Violation of applicable law",
              "Fraudulent, harassing, defamatory, threatening, or abusive behavior",
              "Providing false or misleading information",
              "Conduct that Pathible believes may harm other users, third parties, or Pathible",
              "Extended periods of inactivity",
              "Technical or security reasons",
              "Discontinuation of the Service",
            ]}
          />
        </SubSection>

        <SubSection title="13.3 Effect of Termination">
          <Paragraph>Upon termination of your account for any reason:</Paragraph>
          <BulletList
            items={[
              "Your right to access and use the Service immediately ceases",
              "You remain liable for all obligations incurred prior to termination, including any payment obligations",
              "Pathible may delete your User Content and account data, except as required to comply with legal obligations or as permitted by our Privacy Policy",
              "The disclaimers, limitations of liability, indemnification, arbitration, and other provisions that by their nature should survive will survive termination",
            ]}
          />
        </SubSection>

        <SubSection title="13.4 No Refunds">
          <Paragraph>
            <Strong>
              EXCEPT AS REQUIRED BY APPLICABLE LAW, ALL FEES PAID TO PATHIBLE ARE NON-REFUNDABLE.
            </Strong>{" "}
            If your account is terminated, you will not receive any refund for fees paid, including
            fees for any unused portion of a subscription period.
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 14: Modifications */}
      <Section
        id="modifications-to-terms-and-service"
        title="14. Modifications to Terms and Service"
      >
        <SubSection title="14.1 Right to Modify Terms">
          <Paragraph>
            Pathible reserves the right, in its sole discretion, to modify, amend, or update these
            Terms at any time. We may notify you of material changes by:
          </Paragraph>
          <BulletList
            items={[
              "Posting a notice on the Service",
              "Sending an email to your account email address",
              "Displaying a notification when you access the Service",
            ]}
          />
        </SubSection>

        <SubSection title="14.2 Modifications to Service">
          <Paragraph>Pathible reserves the right at any time to:</Paragraph>
          <BulletList
            items={[
              "Modify, suspend, or discontinue the Service (or any part or feature thereof), temporarily or permanently",
              "Impose limits on certain features or restrict access to parts or all of the Service",
              "Change the features, functionality, or content of the Service",
              "Introduce new features, functionality, or content",
            ]}
          />
          <Paragraph>
            We may make such changes with or without notice and shall not be liable to you or any
            third party for any modification, suspension, or discontinuation of the Service.
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 15: Severability */}
      <Section id="severability" title="15. Severability">
        <Paragraph>
          If any provision of these Terms is held to be invalid, illegal, or unenforceable by a
          court of competent jurisdiction or arbitrator, such provision shall be limited or
          eliminated to the minimum extent necessary so that these Terms shall otherwise remain in
          full force and effect and enforceable.
        </Paragraph>
      </Section>

      {/* Section 16: Entire Agreement */}
      <Section id="entire-agreement" title="16. Entire Agreement">
        <SubSection title="16.1 Complete Agreement">
          <Paragraph>
            These Terms, together with our Privacy Policy and any Additional Terms incorporated by
            reference, constitute the entire agreement between you and Pathible regarding the
            Service and supersede all prior or contemporaneous understandings, agreements,
            representations, and warranties, both written and oral, regarding the Service.
          </Paragraph>
        </SubSection>

        <SubSection title="16.2 No Waiver">
          <Paragraph>
            No waiver of any term or condition of these Terms shall be deemed a further or
            continuing waiver of such term or condition or any other term or condition.
            Pathible&apos;s failure to assert any right or provision under these Terms shall not
            constitute a waiver of such right or provision.
          </Paragraph>
        </SubSection>

        <SubSection title="16.3 Assignment">
          <Paragraph>
            You may not assign, transfer, or delegate these Terms or your rights and obligations
            under these Terms without Pathible&apos;s prior written consent. Pathible may freely
            assign, transfer, or delegate these Terms and its rights and obligations at any time
            without your consent or notice.
          </Paragraph>
        </SubSection>

        <SubSection title="16.4 Force Majeure">
          <Paragraph>
            Pathible shall not be liable for any failure or delay in performing its obligations
            under these Terms due to causes beyond its reasonable control, including but not limited
            to acts of God, war, terrorism, riots, embargoes, acts of civil or military authorities,
            fire, floods, accidents, pandemics, strikes, or shortages of transportation, facilities,
            fuel, energy, labor, or materials.
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 17: Additional Provisions */}
      <Section id="additional-provisions" title="17. Additional Provisions">
        <SubSection title="17.1 User Responsibilities for Professional Consultation">
          <Paragraph>You acknowledge and agree that:</Paragraph>
          <BulletList
            items={[
              "You are solely responsible for determining whether and when to consult with licensed professionals",
              "The Service is not designed to identify when professional consultation is required",
              "Pathible has no responsibility to advise you to seek professional consultation",
              "Many financial, legal, and tax situations are time-sensitive, and delays in seeking professional advice may result in adverse consequences",
            ]}
          />
        </SubSection>

        <SubSection title="17.2 Regulatory Compliance">
          <Paragraph>You acknowledge and agree that:</Paragraph>
          <BulletList
            items={[
              "Pathible is not a regulated financial institution, broker-dealer, investment advisor, law firm, or accounting firm",
              "Pathible is not registered with, licensed by, or subject to oversight by any financial, legal, or accounting regulatory authority",
              "The Service is not subject to the regulatory protections applicable to regulated professionals",
              "You are not entitled to any regulatory protections or remedies that may be available to clients of regulated professionals",
            ]}
          />
        </SubSection>

        <SubSection title="17.3 No Guarantee of Availability">
          <Paragraph>You acknowledge and agree that:</Paragraph>
          <BulletList
            items={[
              "The Service may be unavailable from time to time due to maintenance, updates, technical issues, or other reasons",
              "Pathible does not guarantee any specific uptime or availability of the Service",
              "You are responsible for maintaining your own backup copies of any critical information",
            ]}
          />
        </SubSection>
      </Section>

      {/* Section 18: Contact Information */}
      <Section id="contact-information" title="18. Contact Information">
        <SubSection title="18.1 Questions and Concerns">
          <Paragraph>
            If you have any questions, concerns, or complaints about these Terms or the Service,
            please contact us at:
          </Paragraph>
          <div className="my-6 p-6 bg-pathible-sand/50 rounded-xl border border-pathible-sage/20">
            <p className="font-crimson text-lg font-semibold text-foreground mb-4">
              Pathible, Inc.
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <Strong>Email:</Strong>{" "}
                <a
                  href="mailto:legal@pathible.com"
                  className="text-pathible-forest hover:underline"
                >
                  legal@pathible.com
                </a>
              </p>
              <p>
                <Strong>Address:</Strong> [Address to be provided]
              </p>
            </div>
          </div>
        </SubSection>

        <SubSection title="18.2 California Users">
          <Paragraph>
            Under California Civil Code Section 1789.3, California users are entitled to the
            following consumer rights notice: If you have a question or complaint regarding the
            Service, please contact us at the address above. California residents may reach the
            Complaint Assistance Unit of the Division of Consumer Services of the California
            Department of Consumer Affairs by mail at 1625 North Market Blvd., Suite N 112,
            Sacramento, CA 95834, or by telephone at (916) 445-1254 or (800) 952-5210.
          </Paragraph>
        </SubSection>
      </Section>

      {/* Section 19: Acknowledgment */}
      <Section id="acknowledgment-and-acceptance" title="19. Acknowledgment and Acceptance">
        <SubSection title="19.1 Acknowledgment">
          <Paragraph>
            <Strong>BY USING THE SERVICE, YOU ACKNOWLEDGE THAT:</Strong>
          </Paragraph>
          <BulletList
            items={[
              "You have read and understood these Terms in their entirety",
              "You agree to be bound by these Terms",
              "You understand that Pathible is not a professional advisor of any kind and does not provide financial, legal, tax, or other professional advice",
              "You understand that you must consult with qualified licensed professionals before making any important financial, legal, or tax decisions",
              "You understand that the Service is provided for informational and educational purposes only",
              "You understand that you are solely responsible for any decisions you make based on information provided by the Service",
              "You understand and agree to the arbitration provisions, class action waiver, limitations of liability, disclaimers, and indemnification obligations set forth in these Terms",
              "You have had the opportunity to consult with an attorney regarding these Terms if you chose to do so",
            ]}
          />
        </SubSection>

        <SubSection title="19.2 Acceptance">
          <Paragraph>
            Your use of the Service constitutes your acceptance of these Terms. If you do not agree
            to these Terms, you must not access or use the Service.
          </Paragraph>
        </SubSection>
      </Section>

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
