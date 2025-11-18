import Stack from '@mui/material/Stack'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { AssetsToWithdraw, type Props as AssetsToWithdrawProps } from './action-infos/AssetsToWithdraw'
import { Borrowed, type Props as BorrowedProps } from './action-infos/Borrowed'
import { BorrowRate, type Props as BorrowRateProps } from './action-infos/BorrowRate'
import { Collateral, type Props as CollateralProps } from './action-infos/Collateral'
import { Debt, type Props as DebtProps } from './action-infos/Debt'
import { EstimatedTxCost, type Props as EstimatedTxCostProps } from './action-infos/EstimatedTxCost'
import { Health, type Props as HealthProps } from './action-infos/Health'
import { Leverage, type Props as LeverageProps } from './action-infos/Leverage'
import { Ltv, type Props as LtvProps } from './action-infos/Ltv'

const { Spacing } = SizesAndSpaces

export type Props = {
  loading?: boolean
  health: HealthProps
  loanInfo: {
    borrowRate?: BorrowRateProps
    debt?: DebtProps
    ltv?: LtvProps
    collateral?: CollateralProps['collateral']
  }
  collateral: {
    borrowed?: BorrowedProps
    leverage?: LeverageProps
    assetsToWithdraw?: AssetsToWithdrawProps['assetsToWithdraw']
  }
  transaction: {
    estimatedTxCost?: EstimatedTxCostProps
  }
}

/** Component that displays action information in an accordion format, with the health as title */
export const ActionInfos = ({
  loading = false,
  health,
  loanInfo: { borrowRate, debt, ltv, collateral },
  collateral: { borrowed, leverage, assetsToWithdraw },
  transaction: { estimatedTxCost },
}: Props) => (
  <Accordion ghost size="small" title={<Health loading={loading} {...health} />}>
    <Stack gap={Spacing.md}>
      {/** Loan */}
      <Stack>
        {borrowRate && <BorrowRate loading={loading} {...borrowRate} />}
        {debt && <Debt loading={loading} {...debt} />}
        {ltv && <Ltv loading={loading} {...ltv} />}
        {collateral && <Collateral loading={loading} collateral={collateral} />}
      </Stack>

      {/** Collateral */}
      <Stack>
        {leverage && <Leverage loading={loading} {...leverage} />}
        {borrowed && <Borrowed loading={loading} {...borrowed} />}
        {assetsToWithdraw && <AssetsToWithdraw loading={loading} assetsToWithdraw={assetsToWithdraw} />}
      </Stack>

      {/** Transaction */}
      {estimatedTxCost && <EstimatedTxCost loading={loading} {...estimatedTxCost} />}
    </Stack>
  </Accordion>
)
