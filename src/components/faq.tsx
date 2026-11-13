import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "What materials does Zinna use?",
    answer:
      "Zinna uses carefully selected cotton fabrics designed for softness, comfort, and everyday durability.",
  },
  {
    question: "How do Zinna clothes fit?",
    answer:
      "Our pieces are designed with relaxed, comfortable silhouettes. Check the size guide on each product page for exact measurements.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Orders are usually processed within 1–3 business days. Standard delivery typically takes 5–7 business days.",
  },
  {
    question: "Do you offer international shipping?",
    answer:
      "Yes. Zinna ships to selected international locations. Shipping availability and rates are shown during checkout.",
  },
  {
    question: "What is your return policy?",
    answer:
      "Items can be returned within 30 days as long as they are unworn, unwashed, and returned with their original packaging.",
  },
  {
    question: "How should I wash my Zinna pieces?",
    answer:
      "For the best results, wash your garments inside out with cold water and allow them to air dry whenever possible.",
  },
  {
    question: "Can I change or cancel my order?",
    answer:
      "Contact us as soon as possible after placing your order. We will try to help before the order enters processing.",
  },
  {
    question: "Are the colors accurate on screen?",
    answer:
      "We make every effort to display our colors accurately, but slight differences may occur depending on your screen settings.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order ships, you will receive a confirmation email containing your tracking information.",
  },
  {
    question: "How can I contact Zinna support?",
    answer:
      "You can contact our support team through the contact page. We usually respond within one business day.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="bg-background px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:pt-6">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
            Need to know
          </p>

          <h2 className="mt-5 font-[family-name:var(--font-arizonia)] text-5xl font-normal leading-9 sm:text-5xl">
            Frequently asked questions
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            Find answers to the most common questions about Zinna products,
            shipping, sizing, and returns.
          </p>
        </div>

        <Accordion
          defaultValue={["faq-1"]}
          className="mx-auto mt-10 w-full max-w-3xl"
        >
          {faqItems.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`faq-${index + 1}`}
              className="border-b border-foreground/15"
            >
              <AccordionTrigger className="py-6 text-left text-base font-medium hover:no-underline sm:text-lg">
                {item.question}
              </AccordionTrigger>

              <AccordionContent className="pb-6 pr-8 text-left text-sm leading-7 text-muted-foreground sm:text-base">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}