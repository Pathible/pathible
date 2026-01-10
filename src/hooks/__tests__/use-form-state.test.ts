/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useFormState } from "../use-form-state";

describe("useFormState", () => {
  const initialValues = {
    name: "",
    email: "",
    age: 0,
  };

  it("should initialize with provided values", () => {
    const { result } = renderHook(() => useFormState(initialValues));

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should update individual fields with setField", () => {
    const { result } = renderHook(() => useFormState(initialValues));

    act(() => {
      result.current.setField("name", "John");
    });

    expect(result.current.values.name).toBe("John");
    expect(result.current.values.email).toBe(""); // Other fields unchanged
    expect(result.current.values.age).toBe(0);
  });

  it("should update multiple fields with setFields", () => {
    const { result } = renderHook(() => useFormState(initialValues));

    act(() => {
      result.current.setFields({ name: "John", email: "john@example.com" });
    });

    expect(result.current.values.name).toBe("John");
    expect(result.current.values.email).toBe("john@example.com");
    expect(result.current.values.age).toBe(0); // Unchanged field
  });

  it("should reset to initial values", () => {
    const { result } = renderHook(() => useFormState(initialValues));

    // Modify some fields
    act(() => {
      result.current.setField("name", "John");
      result.current.setField("email", "john@example.com");
      result.current.setIsSubmitting(true);
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.isSubmitting).toBe(false);
  });

  it("should update isSubmitting state", () => {
    const { result } = renderHook(() => useFormState(initialValues));

    expect(result.current.isSubmitting).toBe(false);

    act(() => {
      result.current.setIsSubmitting(true);
    });

    expect(result.current.isSubmitting).toBe(true);
  });

  it("should allow direct values update with setValues", () => {
    const { result } = renderHook(() => useFormState(initialValues));

    const newValues = { name: "Jane", email: "jane@example.com", age: 30 };

    act(() => {
      result.current.setValues(newValues);
    });

    expect(result.current.values).toEqual(newValues);
  });

  it("should provide getInputProps for form binding", () => {
    const { result } = renderHook(() => useFormState({ name: "Initial" }));

    const inputProps = result.current.getInputProps("name");

    expect(inputProps.value).toBe("Initial");
    expect(typeof inputProps.onChange).toBe("function");
  });

  it("should update value when using getInputProps onChange", () => {
    const { result } = renderHook(() => useFormState({ name: "" }));

    const mockEvent = {
      target: { value: "New Value" },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.getInputProps("name").onChange(mockEvent);
    });

    expect(result.current.values.name).toBe("New Value");
  });

  it("should maintain stable function references for setField", () => {
    const { result, rerender } = renderHook(() => useFormState(initialValues));

    const setFieldRef1 = result.current.setField;

    rerender();

    const setFieldRef2 = result.current.setField;

    // setField should be memoized
    expect(setFieldRef1).toBe(setFieldRef2);
  });

  it("should work with different value types", () => {
    const complexValues = {
      text: "hello",
      number: 42,
      boolean: true,
      nullable: null as string | null,
    };

    const { result } = renderHook(() => useFormState(complexValues));

    expect(result.current.values).toEqual(complexValues);

    act(() => {
      result.current.setField("number", 100);
      result.current.setField("boolean", false);
      result.current.setField("nullable", "not null");
    });

    expect(result.current.values.number).toBe(100);
    expect(result.current.values.boolean).toBe(false);
    expect(result.current.values.nullable).toBe("not null");
  });
});
