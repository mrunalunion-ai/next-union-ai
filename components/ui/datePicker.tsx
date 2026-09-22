"use client";

import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
    Controller,
    type Control,
    type FieldError,
    type FieldValues,
    type Path,
} from "react-hook-form";

interface DatePickerProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;

    label?: string;
    placeholder?: string;
    error?: string | FieldError;

    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;

    minDate?: Date;
    maxDate?: Date;

    className?: string;
    labelClassName?: string;
    inputClassName?: string;

    format?: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
}

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatDate(
    date: Date,
    format: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD"
) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    if (format === "MM/DD/YYYY") {
        return `${month}/${day}/${year}`;
    }

    if (format === "YYYY-MM-DD") {
        return `${year}-${month}-${day}`;
    }

    return `${day}/${month}/${year}`;
}

function parseDate(value: unknown): Date | null {
    if (!value) return null;

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    if (typeof value === "string") {
        const date = new Date(value);

        return Number.isNaN(date.getTime()) ? null : date;
    }

    return null;
}

function isSameDate(date1: Date, date2: Date) {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
}

function isBefore(date1: Date, date2: Date) {
    const first = new Date(
        date1.getFullYear(),
        date1.getMonth(),
        date1.getDate()
    );

    const second = new Date(
        date2.getFullYear(),
        date2.getMonth(),
        date2.getDate()
    );

    return first < second;
}

function isAfter(date1: Date, date2: Date) {
    const first = new Date(
        date1.getFullYear(),
        date1.getMonth(),
        date1.getDate()
    );

    const second = new Date(
        date2.getFullYear(),
        date2.getMonth(),
        date2.getDate()
    );

    return first > second;
}

