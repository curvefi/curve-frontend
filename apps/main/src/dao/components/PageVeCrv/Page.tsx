'use client'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import FormCrvLocker from '@/dao/components/PageVeCrv/index'
import type { FormType } from '@/dao/components/PageVeCrv/types'
import { ROUTE } from '@/dao/constants'
import { useLockerVecrvInfo } from '@/dao/entities/locker-vecrv-info'
import { usePageOnMount } from '@/dao/hooks/usePageOnMount'
import Settings from '@/dao/layout/Settings'
import useStore from '@/dao/store/useStore'
import { CurveApi, type VeCrvUrlParams } from '@/dao/types/dao.types'
import { getPath } from '@/dao/utils/utilsRouter'
import type { Address } from '@curvefi/prices-api'
import Box, { BoxHeader } from '@ui/Box'
import IconButton from '@ui/IconButton'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import { isLoading, useConnection } from '@ui-kit/features/connect-wallet'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { WrongNetwork } from './WrongNetwork'

const Page = (params: VeCrvUrlParams) => {
  const [rFormType] = params.formType
  const { push } = useRouter()
  const { routerParams, curve } = usePageOnMount()
  const { rChainId } = routerParams

  const { connectState } = useConnection<CurveApi>()
  const isLoadingCurve = isLoading(connectState)

  const { signerAddress } = useWallet()
  const { data: vecrvInfo } = useLockerVecrvInfo({ chainId: rChainId, walletAddress: signerAddress as Address })
  const resetState = useStore((state) => state.lockedCrv.resetState)

  const toggleForm = useCallback(
    (formType: FormType) => push(getPath(params, `${ROUTE.PAGE_VECRV}/${formType}`)),
    [push, params],
  )
  // onMount
  useEffect(
    () => () => resetState(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // toggle form based on vecrvInfo
  useEffect(() => {
    if (vecrvInfo && +vecrvInfo.lockedAmountAndUnlockTime.lockedAmount > 0) {
      const updatedFormType: FormType = rFormType === 'adjust_date' ? 'adjust_date' : 'adjust_crv'
      toggleForm(updatedFormType)
    } else {
      toggleForm('create')
    }
  }, [rChainId, rFormType, signerAddress, toggleForm, vecrvInfo])

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
                curve={curve}
                rChainId={rChainId}
                rFormType={rFormType as FormType}
                vecrvInfo={vecrvInfo}
                toggleForm={toggleForm}
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
  min-height: 14.8125rem; //237px
`

export default Page
