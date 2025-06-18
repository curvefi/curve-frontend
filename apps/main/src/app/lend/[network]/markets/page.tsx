import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ network: string }>
}

export default async function LendMarketsRedirect({ params }: Props) {
  const { network } = await params
  redirect(`/llamalend/${network}/lend-markets`)
}
