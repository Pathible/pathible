/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDialogState } from "../use-dialog-state";

describe("useDialogState", () => {
  it("should initialize as closed by default", () => {
    const { result } = renderHook(() => useDialogState());
    expect(result.current.isOpen).toBe(false);
  });

  it("should initialize with custom initial state", () => {
    const { result } = renderHook(() => useDialogState(true));
    expect(result.current.isOpen).toBe(true);
  });

  it("should open the dialog", () => {
    const { result } = renderHook(() => useDialogState());

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it("should close the dialog", () => {
    const { result } = renderHook(() => useDialogState(true));

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it("should toggle the dialog state", () => {
    const { result } = renderHook(() => useDialogState());

    // Toggle from closed to open
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);

    // Toggle from open to closed
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("should allow direct state control via setIsOpen", () => {
    const { result } = renderHook(() => useDialogState());

    act(() => {
      result.current.setIsOpen(true);
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.setIsOpen(false);
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("should maintain stable function references", () => {
    const { result, rerender } = renderHook(() => useDialogState());

    const { open: openRef1, close: closeRef1, toggle: toggleRef1 } = result.current;

    rerender();

    const { open: openRef2, close: closeRef2, toggle: toggleRef2 } = result.current;

    // Functions should be memoized and stable across re-renders
    expect(openRef1).toBe(openRef2);
    expect(closeRef1).toBe(closeRef2);
    expect(toggleRef1).toBe(toggleRef2);
  });
});
