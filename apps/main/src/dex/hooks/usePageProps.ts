import { type CurveApi, PageProps } from '@/dex/types/main.types'
import { useParsedParams } from '@/dex/utils/utilsRouter'
import { isLoading, useConnection } from '@ui-kit/features/connect-wallet'

export function usePageProps(chainIdNotRequired?: boolean): PageProps {
  const { lib: curve = null, connectState } = useConnection<CurveApi>()
  return {
    pageLoaded: !isLoading(connectState),
    routerParams: useParsedParams(chainIdNotRequired),
    curve,
  }
}
