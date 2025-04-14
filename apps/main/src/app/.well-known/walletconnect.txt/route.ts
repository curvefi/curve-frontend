import { headers } from 'next/headers'
import { getVercelDomainVerification } from '@ui-kit/features/connect-wallet/lib/utils/walletModules'

export const GET = async () => {
  const head = await headers()
  const host = head.get('host')
  return new Response(getVercelDomainVerification(host))
}
