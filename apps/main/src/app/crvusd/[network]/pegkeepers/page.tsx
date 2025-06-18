import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ network: string }>
}

export default async function PegKeepersRedirect({ params }: Props) {
  const { network } = await params
  redirect(`/llamalend/${network}/pegkeepers`)
}
