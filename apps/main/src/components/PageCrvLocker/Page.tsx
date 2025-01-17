import type { NextPage } from 'next'
import type { FormType } from '@main/components/PageCrvLocker/types'

import { t } from '@lingui/macro'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import React, { useCallback, useEffect } from 'react'
import styled from 'styled-components'

import { ROUTE } from '@main/constants'
import { getPath } from '@main/utils/utilsRouter'
import { scrollToTop } from '@main/utils'
import usePageOnMount from '@main/hooks/usePageOnMount'
import useStore from '@main/store/useStore'

import Box, { BoxHeader } from '@ui/Box'
import DocumentHead from '@main/layout/default/DocumentHead'
import FormCrvLocker from '@main/components/PageCrvLocker/index'
import IconButton from '@ui/IconButton'
import Settings from '@main/layout/default/Settings'
import Spinner, { SpinnerWrapper } from '@ui/Spinner'
import { CurveApi } from '@main/types/main.types'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { routerParams, curve } = usePageOnMount(params, location, navigate)
  const { rChainId, rFormType } = routerParams

  const activeKeyVecrvInfo = useStore((state) => state.lockedCrv.activeKeyVecrvInfo)
  const isLoadingCurve = useStore((state) => state.isLoadingCurve)
  const vecrvInfo = useStore((state) => state.lockedCrv.vecrvInfo[activeKeyVecrvInfo])
  const fetchVecrvInfo = useStore((state) => state.lockedCrv.fetchVecrvInfo)
  const resetState = useStore((state) => state.lockedCrv.resetState)

  const toggleForm = useCallback(
    (formType: FormType) => {
      const pathname = getPath(params, `${ROUTE.PAGE_LOCKER}/${formType}`)
      navigate(pathname)
    },
    [navigate, params],
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
  useEffect(() => {
    scrollToTop()

    return () => resetState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // get initial data
  useEffect(() => {
    fetchData(curve, isLoadingCurve)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curve?.chainId, curve?.signerAddress, isLoadingCurve])

  return (
    <>
      <DocumentHead title={t`CRV Locker`} />
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
