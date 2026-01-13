import { useEffect } from 'react'
import { styled } from 'styled-components'
import { useConnection } from 'wagmi'
import { FormCrvLocker } from '@/dao/components/PageVeCrv/index'
import type { FormType } from '@/dao/components/PageVeCrv/types'
import { useLockerVecrvInfo } from '@/dao/entities/locker-vecrv-info'
import { networksIdMapper } from '@/dao/networks'
import { useStore } from '@/dao/store/useStore'
import { type VeCrvUrlParams } from '@/dao/types/dao.types'
import Stack from '@mui/material/Stack'
import { BoxHeader, Box } from '@ui/Box'
import { IconButton } from '@ui/IconButton'
import { SpinnerWrapper, Spinner } from '@ui/Spinner'
import { isLoading, useCurve } from '@ui-kit/features/connect-wallet'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { WrongNetwork } from './WrongNetwork'

const { Spacing } = SizesAndSpaces

export const PageVeCrv = () => {
  const { formType: rFormType, network } = useParams<VeCrvUrlParams>()
  const { curveApi = null, connectState } = useCurve()
  const rChainId = networksIdMapper[network]
  const isLoadingCurve = isLoading(connectState)

  const { address: userAddress } = useConnection()

  const { data: vecrvInfo } = useLockerVecrvInfo({ chainId: curveApi?.chainId, userAddress })
  const resetState = useStore((state) => state.lockedCrv.resetState)

  // onMount
  useEffect(
    () => () => resetState(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <Container variant="primary" shadowed data-testid="vecrv-page">
      <BoxHeader className="title-text">
        <IconButton hidden />
        {t`CRV Locker`}
        <IconButton hidden />
      </BoxHeader>

      {rChainId === 1 ? (
        <Stack gap={Spacing.md}>
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
    </Container>
  )
}

const Container = styled(Box)`
  margin: 1.5rem auto;
  max-width: var(--transfer-min-width);
  width: 100%;
`
