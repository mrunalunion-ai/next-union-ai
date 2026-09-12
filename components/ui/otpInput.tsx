// components/ui/OtpInput.tsx
"use client";

import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from "react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type OtpInputProps = {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    disabled?: boolean;
    autoFocus?: boolean;
};

export function OtpInput({
    length = 4,
    value,
    onChange,
    error,
    disabled,
    autoFocus = true,
}: OtpInputProps) {
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const digits = Array.from({ length }, (_, i) => value[i] ?? "");

    useEffect(() => {
        if (autoFocus) inputRefs.current[0]?.focus();
    }, [autoFocus]);

    const commit = (next: string) => {
        onChange(next);
    };

    const setDigit = (index: number, digit: string) => {
        const next = digits.slice();
        next[index] = digit;
        commit(next.join("").slice(0, length));
    };

    const handleChange = (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "");
        if (!raw) {
            setDigit(index, "");
            return;
        }
        setDigit(index, raw.slice(-1));
        if (index < length - 1) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number) => (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            if (digits[index]) {
                setDigit(index, "");
            } else if (index > 0) {
                inputRefs.current[index - 1]?.focus();
                setDigit(index - 1, "");
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        if (!pasted) return;
        commit(pasted);
        inputRefs.current[Math.min(pasted.length, length - 1)]?.focus();
    };

    return (
        <div>
            <div className="flex justify-center gap-3" role="group" aria-label="Verification code">
                {digits.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        disabled={disabled}
                        onChange={handleChange(index)}
                        onKeyDown={handleKeyDown(index)}
                        onPaste={handlePaste}
                        onFocus={(e) => e.target.select()}
                        aria-label={`Digit ${index + 1} of ${length}`}
                        className={cn(
                            "h-12 w-12 rounded-xl border border-input bg-background text-center text-xl font-bold text-foreground shadow-sm transition-all duration-200 sm:h-14 sm:w-14",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            digit ? "border-primary" : "border-border",
                            error && "border-destructive focus:ring-destructive/15",
                            disabled && "cursor-not-allowed opacity-60"
                        )}
                    />
                ))}
            </div>
            {error && <p className="mt-2 text-center text-sm text-destructive">{error}</p>}
        </div>
    );
}