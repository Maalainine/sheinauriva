import React from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {steps.map((step, i) => (
          <React.Fragment key={step}>
            <BreadcrumbItem className={i === current ? "text-accent-foreground font-bold" : undefined}>
              {step}
            </BreadcrumbItem>
            {i < steps.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
