import { useCallback, useState } from "react";

/**
 * Hook for managing dialog open/close state
 *
 * @example
 * const addDialog = useDialogState();
 * // ...
 * <Button onClick={addDialog.open}>Add Item</Button>
 * <Dialog open={addDialog.isOpen} onOpenChange={addDialog.setIsOpen}>
 *   ...
 *   <Button onClick={addDialog.close}>Cancel</Button>
 * </Dialog>
 */
export function useDialogState(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    setIsOpen,
    open,
    close,
    toggle,
  };
}

export type DialogState = ReturnType<typeof useDialogState>;
