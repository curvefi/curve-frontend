import { ReactNode } from 'react'
import { zeroAddress } from 'viem'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type BaseConfig } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { AddressActionInfo } from '@ui-kit/shared/ui/AddressActionInfo'
import { TokenIcon, type TokenIconProps } from '@ui-kit/shared/ui/TokenIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

/** Either `address` (for a link) or `fallbackValue` (e.g. gauge = zeroAddress) is provided, not both */
type ContractItem = {
  key: string
  label: ReactNode
  address?: string
  fallbackValue?: ReactNode
}

type MarketContractsProps = {
  chainId: IChainId
  market: LlamaMarketTemplate | undefined
  network: BaseConfig | undefined
}

const TokenLabel = ({ blockchainId, address, label }: TokenIconProps & { label: string }) => (
  <Stack direction="row" gap={Spacing.xs} alignItems="center">
    <TokenIcon blockchainId={blockchainId} address={address} size="mui-md" />
    <Typography variant="bodyMRegular">{label}</Typography>
  </Stack>
)

export const MarketContractsSection = ({ market, network }: MarketContractsProps) => {
  const { collateralToken, borrowToken } = market ? getTokens(market) : {}

  const tokenItems: ContractItem[] = market
    ? [
        {
          key: 'collateral-token',
          label: (
            <TokenLabel
              blockchainId={network?.id}
              tooltip={collateralToken?.symbol}
              address={collateralToken?.address}
              label={collateralToken?.symbol ?? ''}
            />
          ),
          address: collateralToken?.address,
        },
        {
          key: 'borrow-token',
          label: (
            <TokenLabel
              blockchainId={network?.id}
              tooltip={borrowToken?.symbol}
              address={borrowToken?.address}
              label={borrowToken?.symbol ?? ''}
            />
          ),
          address: borrowToken?.address,
        },
      ]
    : []

  const infraItems: ContractItem[] = market
    ? market instanceof LendMarketTemplate
      ? [
          { key: 'amm', label: t`AMM`, address: market.addresses.amm },
          { key: 'vault', label: t`Vault`, address: market.addresses.vault },
          { key: 'controller', label: t`Controller`, address: market.addresses.controller },
          {
            key: 'gauge',
            label: t`Gauge`,
            ...(market.addresses.gauge === zeroAddress
              ? { fallbackValue: t`No gauge` }
              : { address: market.addresses.gauge }),
          },
          { key: 'monetary-policy', label: t`Monetary policy`, address: market.addresses.monetary_policy },
          { key: 'oracle', label: t`Oracle`, address: market.addresses.oracle },
        ]
      : [
          { key: 'amm', label: t`AMM`, address: market.address },
          { key: 'controller', label: t`Controller`, address: market.controller },
          { key: 'monetary-policy', label: t`Monetary policy`, address: market.monetaryPolicy },
        ]
    : []

  return (
    <Stack>
      <CardHeader title={t`Contracts`} size="small" data-inline />
      <Stack paddingBlock={Spacing.sm}>
        {tokenItems.map(({ key, label, address }) => (
          <AddressActionInfo key={key} network={network} title={label} address={address} />
        ))}
      </Stack>
      <Stack paddingBlock={Spacing.sm}>
        {infraItems.map(({ key, label, address, fallbackValue }) =>
          fallbackValue ? (
            <ActionInfo key={key} label={label} value={fallbackValue ?? t`No gauge`} />
          ) : (
            <AddressActionInfo key={key} network={network} title={label} address={address} />
          ),
        )}
      </Stack>
    </Stack>
  )
}
