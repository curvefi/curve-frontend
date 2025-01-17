import type { NextPage } from 'next'
import type { EtherContract } from '@main/components/PageCompensation/types'

import { Contract, Interface } from 'ethers'
import { t } from '@lingui/macro'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import { scrollToTop } from '@main/utils'
import usePageOnMount from '@main/hooks/usePageOnMount'
import useStore from '@main/store/useStore'

import Box, { BoxHeader } from '@ui/Box'
import Button from '@ui/Button'
import DocumentHead from '@main/layout/default/DocumentHead'
import ExternalLink from '@ui/Link/ExternalLink'
import FormCompensation from '@main/components/PageCompensation/index'
import IconButton from '@ui/IconButton'
import Settings from '@main/layout/default/Settings'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import { Provider } from '@main/types/main.types'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { pageLoaded, routerParams, curve } = usePageOnMount(params, location, navigate)
  const { rChainId } = routerParams

  const getProvider = useStore((state) => state.wallet.getProvider)
  const updateConnectWalletStateKeys = useStore((state) => state.wallet.updateConnectWalletStateKeys)

  const [provider, setProvider] = useState<Provider>()
  const [contracts, setContracts] = useState<EtherContract[]>([])

  const fetchData = useCallback(async (provider: Provider) => {
    const signer = await provider.getSigner()
    const contracts = await import('@main/components/PageCompensation/abis').then((modules) =>
      Object.entries(modules).map(([, { contractAddress, abi, ...rest }]) => {
        const iface = new Interface(abi)
        const contract = new Contract(contractAddress, iface.format(), signer)
        return { ...rest, contractAddress, contract }
      }),
    )
    setContracts(contracts)
  }, [])

  // onMount
  useEffect(() => {
    scrollToTop()
  }, [])

  // get initial data
  useEffect(() => {
    if (!pageLoaded) return

    const provider = getProvider('')

    if (provider) {
      setProvider(provider)
      fetchData(provider)
    }
  }, [fetchData, getProvider, pageLoaded])

  return (
    <>
      <DocumentHead title={t`Compensation`} />
      <Container variant="primary" shadowed>
        <BoxHeader className="title-text">
          <IconButton hidden />
          {t`Compensation`}
          <IconButton hidden />
        </BoxHeader>

        <Content grid gridRowGap={3} padding>
          {rChainId !== 1 ? (
            <strong>
              <i>Claimable compensation is only available on Ethereum network.</i>
            </strong>
          ) : !provider ? (
            <>
              <strong>Please connect your wallet to view compensation</strong>
              <Button
                fillWidth
                loading={!pageLoaded}
                size="large"
                variant="filled"
                onClick={updateConnectWalletStateKeys}
              >
                {t`Connect Wallet`}
              </Button>
            </>
          ) : !rChainId || contracts.length === 0 ? (
            <SpinnerWrapper>
              <Spinner />
            </SpinnerWrapper>
          ) : (
            <FormCompensation curve={curve} rChainId={rChainId} contracts={contracts} provider={provider} />
          )}
          <i>
            For additional information, please see{' '}
            <ExternalLink $noStyles href="https://github.com/curvefi/vest-split/?tab=readme-ov-file#deployed-splitters">
              Github
            </ExternalLink>{' '}
            or{' '}
            <ExternalLink
              $noStyles
              href="https://gov.curve.fi/t/proposal-to-recompensate-lps-affected-by-curve-pool-exploit/9825"
            >
              gov.curve.fi
            </ExternalLink>
          </i>
          <i>
            Please note: wETH and alETH are distributed immediately, whereas CRV (from the community fund) will be
            vested or distributed linearly over a one-year period.
          </i>
        </Content>
      </Container>
      <Settings showScrollButton />
    </>
  )
}

const Container = styled(Box)`
  margin: 1.5rem auto;
  max-width: var(--transfer-min-width);
  width: 100%;
`

const Content = styled(Box)`
  align-content: flex-start;
  min-height: 14.8125rem; //237px
`

export default Page
