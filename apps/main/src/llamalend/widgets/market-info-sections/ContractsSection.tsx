import { ReactNode } from 'react'
import { zeroAddress } from 'viem'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { type BaseConfig } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { AddressActionInfo } from '@ui-kit/shared/ui/AddressActionInfo'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type ContractItem = {
  key: string
  label: ReactNode
  address?: string
  fallbackValue?: ReactNode
}

type ContractsSectionProps = {
  chainId: IChainId
  market: LlamaMarketTemplate | undefined
  network: BaseConfig | undefined
}

export const ContractsSection = ({ market, network }: ContractsSectionProps) => {
  const tokens = market ? getTokens(market) : undefined

  const tokenItems: ContractItem[] = market
    ? [
        {
          key: 'collateral-token',
          label: (
            <TokenLabel
              blockchainId={network?.id}
              tooltip={tokens?.collateralToken.symbol}
              address={tokens?.collateralToken.address}
              label={tokens?.collateralToken.symbol ?? ''}
            />
          ),
          address: tokens?.collateralToken.address,
        },
        {
          key: 'borrow-token',
          label: (
            <TokenLabel
              blockchainId={network?.id}
              tooltip={tokens?.borrowToken.symbol}
              address={tokens?.borrowToken.address}
              label={tokens?.borrowToken.symbol ?? ''}
            />
          ),
          address: tokens?.borrowToken.address,
        },
      ]
    : []

  const infraItems: ContractItem[] = market
    ? market instanceof LendMarketTemplate
      ? [
          { key: 'amm', label: t`AMM`, address: market.addresses.amm },
          { key: 'vault', label: t`Vault`, address: market.addresses.vault },
          { key: 'controller', label: t`Controller`, address: market.addresses.controller },
          ...(market.addresses.gauge === zeroAddress
            ? [{ key: 'gauge', label: t`Gauge`, fallbackValue: t`No gauge` }]
            : [{ key: 'gauge', label: t`Gauge`, address: market.addresses.gauge }]),
          { key: 'monetary-policy', label: t`Monetary policy`, address: market.addresses.monetary_policy },
        ]
      : [
          { key: 'amm', label: t`AMM`, address: market.address },
          { key: 'controller', label: t`Controller`, address: market.controller },
          { key: 'monetary-policy', label: t`Monetary policy`, address: market.monetaryPolicy },
        ]
    : []

  const contracts = [...tokenItems, ...infraItems]

  return (
    <Stack gap={Spacing.xs}>
      <CardHeader title={t`Contracts`} size="small" inline />

      <Stack>
        {contracts.map(({ key, label, address, fallbackValue }, index) => {
          const isBorderBottom = index !== contracts.length - 1
          const showFallback = !!fallbackValue || address === 'NaN'

          return showFallback ? (
            <ActionInfo
              key={key}
              label={label}
              value={fallbackValue ?? t`No gauge`}
              sx={isBorderBottom ? { borderBottom: (theme) => `1px solid ${theme.palette.divider}` } : undefined}
            />
          ) : (
            <AddressActionInfo
              key={key}
              network={network}
              isBorderBottom={isBorderBottom}
              title={label}
              address={address}
            />
          )
        })}
      </Stack>
    </Stack>
  )
}
