import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ network: string; collateralId: string }>
}

export default async function CrvUsdManageRedirect({ params }: Props) {
  const { network, collateralId } = await params
  redirect(`/llamalend/${network}/mint-markets/${collateralId}/manage`)
}
