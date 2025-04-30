'use client'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import FormCrvLocker from '@/dex/components/PageCrvLocker/index'
import type { FormType } from '@/dex/components/PageCrvLocker/types'
import { ROUTE } from '@/dex/constants'
import Settings from '@/dex/layout/default/Settings'
import useStore from '@/dex/store/useStore'
import { type CrvLockerUrlParams, CurveApi } from '@/dex/types/main.types'
import { getPath, useChainId } from '@/dex/utils/utilsRouter'
import Box, { BoxHeader } from '@ui/Box'
import IconButton from '@ui/IconButton'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import { isLoading, useConnection } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'

export const PageCrvLocker = (params: CrvLockerUrlParams) => {
  const { push } = useRouter()
  const { lib: curve = null, connectState } = useConnection<CurveApi>()
  const pageLoaded = !isLoading(connectState)
  const rChainId = useChainId(params.network)
  const { formType: [rFormType] = [] } = params
  const activeKeyVecrvInfo = useStore((state) => state.lockedCrv.activeKeyVecrvInfo)
  const vecrvInfo = useStore((state) => state.lockedCrv.vecrvInfo[activeKeyVecrvInfo])
  const fetchVecrvInfo = useStore((state) => state.lockedCrv.fetchVecrvInfo)
  const resetState = useStore((state) => state.lockedCrv.resetState)

  const toggleForm = useCallback(
    (formType: FormType) => {
      push(getPath(params, `${ROUTE.PAGE_LOCKER}/${formType}`))
    },
    [push, params],
  )

  const fetchData = useCallback(
    async (curve: CurveApi | null, isLoadingCurve: boolean) => {
      if (curve && !isLoadingCurve) {
        const resp = await fetchVecrvInfo(curve)
        if (+resp.lockedAmountAndUnlockTime.lockedAmount > 0) {
          const updatedFormType: FormType = rFormType === 'adjust_date' ? 'adjust_date' : 'adjust_crv'
          toggleForm(updatedFormType)
        } else {
          toggleForm('create')
        }
      }
    },
    [fetchVecrvInfo, rFormType, toggleForm],
  )

  // onMount
  useEffect(
    () => () => resetState(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  // get initial data
  useEffect(() => {
    void fetchData(curve, !pageLoaded)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve?.chainId, curve?.signerAddress, pageLoaded])

  return (
    <>
      <Container variant="primary" shadowed>
        <BoxHeader className="title-text">
          <IconButton hidden />
          {t`CRV Locker`}
          <IconButton hidden />
        </BoxHeader>

        <Content grid gridRowGap={3} padding>
          {rChainId && rFormType && vecrvInfo && pageLoaded ? (
            <FormCrvLocker
              curve={curve}
              rChainId={rChainId}
              rFormType={rFormType as FormType}
              vecrvInfo={vecrvInfo}
              toggleForm={toggleForm}
              pageLoaded={pageLoaded}
            />
          ) : (
            <SpinnerWrapper>
              <Spinner />
            </SpinnerWrapper>
          )}
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
