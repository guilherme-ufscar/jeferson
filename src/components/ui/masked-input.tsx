"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface MaskedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  mask: (value: string) => string;
  onValueChange: (raw: string, masked: string) => void;
}

/**
 * Input com máscara. Recebe uma função `mask` que formata o valor
 * e `onValueChange` que retorna o valor cru (só dígitos) e o mascarado.
 */
const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, mask, onValueChange, value, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const masked = mask(raw);
      onValueChange(raw.replace(/\D/g, ""), masked);
    };

    return (
      <input
        className={cn(
          "flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        value={value}
        onChange={handleChange}
        {...props}
      />
    );
  }
);
MaskedInput.displayName = "MaskedInput";

export { MaskedInput };
