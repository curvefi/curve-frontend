import { useCallback, useState } from 'react'

export function useSwitch<T extends boolean | undefined>(defaultValue?: T) {
  const [isOpen, setIsOpen] = useState<T | boolean>(defaultValue as T)
  const open = useCallback(() => setIsOpen(true), [setIsOpen])
  const close = useCallback(() => setIsOpen(false), [setIsOpen])
  const toggle = useCallback(() => setIsOpen((v) => !v), [setIsOpen])
  return [isOpen, open, close, toggle, setIsOpen] as const
}
