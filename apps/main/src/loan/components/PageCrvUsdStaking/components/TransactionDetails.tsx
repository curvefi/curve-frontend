import { useConnection } from 'wagmi'
import Switch from '@/loan/components/PageCrvUsdStaking/components/Switch'
import { isLoading, isReady } from '@/loan/components/PageCrvUsdStaking/utils'
import useEstimateGasConversion from '@/loan/hooks/useEstimateGasConversion'
import useStore from '@/loan/store/useStore'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import { Stack, Typography } from '@mui/material'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

export const TransactionDetails = () => {
  const { address } = useConnection()
  const preview = useStore((state) => state.scrvusd.preview)
  const scrvUsdExchangeRate = useStore((state) => state.scrvusd.scrvUsdExchangeRate)
  const approveInfinite = useStore((state) => state.scrvusd.approveInfinite)
  const setApproveInfinite = useStore((state) => state.scrvusd.setApproveInfinite)
  const stakingModule = useStore((state) => state.scrvusd.stakingModule)
  const fetchStatus = useStore((state) => state.scrvusd.estGas.fetchStatus)
  const estimateGas = useStore((state) => state.scrvusd.getEstimateGas(address ?? ''))

  const { estGasCostUsd, tooltip } = useEstimateGasConversion(estimateGas)
  const hasWallet = !!address
  const exchangeRateReady = isReady(scrvUsdExchangeRate.fetchStatus)
  const exchangeRateLoading = hasWallet && isLoading(scrvUsdExchangeRate.fetchStatus)
  const gasLoading = hasWallet && isLoading(fetchStatus)

  const symbol = stakingModule === 'deposit' ? t`scrvUSD` : t`crvUSD`
  const receive = formatNumber(preview.value, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  const valueGas = formatNumber(estGasCostUsd, { minimumFractionDigits: 2, maximumFractionDigits: 4 })

  const title = (
    <WithSkeleton loading={exchangeRateLoading}>
      <Typography variant="highlightM" color="textPrimary">
        {exchangeRateReady
          ? t`1 crvUSD = ${formatNumber(scrvUsdExchangeRate.value, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            })} scrvUSD`
          : '-'}
      </Typography>
    </WithSkeleton>
  )

  const info = (
    <Stack direction="row" alignItems="center">
      <LocalFireDepartmentIcon
        sx={{
          width: IconSize.sm,
          height: IconSize.sm,
          color: (t) => t.palette.text.secondary,
        }}
      />
      <WithSkeleton loading={gasLoading}>
        <Typography variant="bodyMRegular" color="textSecondary">
          {hasWallet && isReady(preview.fetchStatus) ? valueGas : gasLoading ? '0.0000' : '-'}
        </Typography>
      </WithSkeleton>
    </Stack>
  )

  return (
    <Accordion ghost title={title} info={info}>
      <Stack>
        <ActionInfo
          label={t`You receive`}
          value={hasWallet && isReady(preview.fetchStatus) ? `${receive} ${symbol}` : '-'}
          loading={gasLoading}
        />

        <ActionInfo
          label={t`Infinite allowance`}
          value=""
          valueRight={<Switch isActive={approveInfinite} onChange={setApproveInfinite} />}
        />

        <ActionInfo
          label={t`Estimated TX cost`}
          value={hasWallet && isReady(preview.fetchStatus) ? valueGas : '-'}
          valueLeft={<LocalFireDepartmentIcon sx={{ width: IconSize.sm, height: IconSize.sm }} />}
          valueTooltip={tooltip}
          loading={gasLoading}
        />
      </Stack>
    </Accordion>
  )
}
