import { useState } from 'react'
import Switch from '@/loan/components/PageCrvUsdStaking/components/Switch'
import { isLoading, isReady } from '@/loan/components/PageCrvUsdStaking/utils'
import useEstimateGasConversion from '@/loan/hooks/useEstimateGasConversion'
import useStore from '@/loan/store/useStore'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import { Accordion, AccordionDetails, AccordionSummary, Skeleton, Stack, Typography } from '@mui/material'
import { formatNumber } from '@ui/utils'
import { useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

export const TransactionDetails = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { signerAddress } = useWallet()
  const { preview, scrvUsdExchangeRate, approveInfinite, setApproveInfinite, stakingModule } = useStore(
    (state) => state.scrvusd,
  )
  const fetchStatus = useStore((state) => state.scrvusd.estGas.fetchStatus)
  const estimateGas = useStore((state) => state.scrvusd.getEstimateGas(signerAddress ?? ''))

  const { estGasCostUsd, tooltip } = useEstimateGasConversion(estimateGas)
  const exchangeRateLoading = isLoading(scrvUsdExchangeRate.fetchStatus)

  const symbol = stakingModule === 'deposit' ? t`scrvUSD` : t`crvUSD`
  const receive = formatNumber(preview.value, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  const valueGas = formatNumber(estGasCostUsd, { minimumFractionDigits: 2, maximumFractionDigits: 4 })

  return (
    <Accordion onChange={(_, isExpanded) => setIsOpen(isExpanded)} sx={{ border: 'none' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" flexGrow={1} justifyContent="space-between" alignItems="center">
          {exchangeRateLoading ? (
            <Skeleton>
              <Typography variant="highlightM" color="textPrimary">
                1 crvUSD = 0.96 scrvUSD
              </Typography>
            </Skeleton>
          ) : (
            <Typography variant="highlightM" color="textPrimary">
              {t`1 crvUSD = ${formatNumber(scrvUsdExchangeRate.value, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} scrvUSD`}
            </Typography>
          )}

          {!isOpen && (
            <Stack direction="row" alignItems="center">
              <LocalFireDepartmentIcon
                sx={{
                  width: IconSize.sm,
                  height: IconSize.sm,
                  color: (t) => t.palette.text.secondary,
                }}
              />
              {isLoading(fetchStatus) ? (
                <Skeleton>
                  {' '}
                  <Typography variant="bodyMRegular" color="textSecondary">
                    0.0000
                  </Typography>
                </Skeleton>
              ) : (
                <Typography variant="bodyMRegular" color="textSecondary">
                  {isReady(preview.fetchStatus) ? valueGas : '-'}
                </Typography>
              )}
            </Stack>
          )}
        </Stack>
      </AccordionSummary>

      <AccordionDetails>
        <Stack>
          <ActionInfo
            label={t`You receive`}
            value={isReady(preview.fetchStatus) ? `${receive} ${symbol}` : '-'}
            loading={isLoading(fetchStatus)}
          />

          <ActionInfo
            label={t`Infinite allowance`}
            value=""
            valueRight={<Switch isActive={approveInfinite} onChange={setApproveInfinite} />}
          />

          <ActionInfo
            label={t`Estimated TX cost`}
            value={isReady(preview.fetchStatus) ? valueGas : '-'}
            valueLeft={<LocalFireDepartmentIcon sx={{ width: IconSize.sm, height: IconSize.sm }} />}
            valueTooltip={tooltip}
            loading={isLoading(fetchStatus)}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}
