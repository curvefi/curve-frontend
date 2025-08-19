'use client'
import { useEffect } from 'react'
import { styled } from 'styled-components'
import { useAccount } from 'wagmi'
import FormCrvLocker from '@/dao/components/PageVeCrv/index'
import type { FormType } from '@/dao/components/PageVeCrv/types'
import { useLockerVecrvInfo } from '@/dao/entities/locker-vecrv-info'
import Settings from '@/dao/layout/Settings'
import { networksIdMapper } from '@/dao/networks'
import useStore from '@/dao/store/useStore'
import { type VeCrvUrlParams } from '@/dao/types/dao.types'
import Box, { BoxHeader } from '@ui/Box'
import IconButton from '@ui/IconButton'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import { isLoading, useConnection } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { WrongNetwork } from './WrongNetwork'

export const PageVeCrv = ({ formType: rFormType, network }: VeCrvUrlParams) => {
  const { curveApi = null, connectState } = useConnection()
  const rChainId = networksIdMapper[network]
  const isLoadingCurve = isLoading(connectState)

  const { address: userAddress } = useAccount()

  const { data: vecrvInfo } = useLockerVecrvInfo({ chainId: curveApi?.chainId, userAddress })
  const resetState = useStore((state) => state.lockedCrv.resetState)

  // onMount
  useEffect(
    () => () => resetState(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <>
      <Container variant="primary" shadowed>
        <BoxHeader className="title-text">
          <IconButton hidden />
          {t`CRV Locker`}
          <IconButton hidden />
        </BoxHeader>

        {rChainId === 1 ? (
          <Content grid gridRowGap={3} padding>
            {rChainId && rFormType && vecrvInfo && !isLoadingCurve ? (
              <FormCrvLocker
                curve={curveApi}
                rChainId={rChainId}
                rFormType={rFormType as FormType}
                vecrvInfo={vecrvInfo}
              />
            ) : (
              <SpinnerWrapper>
                <Spinner />
              </SpinnerWrapper>
            )}
          </Content>
        ) : (
          <WrongNetwork />
        )}
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
`
