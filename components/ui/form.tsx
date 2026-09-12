"use client";

import * as React from "react";
import { Controller, ControllerProps, Control, FieldPath, FieldValues, useFormContext, UseFormReturn, FormProvider } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FormProps<TFieldValues extends FieldValues>
  extends React.FormHTMLAttributes<HTMLFormElement> {
  form: UseFormReturn<TFieldValues>;
}

const Form = <TFieldValues extends FieldValues>({
  form,
  className,
  ...props
}: FormProps<TFieldValues>) => {
  return (
    <FormProvider {...form}>
      <form className={cn(className)} {...props} />
    </FormProvider>
  );
};

Form.displayName = "Form";

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName;
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

interface FormFieldProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>
  extends ControllerProps<TFieldValues, TName> {
  control: Control<TFieldValues, any, TFieldValues>;
}

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  render,
  ...props
}: FormFieldProps<TFieldValues, TName>) => {
  return (
    <Controller
      control={control}
      name={name}
      {...props}
      render={(field) => (
        <FormFieldContext.Provider value={{ name }}>
          {render(field)}
        </FormFieldContext.Provider>
      )}
    />
  );
};
FormField.displayName = "FormField";

interface FormItemContextValue {
  id: string;
}

const FormItemContext = React.createContext<FormItemContextValue | null>(null);

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {
}

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => {
    const id = React.useId();
    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
      </FormItemContext.Provider>
    );
  }
);
FormItem.displayName = "FormItem";

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, ...props }, ref) => {
    const context = React.useContext(FormItemContext);
    if (!context) {
      throw new Error("FormLabel must be used within FormItem");
    }
    const { id } = context;
    return (
      <Label ref={ref} className={cn("peer", className)} htmlFor={id} {...props} />
    );
  }
);
FormLabel.displayName = "FormLabel";

interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const context = React.useContext(FormItemContext);
    if (!context) {
      throw new Error("FormControl must be used within FormItem");
    }
    const { id } = context;
    const fieldContext = React.useContext(FormFieldContext);
    if (!fieldContext) {
      throw new Error("FormControl must be used within FormField");
    }
    const composedRef = React.useRef<HTMLDivElement | null>(null);
    const setRef = (node: HTMLDivElement | null) => {
      composedRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };
    if (asChild) {
      return (
        <div ref={setRef} id={id} className={cn("", className)} {...props} />
      );
    }
    return (
      <div ref={setRef} id={id} className={cn("", className)} {...props} />
    );
  }
);
FormControl.displayName = "FormControl";

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, ...props }, ref) => {
    const itemContext = React.useContext(FormItemContext);
    if (!itemContext) {
      throw new Error("FormMessage must be used within FormItem");
    }
    const { id } = itemContext;
    const fieldContext = React.useContext(FormFieldContext);
    const { formState } = useFormContext();
    const name = fieldContext?.name;
    const error = name ? formState.errors[name as keyof typeof formState.errors] : undefined;
    const message = typeof error?.message === "string" ? error.message : children;
    if (!message) return null;
    return (
      <p
        ref={ref}
        id={`${id}-message`}
        className={cn("text-sm text-destructive", className)}
        {...props}
      >
        {message}
      </p>
    );
  }
);
FormMessage.displayName = "FormMessage";

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
};