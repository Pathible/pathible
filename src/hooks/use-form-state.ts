import { useCallback, useState } from "react";

/**
 * Hook for managing form field state with reset capability
 *
 * @example
 * const form = useFormState({
 *   name: "",
 *   email: "",
 *   role: "viewer" as const,
 * });
 *
 * // In JSX:
 * <Input
 *   value={form.values.name}
 *   onChange={(e) => form.setField("name", e.target.value)}
 * />
 *
 * // On submit success:
 * form.reset();
 */
export function useFormState<T extends Record<string, unknown>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFields = useCallback((updates: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setIsSubmitting(false);
  }, [initialValues]);

  const getInputProps = useCallback(
    (field: keyof T) => ({
      value: values[field] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setField(field, e.target.value as T[typeof field]),
    }),
    [values, setField],
  );

  return {
    values,
    setValues,
    setField,
    setFields,
    reset,
    isSubmitting,
    setIsSubmitting,
    getInputProps,
  };
}

export type FormState<T extends Record<string, unknown>> = ReturnType<typeof useFormState<T>>;
