import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.34em]",
  {
    variants: {
      variant: {
        primary: "border-[#7027E0]/70 bg-[#7027E0]/15 text-[#d3c4ff]",
        cyan: "border-[#2BF4FF]/70 bg-[#2BF4FF]/15 text-[#2BF4FF]",
        muted: "border-slate-600 bg-slate-900/70 text-slate-300",
        success: "border-emerald-400/70 bg-emerald-400/15 text-emerald-100",
        warning: "border-amber-400/70 bg-amber-400/15 text-amber-100",
        danger: "border-rose-500/70 bg-rose-500/15 text-rose-100"
      }
    },
    defaultVariants: {
      variant: "primary"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };



