import type { NextPage } from 'next'

import { t } from '@lingui/macro'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'

import { ROUTE } from '@/constants'
import { breakpoints } from '@/ui/utils'
import { getPath } from '@/utils/utilsRouter'
import { scrollToTop } from '@/utils'
import networks from '@/networks'
import usePageOnMount from '@/hooks/usePageOnMount'
import useStore from '@/store/useStore'
import useTokensMapper from '@/hooks/useTokensMapper'

import AdvancedSettings from '@/components/AdvancedSettings'
import Box, { BoxHeader } from '@/ui/Box'
import DocumentHead from '@/layout/default/DocumentHead'
import IconButton from '@/ui/IconButton'
import QuickSwap from '@/components/PageRouterSwap/index'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { pageLoaded, routerParams } = usePageOnMount(params, location, navigate)
  const { rChainId } = routerParams

  const getNetworkConfigFromApi = useStore((state) => state.getNetworkConfigFromApi)
  const isLoadingCurve = useStore((state) => state.isLoadingCurve)
  const maxSlippage = useStore((state) => state.maxSlippage)
  const routerCached = useStore((state) => state.storeCache.routerFormValues[rChainId])
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)
  const { tokensMapper, tokensMapperStr } = useTokensMapper(rChainId)

  const [loaded, setLoaded] = useState(false)

  const { hasRouter } = getNetworkConfigFromApi(rChainId)
  const paramsFromAddress = searchParams.get('from')?.toLowerCase() || ''
  const paramsToAddress = searchParams.get('to')?.toLowerCase() || ''
  const paramsMaxSlippage = searchParams.get('slippage')

  const redirect = useCallback(
    (toAddress: string, fromAddress: string) => {
      let pathname = ''
      if (fromAddress && toAddress) {
        pathname += `?from=${fromAddress}&to=${toAddress}`
      } else if (fromAddress) {
        pathname += `?from=${fromAddress}`
      } else if (toAddress) {
        pathname += `?to=${toAddress}`
      }
      if (pathname && pathname !== location.search) {
        navigate(getPath(params, `${ROUTE.PAGE_SWAP}${pathname}`))
      }
    },
    [location.search, navigate, params]
  )

  useEffect(() => {
    scrollToTop()
  }, [])

  // redirect to poolList if Swap is excluded from route
  useEffect(() => {
    setLoaded(false)
    if (pageLoaded && !isLoadingCurve && rChainId && typeof hasRouter !== 'undefined') {
      if (!hasRouter) {
        navigate(getPath(params, `${ROUTE.PAGE_POOLS}`))
      } else {
        if (paramsMaxSlippage) {
          updateGlobalStoreByKey('maxSlippage', paramsMaxSlippage)
        }

        const routerDefault = networks[rChainId].swap
        if (Object.keys(tokensMapper).length && !!routerDefault) {
          const isValidParamsFromAddress = !!paramsFromAddress && !!tokensMapper[paramsFromAddress]
          const isValidParamsToAddress = !!paramsToAddress && !!tokensMapper[paramsToAddress]

          if (
            !paramsFromAddress ||
            !paramsToAddress ||
            !isValidParamsFromAddress ||
            !isValidParamsToAddress ||
            paramsToAddress === paramsFromAddress
          ) {
            const fromAddress = routerCached?.fromAddress ?? routerDefault.fromAddress
            const toAddress = routerCached?.toAddress ?? routerDefault.toAddress
            if (!!toAddress && !!fromAddress) redirect(toAddress, fromAddress)
          } else {
            setLoaded(true)
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pageLoaded,
    isLoadingCurve,
    hasRouter,
    paramsFromAddress,
    paramsToAddress,
    paramsMaxSlippage,
    rChainId,
    tokensMapperStr,
    routerCached?.fromAddress,
    routerCached?.toAddress,
  ])

  return (
    <>
      <DocumentHead title={t`Swap`} />
      <StyledQuickSwapWrapper variant="primary" shadowed>
        <BoxHeader className="title-text">
          <IconButton testId="hidden" hidden />
          {t`Swap`}
          <AdvancedSettings testId="advance-settings" maxSlippage={maxSlippage} />
        </BoxHeader>

        <Box grid gridRowGap={3} padding>
          {rChainId && (
            <QuickSwap
              pageLoaded={loaded}
              params={params}
              searchedParams={{
                fromAddress: paramsFromAddress,
                toAddress: paramsToAddress,
              }}
              rChainId={rChainId}
              tokensMapper={tokensMapper}
              tokensMapperStr={tokensMapperStr}
              redirect={redirect}
            />
          )}
        </Box>
      </StyledQuickSwapWrapper>
    </>
  )
}

const StyledQuickSwapWrapper = styled(Box)`
  margin-top: 1rem;
  width: 100%;

  @media (min-width: ${breakpoints.sm}rem) {
    margin: 1.5rem auto;
    max-width: var(--transfer-min-width);
  }
`

export default Page
