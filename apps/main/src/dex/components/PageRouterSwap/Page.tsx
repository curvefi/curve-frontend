import { useCallback, useEffect, useMemo, useState } from 'react'
import { QuickSwap } from '@/dex/components/PageRouterSwap/index'
import { ROUTE } from '@/dex/constants'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useChainId } from '@/dex/hooks/useChainId'
import { getToken, useTokens } from '@/dex/queries/tokens.query'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import { isLoading, useCurve } from '@evm-ui/features/connect-wallet'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import { PAGE_BLOCK_MARGIN } from '@ui/features/layout/constants'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useNavigate, useSearchParams, useParams } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'

const { MaxWidth } = SizesAndSpaces

export const PageRouterSwap = () => {
  const props = useParams<NetworkUrlParams>()
  const push = useNavigate()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams?.toString() || ''
  const { curveApi = null, connectState } = useCurve()
  const chainId = useChainId(props.network)
  const isConnecting = isLoading(connectState)

  const { data: network } = useNetworkByChain({ chainId })

  const [loaded, setLoaded] = useState(false)

  const hasRouter = curveApi?.hasRouter()
  const nativeToken = curveApi?.getNetworkConstants()?.NATIVE_TOKEN
  const paramsFromAddress = searchParams?.get('from')?.toLowerCase() || nativeToken?.address || ''
  const paramsToAddress = searchParams?.get('to')?.toLowerCase() || nativeToken?.wrappedAddress || ''

  const { data: tokens } = useTokens({ chainId })

  const searchedParams = useMemo(
    () => ({ fromAddress: paramsFromAddress, toAddress: paramsToAddress }),
    [paramsFromAddress, paramsToAddress],
  )

  const redirect = useCallback(
    (to: string, from: string) => {
      const search = from || to ? `?${new URLSearchParams({ ...(from && { from }), ...(to && { to }) })}` : ''
      if (search !== searchParamsString) {
        push(search)
      }
    },
    [searchParamsString, push],
  )

  // redirect to poolList if Swap is excluded from route
  useEffect(() => {
    // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
    setLoaded(false)
    if (!isConnecting && chainId && hasRouter != null) {
      if (!hasRouter) {
        push(getPath(props, `${ROUTE.PAGE_POOLS}`))
        return
      }

      const routerDefault = network.swap
      if (routerDefault && tokens) {
        const fromToken = getToken(tokens, paramsFromAddress)
        const toToken = getToken(tokens, paramsToAddress)
        if (!fromToken || !toToken || paramsToAddress === paramsFromAddress) {
          const fromAddress = routerDefault.fromAddress
          const toAddress = routerDefault.toAddress
          if (!!toAddress && !!fromAddress) redirect(toAddress, fromAddress)
        } else {
          // eslint-disable-next-line @eslint-react/set-state-in-effect -- Existing violation before enabling this rule.
          setLoaded(true)
        }
      }
    }
  }, [
    isConnecting,
    hasRouter,
    paramsFromAddress,
    paramsToAddress,
    chainId,
    tokens,
    network.swap,
    push,
    props,
    redirect,
  ])
  return (
    <Card
      size="small"
      sx={{ ...PAGE_BLOCK_MARGIN, maxWidth: MaxWidth.actionCard, marginInline: 'auto' }}
      data-testid="swap-page"
    >
      <CardHeader title={t`Swap`} />
      <CardContent>
        {chainId && (
          <QuickSwap
            curve={curveApi}
            pageLoaded={loaded}
            params={props}
            searchedParams={searchedParams}
            rChainId={chainId}
            redirect={redirect}
          />
        )}
      </CardContent>
    </Card>
  )
}
