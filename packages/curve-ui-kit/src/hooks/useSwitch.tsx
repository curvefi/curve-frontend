import { useCallback, useState } from 'react'

export function useSwitch(defaultValue?: boolean) {
  const [isOpen, setIsOpen] = useState(defaultValue);
  const open = useCallback(() => setIsOpen(true), [setIsOpen]);
  const close = useCallback(() => setIsOpen(false), [setIsOpen]);
  const toggle = useCallback(() => setIsOpen(v => !v), [setIsOpen]);
  return [isOpen, open, close, toggle] as const;
}
