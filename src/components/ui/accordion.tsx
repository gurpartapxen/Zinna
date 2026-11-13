"use client";

import {
  createContext,
  useContext,
  useId,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "cn";

type AccordionContextValue = {
  expandedValues: string[];
  toggleValue: (value: string) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

type AccordionProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "defaultValue"
> & {
  defaultValue?: string[];
  multiple?: boolean;
  allowsMultipleExpanded?: boolean;
  children: ReactNode;
};

function Accordion({
  defaultValue = [],
  multiple = false,
  allowsMultipleExpanded = false,
  className,
  children,
  ...props
}: AccordionProps) {
  const [expandedValues, setExpandedValues] = useState(defaultValue);

  function toggleValue(value: string) {
    setExpandedValues((currentValues) => {
      const isOpen = currentValues.includes(value);
      const allowMultiple = multiple || allowsMultipleExpanded;

      if (isOpen) {
        return currentValues.filter((currentValue) => currentValue !== value);
      }

      return allowMultiple ? [...currentValues, value] : [value];
    });
  }

  return (
    <AccordionContext.Provider value={{ expandedValues, toggleValue }}>
      <div
        data-slot="accordion"
        className={cn("w-full", className)}
        {...props}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

type AccordionItemContextValue = {
  value: string;
  isOpen: boolean;
  contentId: string;
};

const AccordionItemContext =
  createContext<AccordionItemContextValue | null>(null);

type AccordionItemProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
  children: ReactNode;
};

function AccordionItem({
  value,
  className,
  children,
  ...props
}: AccordionItemProps) {
  const accordion = useContext(AccordionContext);

  if (!accordion) {
    throw new Error("AccordionItem must be used inside Accordion");
  }

  const itemId = useId();
  const isOpen = accordion.expandedValues.includes(value);
  const contentId = `accordion-content-${itemId}`;

  return (
    <AccordionItemContext.Provider value={{ value, isOpen, contentId }}>
      <div
        data-slot="accordion-item"
        data-state={isOpen ? "open" : "closed"}
        className={cn("border-b", className)}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

type AccordionTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionTriggerProps) {
  const accordion = useContext(AccordionContext);
  const item = useContext(AccordionItemContext);

  if (!accordion || !item) {
    throw new Error(
      "AccordionTrigger must be used inside AccordionItem and Accordion",
    );
  }

  return (
    <button
      type="button"
      aria-expanded={item.isOpen}
      aria-controls={item.contentId}
      data-slot="accordion-trigger"
      data-state={item.isOpen ? "open" : "closed"}
      className={cn(
        "flex w-full items-center justify-between gap-4 py-4 text-left font-medium transition-all hover:underline",
        className,
      )}
      onClick={() => accordion.toggleValue(item.value)}
      {...props}
    >
      <span>{children}</span>

      <ChevronDown
        aria-hidden="true"
        className="size-4 shrink-0 transition-transform duration-300 data-[state=open]:rotate-180"
        data-state={item.isOpen ? "open" : "closed"}
      />
    </button>
  );
}

type AccordionContentProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps) {
  const item = useContext(AccordionItemContext);

  if (!item) {
    throw new Error("AccordionContent must be used inside AccordionItem");
  }

  return (
    <div
      id={item.contentId}
      role="region"
      data-slot="accordion-content"
      data-state={item.isOpen ? "open" : "closed"}
      className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-out",
        item.isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
      {...props}
    >
      <div className={cn("min-h-0 overflow-hidden", className)}>
        {children}
      </div>
    </div>
  );
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
};