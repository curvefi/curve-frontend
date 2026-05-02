import { useEffect } from 'react'
import { useConnection } from 'wagmi'
import type { FormType } from '@/dao/components/PageVeCrv/types'
import { useLockerVecrvInfo } from '@/dao/entities/locker-vecrv-info'
import { networksIdMapper } from '@/dao/networks'
import { useStore } from '@/dao/store/useStore'
import { type VeCrvUrlParams } from '@/dao/types/dao.types'
import Stack from '@mui/material/Stack'
import { BoxHeader } from '@ui/Box'
import { IconButton } from '@ui/IconButton'
import { SpinnerWrapper, Spinner } from '@ui/Spinner'
import { isLoading, useCurve } from '@ui-kit/features/connect-wallet'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { FormCrvLocker } from './components/FormCrvLocker'
import { WrongNetwork } from './WrongNetwork'

export const VeCrv = () => {
  const { formType: rFormType, network } = useParams<VeCrvUrlParams>()
  const { curveApi = null, connectState } = useCurve()
  const rChainId = networksIdMapper[network]
  const isLoadingCurve = isLoading(connectState)

  const { address: userAddress } = useConnection()

  const { data: vecrvInfo } = useLockerVecrvInfo({ chainId: curveApi?.chainId, userAddress })
  const resetState = useStore(state => state.lockedCrv.resetState)

  // onMount
  useEffect(
    () => () => resetState(),
    // eslint-disable-next-line @eslint-react/exhaustive-deps
    [],
  )

  return (
    <DetailPageLayout formTabs={null} testId="vecrv-page">
      <Stack margin="auto" maxWidth="30rem" sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>
        <BoxHeader className="title-text">
          <IconButton hidden />
          {t`CRV Locker`}
          <IconButton hidden />
        </BoxHeader>

        {rChainId === 1 ? (
          <Stack>
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
          </Stack>
        ) : (
          <WrongNetwork />
        )}
      </Stack>
    </DetailPageLayout>
  )
}
