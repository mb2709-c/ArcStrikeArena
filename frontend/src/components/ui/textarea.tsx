import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-[120px] w-full rounded-[1.75rem] border border-[#7027E0]/35 bg-slate-950/70 px-4 py-3 text-sm text-sky-100 placeholder:text-sky-200/60 focus:border-[#2BF4FF] focus:outline-none focus:ring-2 focus:ring-[#7027E0]/40",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };



