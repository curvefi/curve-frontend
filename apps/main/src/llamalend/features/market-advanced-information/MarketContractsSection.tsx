import { ReactNode } from 'react'
import { zeroAddress } from 'viem'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useMarketOracleAddress } from '@/llamalend/queries/market'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { notFalsy } from '@primitives/objects.utils'
import { type BaseConfig } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { AddressActionInfo } from '@ui-kit/shared/ui/AddressActionInfo'
import { TokenIcon, type TokenIconProps } from '@ui-kit/shared/ui/TokenIcon'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { QueryProp } from '@ui-kit/types/util'

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
  apiMarket: QueryProp<LlamaMarket>
  network: BaseConfig | undefined
}

const TokenLabel = ({ blockchainId, address, label }: TokenIconProps & { label: string }) => (
  <Stack direction="row" sx={{ gap: Spacing.xs, alignItems: 'center' }}>
    <TokenIcon blockchainId={blockchainId} address={address} size="mui-md" />
    <Typography variant="bodyMRegular">{label}</Typography>
  </Stack>
)

export const MarketContractsSection = ({ chainId, market, apiMarket, network }: MarketContractsProps) => {
  const { collateralToken, borrowToken } = getTokens(market, apiMarket.data) ?? {}
  const { data: oracleAddress, isLoading: oracleAddressIsLoading } = useMarketOracleAddress({
    chainId,
    marketId: market?.id,
  })
  const loading = !network || (!market && !apiMarket.data) || (!!market && oracleAddressIsLoading)

  const tokenItems: ContractItem[] =
    collateralToken && borrowToken
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
          { key: 'oracle', label: t`Oracle`, address: oracleAddress },
        ]
      : [
          { key: 'amm', label: t`AMM`, address: market.address },
          { key: 'controller', label: t`Controller`, address: market.controller },
          { key: 'monetary-policy', label: t`Monetary policy`, address: market.monetaryPolicy },
          { key: 'oracle', label: t`Oracle`, address: oracleAddress },
        ]
    : apiMarket.data
      ? notFalsy(
          { key: 'amm', label: t`AMM`, address: apiMarket.data.ammAddress },
          apiMarket.data.vaultAddress && { key: 'vault', label: t`Vault`, address: apiMarket.data.vaultAddress },
          { key: 'controller', label: t`Controller`, address: apiMarket.data.controllerAddress },
          apiMarket.data.monetaryPolicyAddress && {
            key: 'monetary-policy',
            label: t`Monetary policy`,
            address: apiMarket.data.monetaryPolicyAddress,
          },
          apiMarket.data.oracleAddress && { key: 'oracle', label: t`Oracle`, address: apiMarket.data.oracleAddress },
        )
      : []

  return (
    <Card size="inline">
      <CardHeader title={t`Contracts`} />
      <CardContent component={Stack} sx={{ marginBlock: Spacing.sm, gap: Spacing.sm }}>
        <WithSkeleton loading={loading} variant="rectangular" height="4lh" width="100%">
          <Stack>
            {tokenItems.map(({ key, label, address }) => (
              <AddressActionInfo key={key} network={network} title={label} address={address} />
            ))}
          </Stack>
        </WithSkeleton>
        <Stack>
          {infraItems.map(({ key, label, address, fallbackValue }) =>
            fallbackValue ? (
              <ActionInfo key={key} label={label} value={fallbackValue ?? t`No gauge`} />
            ) : (
              <AddressActionInfo key={key} network={network} title={label} address={address} />
            ),
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
