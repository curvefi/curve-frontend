import type { LlamalendServerData } from '@/app/api/llamalend/types'
import { getServerData } from '@/background'
import { LlamaMarketsPage } from '@/llamalend/PageLlamaMarkets/Page'
import type { ClientLoaderFunctionArgs } from '@ui-kit/hooks'
import { useLoaderData } from '@ui-kit/hooks'

export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const isCypress = document.cookie.includes('cypress')
  if (isCypress) {
    return {}
  }

  // Convert request headers to the format expected by getServerData
  const headers = new Headers(request.headers)
  const serverData = await getServerData<LlamalendServerData>('llamalend', headers as any)
  return serverData
}

export default function Component() {
  const serverData = useLoaderData() as LlamalendServerData
  return <LlamaMarketsPage {...serverData} />
}
