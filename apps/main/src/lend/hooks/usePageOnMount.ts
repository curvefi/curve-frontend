import { useParams } from 'next/navigation'
import { type Api, PageProps, type UrlParams } from '@/lend/types/lend.types'
import { parseParams } from '@/lend/utils/utilsRouter'
import { isLoading, useConnection } from '@ui-kit/features/connect-wallet'

export function usePageOnMount(chainIdNotRequired?: boolean): PageProps {
  const params = useParams() as UrlParams
  const { lib: api, connectState } = useConnection<Api>()
  return {
    pageLoaded: !isLoading(connectState),
    routerParams: parseParams(params, chainIdNotRequired),
    api,
  }
}
