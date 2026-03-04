"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { maskCurrency, unmaskCurrency } from "@/lib/masks";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number;
  onValueChange: (value: number) => void;
}

/**
 * Input de moeda brasileira (R$). Armazena o valor como number,
 * exibe formatado com vírgula para centavos e ponto para milhares.
 */
const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    const [display, setDisplay] = React.useState(() => {
      if (!value) return "0,00";
      return maskCurrency(Math.round(value * 100).toString());
    });

    // Sync external value changes
    React.useEffect(() => {
      const expected = maskCurrency(Math.round(value * 100).toString());
      if (unmaskCurrency(display) !== value) {
        setDisplay(expected);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "");
      if (!raw) {
        setDisplay("0,00");
        onValueChange(0);
        return;
      }
      const masked = maskCurrency(raw);
      setDisplay(masked);
      onValueChange(unmaskCurrency(masked));
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
          R$
        </span>
        <input
          className={cn(
            "flex h-9 w-full rounded-md border border-zinc-200 bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          value={display}
          onChange={handleChange}
          inputMode="numeric"
          {...props}
        />
      </div>
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
