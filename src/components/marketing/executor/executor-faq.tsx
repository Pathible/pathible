import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";

const EXECUTOR_FAQ_ITEMS = [
  {
    question: "What is estate administration?",
    answer:
      "Estate administration is the process of settling someone's affairs after they pass away. It includes gathering assets, paying debts, filing tax returns, distributing property to beneficiaries, and closing accounts. The person responsible for this process is called the executor (if named in a will) or administrator (if appointed by the court).",
  },
  {
    question: "Do I need a lawyer?",
    answer:
      "It depends on the complexity of the estate. Simple estates with clear wills and few assets can often be handled without an attorney. However, if there are disputes, significant debts, business interests, or properties in multiple states, legal counsel is recommended. Pathible helps you organize everything so that if you do hire an attorney, you save time and money.",
  },
  {
    question: "How is this different from hiring a probate attorney?",
    answer:
      "Pathible doesn't replace legal counsel. It's the organizational backbone that keeps you on track between attorney meetings. Think of it as your personal estate administration dashboard, keeping every task, document, and deadline in one place so nothing falls through the cracks.",
  },
  {
    question: "What if there's no will?",
    answer:
      "When someone dies without a will (intestate), state laws determine how assets are distributed. The court will appoint an administrator to handle the estate. The process takes longer but Pathible's checklist adapts to guide you through intestate administration, including the additional court filings required.",
  },
  {
    question: "How long does estate administration take?",
    answer:
      "Most estates take 6-18 months to fully settle, though complex estates can take longer. Factors include the size of the estate, whether probate is required, if there are disputes among beneficiaries, and how organized the deceased person's records were. Pathible helps you move through each phase efficiently.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. Pathible uses bank-level encryption to protect your data. All documents are stored securely, and you control who has access. We never sell your data or share it with third parties.",
  },
];

export function ExecutorFAQ() {
  return (
    <section className="relative py-16 sm:py-20 bg-linear-to-b from-pathible-sand to-card/30 overflow-hidden">
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-4">
            Common questions
          </p>
          <h2 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Everything you need to know about settling an estate with Pathible.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {EXECUTOR_FAQ_ITEMS.map((item) => {
            const itemKey = item.question
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .slice(0, 50);
            return (
              <AccordionItem
                key={itemKey}
                value={itemKey}
                className="bg-white rounded-2xl border border-pathible-sage/20 px-6 shadow-sm"
              >
                <AccordionTrigger className="text-left font-medium text-lg py-6 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </section>
  );
}
