import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ network: string; market: string }>
}

export default async function LendManageRedirect({ params }: Props) {
  const { network, market } = await params
  redirect(`/llamalend/${network}/lend-markets/${market}/manage`)
}
