'use client'
import type { FormType } from '@/dao/components/PageVeCrv/types'
import { t } from '@ui-kit/lib/i18n'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import usePageOnMount from '@/dao/hooks/usePageOnMount'
import useStore from '@/dao/store/useStore'
import Box, { BoxHeader } from '@ui/Box'
import FormCrvLocker from '@/dao/components/PageVeCrv/index'
import IconButton from '@ui/IconButton'
import Settings from '@/dao/layout/Settings'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import { CurveApi, type VeCrvUrlParams } from '@/dao/types/dao.types'
import { getPath } from '@/dao/utils/utilsRouter'
import { ROUTE } from '@/dao/constants'

const Page = (params: VeCrvUrlParams) => {
  console.log(params)
  const [rFormType] = params.formType
  const { push } = useRouter()
  const { routerParams, curve } = usePageOnMount()
  const { rChainId } = routerParams

  const activeKeyVecrvInfo = useStore((state) => state.lockedCrv.activeKeyVecrvInfo)
  const isLoadingCurve = useStore((state) => state.isLoadingCurve)
  const vecrvInfo = useStore((state) => state.lockedCrv.vecrvInfo[activeKeyVecrvInfo])
  const fetchVecrvInfo = useStore((state) => state.lockedCrv.fetchVecrvInfo)
  const resetState = useStore((state) => state.lockedCrv.resetState)

  const toggleForm = useCallback(
    (formType: FormType) => push(getPath(params, `${ROUTE.PAGE_VECRV}/${formType}`)),
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
    fetchData(curve, isLoadingCurve)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve?.chainId, curve?.signerAddress, isLoadingCurve])

  return (
    <>
      <Container variant="primary" shadowed>
        <BoxHeader className="title-text">
          <IconButton hidden />
          {t`CRV Locker`}
          <IconButton hidden />
        </BoxHeader>

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