export default function DatePicker<T extends FieldValues>({
    name,
    control,
    label,
    placeholder = "Select date",
    error,
    required = false,
    disabled = false,
    readOnly = false,
    minDate,
    maxDate,
    className = "",
    labelClassName = "",
    inputClassName = "",
    format = "DD/MM/YYYY",
}: DatePickerProps<T>) {
    const [open, setOpen] = useState(false);

    const errorMessage =
        typeof error === "string" ? error : error?.message;

    return (
        <div className={`relative space-y-1 ${className}`}>
            {label && (
                <label
                    htmlFor={String(name)}
                    className={`text-sm font-medium ${labelClassName}`}
                >
                    {label}

                    {required && (
                        <span className="ml-1 text-red-500">*</span>
                    )}
                </label>
            )}

            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <DatePickerCalendar
                        value={field.value}
                        onChange={field.onChange}
                        open={open}
                        setOpen={setOpen}
                        placeholder={placeholder}
                        disabled={disabled}
                        readOnly={readOnly}
                        minDate={minDate}
                        maxDate={maxDate}
                        format={format}
                        error={!!errorMessage}
                        inputClassName={inputClassName}
                    />
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

/* -------------------------------------------------------------------------- */
/* Calendar                                                                   */
/* -------------------------------------------------------------------------- */

interface DatePickerCalendarProps {
    value: unknown;
    onChange: (value: Date | null) => void;

    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;

    placeholder: string;
    disabled: boolean;
    readOnly: boolean;

    minDate?: Date;
    maxDate?: Date;

    format: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";

    error: boolean;
    inputClassName: string;
}

function DatePickerCalendar({
    value,
    onChange,
    open,
    setOpen,
    placeholder,
    disabled,
    readOnly,
    minDate,
    maxDate,
    format,
    error,
    inputClassName,
}: DatePickerCalendarProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const calendarRef = useRef<HTMLDivElement>(null);
    const selectedDate = parseDate(value);

    const [calendarDate, setCalendarDate] = useState(
        selectedDate || new Date()
    );

    const [view, setView] = useState<"calendar" | "month" | "year">(
        "calendar"
    );
    const [placement, setPlacement] = useState<"above" | "below">("below");

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const handleOpen = () => {
        if (disabled || readOnly) return;

        setOpen((previous) => !previous);
        setView("calendar");
    };

    useEffect(() => {
        if (!open) return;

        const handleOutsidePointerDown = (event: PointerEvent) => {
            const target = event.target as Node;

            if (!containerRef.current?.contains(target)) {
                setOpen(false);
            }
        };

        document.addEventListener("pointerdown", handleOutsidePointerDown);

        return () => {
            document.removeEventListener(
                "pointerdown",
                handleOutsidePointerDown,
            );
        };
    }, [open, setOpen]);

    useEffect(() => {
        if (!open) return;

        const updatePlacement = () => {
            const trigger = triggerRef.current;
            const calendar = calendarRef.current;

            if (!trigger || !calendar) return;

            const triggerRect = trigger.getBoundingClientRect();
            const calendarHeight = calendar.getBoundingClientRect().height;
            const spaceBelow = window.innerHeight - triggerRect.bottom;
            const spaceAbove = triggerRect.top;
            const shouldPlaceAbove =
                spaceBelow < calendarHeight + 8 && spaceAbove > spaceBelow;

            setPlacement((previous) => {
                const next = shouldPlaceAbove ? "above" : "below";
                return previous === next ? previous : next;
            });
        };

        const frame = window.requestAnimationFrame(updatePlacement);
        window.addEventListener("resize", updatePlacement);
        window.addEventListener("scroll", updatePlacement, true);

        return () => {
            window.cancelAnimationFrame(frame);
            window.removeEventListener("resize", updatePlacement);
            window.removeEventListener("scroll", updatePlacement, true);
        };
    }, [open, view]);

    const handleMonthSelect = (monthIndex: number) => {
        setCalendarDate(
            new Date(year, monthIndex, 1)
        );

        setView("calendar");
    };

    const handleYearSelect = (selectedYear: number) => {
        setCalendarDate(
            new Date(selectedYear, month, 1)
        );

        setView("calendar");
    };

    const handleSelectDate = (date: Date) => {
        if (minDate && isBefore(date, minDate)) return;
        if (maxDate && isAfter(date, maxDate)) return;

        onChange(date);
        setOpen(false);
        setView("calendar");
    };

    const previousMonth = () => {
        setCalendarDate(
            new Date(year, month - 1, 1)
        );
    };

    const nextMonth = () => {
        setCalendarDate(
            new Date(year, month + 1, 1)
        );
    };

    /* ---------------------------------------------------------------------- */
    /* Calendar Days                                                           */
    /* ---------------------------------------------------------------------- */

    const firstDay = new Date(
        year,
        month,
        1
    ).getDay();

    const daysInMonth = new Date(
        year,
        month + 1,
        0
    ).getDate();

    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        days.push(
            new Date(year, month, day)
        );
    }

    /* ---------------------------------------------------------------------- */
    /* Years                                                                   */
    /* ---------------------------------------------------------------------- */

    const currentYear = new Date().getFullYear();

    const minYear = minDate
        ? minDate.getFullYear()
        : currentYear - 50;

    const maxYear = maxDate
        ? maxDate.getFullYear()
        : currentYear + 10;

    const years = Array.from(
        { length: maxYear - minYear + 1 },
        (_, index) => maxYear - index
    );

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Input */}
            <button
                type="button"
                id={String(value)}
                ref={triggerRef}
                disabled={disabled || readOnly}
                onClick={handleOpen}
                className={`
          flex
          h-11
          w-full
          items-center
          justify-between
          rounded-md
          border
          px-3
          text-sm
          transition-colors
          focus:border-primary
            focus:ring-2
            focus:ring-primary/20
          hover:bg-accent
          disabled:cursor-not-allowed
          disabled:opacity-50
          ${error ? "border-red-500" : "border-input"}
          ${inputClassName}
        `}
            >
                <span
                    className={
                        selectedDate
                            ? "text-foreground"
                            : "text-muted-foreground"
                    }
                >
                    {selectedDate
                        ? formatDate(selectedDate, format)
                        : placeholder}
                </span>

                <CalendarDays
                    size={18}
                    className="text-muted-foreground"
                />
            </button>

            {/* Calendar popup */}
            {open && !disabled && !readOnly && (
                <div
                    ref={calendarRef}
                    className={`absolute left-0 z-50 w-[min(300px,calc(100vw-2rem))] rounded-lg border bg-background p-3 shadow-lg ${placement === "above"
                        ? "bottom-full mb-2"
                        : "top-full mt-2"
                        }`}
                >

                    {/* -------------------------------------------------------------- */}
                    {/* MONTH VIEW                                                     */}
                    {/* -------------------------------------------------------------- */}

                    {view === "month" && (
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-sm font-semibold">
                                    Select month
                                </span>

                                <button
                                    type="button"
                                    onClick={() => setView("calendar")}
                                    className="text-sm text-muted-foreground hover:text-foreground"
                                >
                                    Back
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                {MONTHS.map((monthName, index) => (
                                    <button
                                        key={monthName}
                                        type="button"
                                        onClick={() =>
                                            handleMonthSelect(index)
                                        }
                                        className={`
                      rounded-md
                      px-2
                      py-2
                      text-sm
                      hover:bg-accent
                      ${index === month
                                                ? "bg-primary text-primary-foreground hover:bg-primary"
                                                : ""
                                            }
                    `}
                                    >
                                        {monthName.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* -------------------------------------------------------------- */}
                    {/* YEAR VIEW                                                      */}
                    {/* -------------------------------------------------------------- */}

                    {view === "year" && (
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-sm font-semibold">
                                    Select year
                                </span>

                                <button
                                    type="button"
                                    onClick={() => setView("calendar")}
                                    className="text-sm text-muted-foreground hover:text-foreground"
                                >
                                    Back
                                </button>
                            </div>

                            <div className="max-h-[250px] overflow-y-auto">
                                <div className="grid grid-cols-3 gap-2">
                                    {years.map((yearValue) => (
                                        <button
                                            key={yearValue}
                                            type="button"
                                            onClick={() =>
                                                handleYearSelect(yearValue)
                                            }
                                            className={`
                        rounded-md
                        px-2
                        py-2
                        text-sm
                        hover:bg-accent
                        ${yearValue === year
                                                    ? "bg-primary text-primary-foreground hover:bg-primary"
                                                    : ""
                                                }
                      `}
                                        >
                                            {yearValue}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* -------------------------------------------------------------- */}
                    {/* CALENDAR VIEW                                                  */}
                    {/* -------------------------------------------------------------- */}

                    {view === "calendar" && (
                        <>
                            {/* Header */}
                            <div className="mb-3 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={previousMonth}
                                    className="rounded-md p-1.5 hover:bg-muted"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <div className="flex items-center gap-1">
                                    {/* Month */}
                                    <button
                                        type="button"
                                        onClick={() => setView("month")}
                                        className="rounded-md px-2 py-1 text-sm font-semibold hover:bg-muted"
                                    >
                                        {MONTHS[month]}
                                    </button>

                                    {/* Year */}
                                    <button
                                        type="button"
                                        onClick={() => setView("year")}
                                        className="rounded-md px-2 py-1 text-sm font-semibold hover:bg-muted"
                                    >
                                        {year}
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={nextMonth}
                                    className="rounded-md p-1.5 hover:bg-muted"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            {/* Week days */}
                            <div className="mb-1 grid grid-cols-7">
                                {WEEK_DAYS.map((day) => (
                                    <div
                                        key={day}
                                        className="py-1 text-center text-xs font-medium text-muted-foreground"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Days */}
                            <div className="grid grid-cols-7 gap-1">
                                {days.map((date, index) => {
                                    if (!date) {
                                        return (
                                            <div
                                                key={`empty-${index}`}
                                            />
                                        );
                                    }

                                    const selected =
                                        selectedDate &&
                                        isSameDate(
                                            date,
                                            selectedDate
                                        );

                                    const disabledDate =
                                        (minDate &&
                                            isBefore(
                                                date,
                                                minDate
                                            )) ||
                                        (maxDate &&
                                            isAfter(
                                                date,
                                                maxDate
                                            ));

                                    return (
                                        <button
                                            key={date.toISOString()}
                                            type="button"
                                            disabled={!!disabledDate}
                                            onClick={() =>
                                                handleSelectDate(date)
                                            }
                                            className={`
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-md
                        text-sm
                        hover:bg-accent
                        disabled:cursor-not-allowed
                        disabled:opacity-30
                        ${selected
                                                    ? "bg-primary text-primary-foreground hover:bg-primary"
                                                    : ""
                                                }
                      `}
                                        >
                                            {date.getDate()}
                                        </button>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
