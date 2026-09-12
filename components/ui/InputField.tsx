"use client";

import { Eye, EyeOff, Search } from "lucide-react";
import React, { useState } from "react";
import {
    Controller,
    type Control,
    type FieldError,
    type FieldValues,
    type Path,
    type UseFormRegister,
} from "react-hook-form";

interface InputFieldProps<T extends FieldValues> {
    name: Path<T>;
    label?: string;
    type?: React.HTMLInputTypeAttribute;
    placeholder?: string;
    value?: string | number | readonly string[];
    register?: UseFormRegister<T>;
    control?: Control<T>;

    error?: string | FieldError;

    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;

    useFor?: "input" | "textarea" | "search" | "editor";
    rows?: number;

    id?: string;
    maxLength?: number;
    autoComplete?: string;

    className?: string;
    inputClassName?: string;
    labelClassName?: string;

    rightLabel?: React.ReactNode;
    leftAdornment?: React.ReactNode;

    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    onFocus?: React.FocusEventHandler<HTMLInputElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
    onEnterClick?: () => void;
}

export default function InputField<T extends FieldValues>({
    name,
    label,
    type = "text",
    placeholder,
    register,
    control,
    error,
    required = false,
    disabled = false,
    readOnly = false,
    useFor = "input",
    rows = 4,
    id,
    value,
    maxLength,
    autoComplete,
    className = "",
    inputClassName = "",
    labelClassName = "",
    rightLabel,
    leftAdornment,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    onEnterClick,
}: InputFieldProps<T>) {
    const [showPassword, setShowPassword] = useState(false);

    const inputId = id ?? String(name);

    const errorMessage =
        typeof error === "string" ? error : error?.message;

    const actualType =
        type === "password"
            ? showPassword
                ? "text"
                : "password"
            : type;

    const baseClassName = `
        w-full
        rounded-md
        border
        bg-background
        text-foreground
        outline-none
        transition-colors
        placeholder:text-muted-foreground
        focus:border-primary
        focus:ring-2
        focus:ring-primary/20
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${errorMessage ? "border-red-500" : "border-input"}
        ${inputClassName}
        `;

    const handleKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {
        onKeyDown?.(event);

        if (event.key === "Enter") {
            onEnterClick?.();
        }
    };

    const renderLabel = () => {
        if (!label && !rightLabel) return null;

        return (
            <div className="mb-2 flex items-center justify-between">
                {label && (
                    <label
                        htmlFor={inputId}
                        className={`text-sm font-medium ${labelClassName}`}
                    >
                        {label}

                        {required && (
                            <span className="ml-1 text-red-500">*</span>
                        )}
                    </label>
                )}

                {rightLabel && (
                    <div className="text-sm text-muted-foreground">
                        {rightLabel}
                    </div>
                )}
            </div>
        );
    };

    /* ---------------------------------------------------------------------- */
    /* TEXT EDITOR                                                            */
    /* ---------------------------------------------------------------------- */

    if (useFor === "editor") {
        if (!control) {
            console.warn(
                `InputField "${String(
                    name
                )}" requires "control" when useFor="editor".`
            );

            return null;
        }

        return (
            <div className={`space-y-2 ${className}`}>
                {renderLabel()}

                <Controller
                    name={name}
                    control={control}
                    render={({ field }) => (
                        <div
                            className={`
                overflow-hidden
                rounded-md
                border
                bg-background
                ${errorMessage ? "border-red-500" : "border-input"}
              `}
                        >
                            {/* Toolbar */}
                            <div className="flex items-center gap-1 border-b px-2 py-1">
                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() =>
                                        field.onChange(`${field.value ?? ""} **bold**`)
                                    }
                                    className="rounded px-2 py-1 text-sm font-bold hover:bg-muted"
                                >
                                    B
                                </button>

                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() =>
                                        field.onChange(`${field.value ?? ""} *italic*`)
                                    }
                                    className="rounded px-2 py-1 text-sm italic hover:bg-muted"
                                >
                                    I
                                </button>

                                <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() =>
                                        field.onChange(
                                            `${field.value ?? ""} <u>underline</u>`
                                        )
                                    }
                                    className="rounded px-2 py-1 text-sm underline hover:bg-muted"
                                >
                                    U
                                </button>
                            </div>

                            {/* Editor area */}
                            <textarea
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                placeholder={placeholder}
                                disabled={disabled}
                                readOnly={readOnly}
                                rows={6}
                                className="
                  w-full
                  resize-none
                  border-0
                  bg-transparent
                  px-3
                  py-3
                  text-sm
                  outline-none
                  focus:ring-0
                "
                            />
                        </div>
                    )}
                />

                {errorMessage && (
                    <p className="text-sm text-red-500">
                        {errorMessage}
                    </p>
                )}
            </div>
        );
    }

    /* ---------------------------------------------------------------------- */
    /* NORMAL INPUT / SEARCH / TEXTAREA                                       */
    /* ---------------------------------------------------------------------- */

    const registeredField = register ? register(name) : undefined;

    return (
        <div className={`space-y-2 ${className}`}>
            {renderLabel()}

            {useFor === "textarea" ? (
                <textarea
                    id={inputId}
                    placeholder={placeholder}
                    rows={rows}
                    disabled={disabled}
                    readOnly={readOnly}
                    maxLength={maxLength}
                    className={`
                        ${baseClassName}
                        min-h-[100px]
                        px-4
                        py-1
                        resize-y
                    `}
                    {...registeredField}
                />
            ) : (
                <div className="relative">
                    {useFor === "search" && (
                        <Search
                            size={18}
                            className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-muted-foreground
              "
                        />
                    )}

                    <input
                        id={inputId}
                        type={actualType}
                        placeholder={placeholder}
                        value={value}
                        disabled={disabled}
                        readOnly={readOnly}
                        maxLength={maxLength}
                        autoComplete={autoComplete}
                        className={`
    ${baseClassName}
    h-11
    px-4
    ${useFor === "search" || leftAdornment ? "pl-11" : ""}
    ${type === "password" ? "pr-10" : ""}
  `}
                        {...registeredField}
                        onChange={(event) => {
                            registeredField?.onChange(event);
                            onChange?.(event);
                        }}
                        onBlur={(event) => {
                            registeredField?.onBlur(event);
                            onBlur?.(event);
                        }}
                        onFocus={onFocus}
                        onKeyDown={handleKeyDown}
                    />

                    {leftAdornment && (
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {leftAdornment}
                        </span>
                    )}

                    {type === "password" && (
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() =>
                                setShowPassword((previous) => !previous)
                            }
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-muted-foreground
                hover:text-foreground
              "
                        >
                            {showPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    )}
                </div>
            )}

            {errorMessage && (
                <p className="text-sm text-red-500">
                    {errorMessage}
                </p>
            )}
        </div>
    );
}
