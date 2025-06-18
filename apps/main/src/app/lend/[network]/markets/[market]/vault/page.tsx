import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ network: string; market: string }>
}

export default async function LendVaultRedirect({ params }: Props) {
  const { network, market } = await params
  redirect(`/llamalend/${network}/lend-markets/${market}/vault`)
}
