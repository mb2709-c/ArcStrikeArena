import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold uppercase tracking-[0.32em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#7027E0] via-[#5F3DFB] to-[#2BF4FF] text-slate-950 shadow-[0_18px_54px_-22px_rgba(112,39,224,0.8)] hover:shadow-[0_20px_60px_-20px_rgba(112,39,224,0.95)]",
        secondary:
          "border border-[#7027E0]/60 bg-slate-950/70 text-[#d3c4ff] hover:border-[#2BF4FF] hover:text-white",
        outline:
          "border border-slate-600 bg-transparent text-slate-200 hover:border-[#2BF4FF] hover:text-[#2BF4FF]",
        ghost: "text-slate-300 hover:bg-slate-950/60",
        destructive: "bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-400",
        accent:
          "bg-gradient-to-r from-[#ff4553] to-[#2BF4FF] text-slate-950 hover:from-[#ff6a75] hover:to-[#55faff]",
        link: "text-[#2BF4FF] underline-offset-4 hover:underline"
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-[11px]",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };



