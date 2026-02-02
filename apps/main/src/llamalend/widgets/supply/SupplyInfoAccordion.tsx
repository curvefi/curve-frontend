import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { combineQueryState } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { FireIcon } from '@ui-kit/shared/icons/FireIcon'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { Query } from '@ui-kit/types/util'
import { type Decimal, formatNumber, formatPercent, formatUsd } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

export type SupplyInfoGasData = {
  estGasCostUsd?: number | Decimal | `${number}`
  tooltip?: string
}

export type SupplyInfoAccordionProps = {
  isOpen: boolean
  toggle: () => void
  isApproved?: boolean
  /** Vault shares with optional previous value for comparison */
  vaultShares: Query<Decimal | null>
  prevVaultShares?: Query<Decimal | null>
  /** Amount supplied in underlying asset with optional previous value */
  amountSupplied?: Query<Decimal | null>
  prevAmountSupplied?: Query<Decimal | null>
  /** Symbol of the supplied asset */
  suppliedSymbol?: string
  /** Supply APY with optional previous value */
  supplyApy?: Query<Decimal | null>
  prevSupplyApy?: Query<Decimal | null>
  /** Net supply APY (accounting for rewards, etc.) */
  netSupplyApy?: Query<Decimal | null>
  /** Estimated gas cost for the transaction */
  gas: Query<SupplyInfoGasData | null>
}

export const SupplyInfoAccordion = ({
  isOpen,
  toggle,
  isApproved,
  vaultShares,
  prevVaultShares,
  amountSupplied,
  prevAmountSupplied,
  suppliedSymbol,
  supplyApy,
  prevSupplyApy,
  netSupplyApy,
  gas,
}: SupplyInfoAccordionProps) => (
  <Box>
    <Accordion
      ghost
      title={t`Vault Shares`}
      info={
        <ActionInfo
          label=""
          value={vaultShares?.data && formatNumber(vaultShares.data, { abbreviate: true })}
          prevValue={prevVaultShares?.data && formatNumber(prevVaultShares.data, { abbreviate: true })}
          {...combineQueryState(vaultShares, prevVaultShares)}
          testId="supply-vault-shares"
        />
      }
      expanded={isOpen}
      toggle={toggle}
    >
      <Stack gap={Spacing.sm}>
        <Stack>
          {(amountSupplied || prevAmountSupplied) && (
            <ActionInfo
              label={t`Amount Supplied`}
              value={amountSupplied?.data && formatNumber(amountSupplied.data, { abbreviate: false })}
              prevValue={prevAmountSupplied?.data && formatNumber(prevAmountSupplied.data, { abbreviate: false })}
              {...combineQueryState(amountSupplied, prevAmountSupplied)}
              valueRight={suppliedSymbol}
              testId="supply-amount"
            />
          )}
          {(supplyApy || prevSupplyApy) && (
            <ActionInfo
              label="Supply APY"
              value={supplyApy?.data && formatPercent(supplyApy.data)}
              prevValue={prevSupplyApy?.data && formatPercent(prevSupplyApy.data)}
              {...combineQueryState(supplyApy, prevSupplyApy)}
              testId="supply-apy"
            />
          )}
          {netSupplyApy && (
            <ActionInfo
              label={t`Net Supply APY`}
              value={netSupplyApy.data && formatPercent(netSupplyApy.data)}
              {...combineQueryState(netSupplyApy)}
              testId="supply-net-apy"
            />
          )}
        </Stack>

        <Stack>
          <ActionInfo
            label={
              <>
                {t`Estimated tx cost`}
                <Typography color="textTertiary" component="span" variant="bodyXsRegular">
                  {isApproved === true && ` ${t`step 2/2`}`}
                  {isApproved === false && ` ${t`step 1/2`}`}
                </Typography>
              </>
            }
            value={gas.data?.estGasCostUsd == null ? undefined : formatUsd(gas.data.estGasCostUsd)}
            valueTooltip={gas.data?.tooltip}
            loading={gas.isLoading}
            valueLeft={<FireIcon fontSize="small" />}
          />
        </Stack>
      </Stack>
    </Accordion>
  </Box>
)
