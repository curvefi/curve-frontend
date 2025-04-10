import { headers } from 'next/headers'
import {
  CURVE_DOMAIN_VERIFICATION,
  VERCEL_DOMAIN_VERIFICATION,
  WALLET_CONNECT_ACCOUNT,
} from '@ui-kit/features/connect-wallet/lib/utils/walletModules'

export const GET = async () => {
  const head = await headers()
  const host = head.get('host')
  return new Response(
    [WALLET_CONNECT_ACCOUNT, host.endsWith('vercel.app') ? VERCEL_DOMAIN_VERIFICATION : CURVE_DOMAIN_VERIFICATION].join(
      '=',
    ),
  )
}
