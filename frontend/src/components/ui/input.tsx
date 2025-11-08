import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefixIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, prefixIcon, ...props }, ref) => (
  <div className="relative">
    {prefixIcon ? (
      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#7027E0]">
        {prefixIcon}
      </span>
    ) : null}
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-11 w-full rounded-[1.75rem] border border-[#7027E0]/35 bg-slate-950/70 px-4 text-sm text-sky-100 placeholder:text-sky-200/60 focus:border-[#2BF4FF] focus:outline-none focus:ring-2 focus:ring-[#7027E0]/40",
        prefixIcon ? "pl-11" : "",
        className
      )}
      {...props}
    />
  </div>
));
Input.displayName = "Input";

export { Input };



