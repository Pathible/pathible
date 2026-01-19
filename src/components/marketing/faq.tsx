import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { FAQ_ITEMS } from "@/lib/seo-config";

export function FAQSection() {
  return (
    <section
      id="faq"
      className="relative py-24 sm:py-32 bg-linear-to-b from-pathible-sand to-card/30 overflow-hidden"
    >
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-pathible-forest font-medium tracking-wide text-sm uppercase mb-4">
            Common questions
          </p>
          <h2 className="font-crimson text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Everything you need to know about preserving your family's legacy with Pathible.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {FAQ_ITEMS.map((item) => {
            // Create a stable key from the question text
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
