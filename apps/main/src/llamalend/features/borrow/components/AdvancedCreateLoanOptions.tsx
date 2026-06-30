import { RouteDetails } from '@/llamalend/widgets/RouteDetails'
import type { INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import Stack from '@mui/material/Stack'
import { type Token } from '@primitives/address.utils'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useCreateLoanExpectedCollateral } from '../../../queries/create-loan/create-loan-expected-collateral.query'
import { useCreateLoanRouteImage } from '../../../queries/create-loan/create-loan-route-image.query'
import type { CreateLoanForm, CreateLoanFormQueryParams } from '../types'
import { LiquidationRangeSlider } from './LiquidationRangeSlider'

const { Spacing } = SizesAndSpaces

export const AdvancedCreateLoanOptions = ({
  network,
  params,
  values: { debt, userBorrowed, leverageEnabled, range },
  setRange,
  minBands,
  maxBands,
  collateralToken,
  borrowToken,
}: {
  network: INetworkName
  params: CreateLoanFormQueryParams
  values: CreateLoanForm
  setRange: (n: number) => void
  minBands: number | undefined
  maxBands: number | undefined
  collateralToken: Token | undefined
  borrowToken: Token | undefined
}) => {
  const { data: routeImage, isLoading: routeImageLoading } = useCreateLoanRouteImage(params, leverageEnabled)
  const { data: expectedCollateral, isLoading: expectedCollateralLoading } = useCreateLoanExpectedCollateral(
    params,
    leverageEnabled,
  )

  return (
    <Stack sx={{ gap: Spacing.sm, marginBlock: Spacing.sm }}>
      <LiquidationRangeSlider minBands={minBands} maxBands={maxBands} range={range} setRange={setRange} />
      {leverageEnabled && (
        <RouteDetails
          network={network}
          $minWidth="260px"
          loading={routeImageLoading || expectedCollateralLoading}
          swapFrom={borrowToken}
          swapTo={collateralToken}
          swapFromAmounts={notFalsy(
            debt && { value: debt, label: t`Debt` },
            userBorrowed && { value: userBorrowed, label: t`Wallet` },
          )}
          swapToAmounts={[expectedCollateral?.collateralFromDebt, expectedCollateral?.collateralFromUserBorrowed]}
          nonSwapAmount={{
            value: expectedCollateral?.userCollateral,
            label: '',
          }}
          total={expectedCollateral?.totalCollateral}
          avgPrice={expectedCollateral?.avgPrice}
          type="collateral"
          routeImage={routeImage}
        />
      )}
    </Stack>
  )
}
