import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  params: Promise<{ network: string }>
}

export default async function NetworkLayout({ children }: Props) {
  // Network validation is handled by the client component
  return <>{children}</>
}
