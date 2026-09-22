import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export const passwordRequirements = [
  "At least 8 characters long",
  "At least one uppercase letter (A-Z)",
  "At least one lowercase letter (a-z)",
  "At least one number (0-9)",
  "At least one special character (! @ # $ % ^ & *)",
] as const;

export const loginSchema = z.object({
  email: z
    .string()
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /[A-Z]/,
      "Password must contain at least one uppercase letter"
    )
    .regex(
      /[a-z]/,
      "Password must contain at least one lowercase letter"
    )
    .regex(
      /[0-9]/,
      "Password must contain at least one number"
    )
    .regex(
      /[!@#$%^&*]/,
      "Password must contain at least one special character (! @ # $ % ^ & *)"
    ),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const otpSchema = z.object({
  code: z.string().regex(/^\d{4}$/, "Enter the 4-digit verification code"),
});
export type OtpFormValues = z.infer<typeof otpSchema>;

const resetPasswordValue = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a special character");

export const resetPasswordSchema = z
  .object({
    password: resetPasswordValue,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: z.string().trim().email("Enter a valid email address"),
    country: z.string().min(1, "Country is required"),
    phoneDialingCode: z.string().min(1, "Dialing code is required"),
    phoneCountry: z.string().min(1, "Phone country is required"),
    mobileNumber: z.string().trim().regex(/^\d+$/, "Enter a valid phone number"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[0-9]/, "Password must contain a number")
      .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    gender: z.string().min(1, "Please select a gender"),
    dob: z.union([z.date(), z.string()]).refine(
      (value) => value instanceof Date || value.length > 0,
      "Date of birth is required",
    ),
    termsAccepted: z.boolean().refine((value) => value, "Please accept the Terms & Conditions"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .superRefine((data, context) => {
    const dialingCode = data.phoneDialingCode.trim();
    const mobileNumber = data.mobileNumber.trim();
    const normalizedNumber = mobileNumber.replace(/^0+/, "");
    const phone = `${dialingCode}${normalizedNumber}`;
    const parsedPhone = parsePhoneNumberFromString(phone);
    const isIndiaNumber = dialingCode === "+91";
    const hasValidIndiaMobilePattern = !isIndiaNumber || (/^[6-9]\d{9}$/.test(mobileNumber));
    const isValidForSelectedDialingCode = Boolean(
      parsedPhone?.isValid() && parsedPhone.countryCallingCode === dialingCode.slice(1),
    );

    if (!hasValidIndiaMobilePattern || !isValidForSelectedDialingCode) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a valid phone number for the selected country", path: ["mobileNumber"] });
    }
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const relationshipDetailsSchema = z.object({
  relationStatusId: z.string().optional(),
  summary: z.string().trim().min(1, "Short summary is required").refine((value) => value.split(/\s+/).length <= 100, "Summary must be 100 words or fewer"),
  loveLanguages: z.array(z.string()).min(1, "Select at least one love language").max(3, "You can select up to 3 love languages."),
  profileImage: z.string().optional(),
});
export type RelationshipDetailsFormValues = z.infer<typeof relationshipDetailsSchema>;

const accountDateSchema = z.preprocess(
  (value) =>
    value instanceof Date
      ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
      : value,
  z.string().min(1, "Date of birth is required"),
);

export const accountPersonalSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    gender: z.string().min(1, "Please select a gender"),
    dob: accountDateSchema,
    country: z.string().trim().min(1, "Country is required"),
    phoneDialingCode: z.string().trim().min(1, "Dialing code is required"),
    phoneCountry: z.string().trim().min(1, "Phone country is required"),
    mobileNumber: z.string().trim().regex(/^\d+$/, "Enter a valid phone number"),
    email: z.string().optional(),
  })
  .superRefine((data, context) => {
    const dialingCode = data.phoneDialingCode.trim();
    const mobileNumber = data.mobileNumber.trim().replace(/^0+/, "");
    const parsedPhone = parsePhoneNumberFromString(`${dialingCode}${mobileNumber}`);
    const isValidForSelectedCode = Boolean(
      parsedPhone?.isValid() &&
      parsedPhone.countryCallingCode === dialingCode.replace("+", ""),
    );

    if (!isValidForSelectedCode) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid phone number for the selected country",
        path: ["mobileNumber"],
      });
    }
  });
export type AccountPersonalFormValues = z.infer<typeof accountPersonalSchema>;

export const accountRelationshipSchema = relationshipDetailsSchema;
export type AccountRelationshipFormValues = z.infer<typeof accountRelationshipSchema>;

export const createUnionSchema = z.object({
  relationStatusId: z.string().min(1, "Relationship type is required"),
  date: z.preprocess(
    (value) =>
      value instanceof Date
        ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
        : value,
    z.string().min(1, "Relationship start date is required"),
  ),
  hasChildren: z.boolean(),
  children: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.hasChildren && (!data.children || !/^\d{1,2}$/.test(data.children) || Number(data.children) < 1)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["children"], message: "Enter the number of children" });
  }
});
export type CreateUnionFormValues = z.infer<typeof createUnionSchema>;

export const joinUnionSchema = z.object({
  unionCode: z.string().regex(/^\d{6,}$/, "Enter a valid union code"),
});
export type JoinUnionFormValues = z.infer<typeof joinUnionSchema>;

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required"),
  description: z.string().trim().min(1, "Description is required"),
  assignedTo: z.enum(["me", "partner"], {
    required_error: "Please select an assignee",
  }),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Please select a priority",
  }),
  dueDate: z.preprocess(
    (value) =>
      value instanceof Date
        ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
        : value,
    z.string().min(1, "Due date is required"),
  ),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
