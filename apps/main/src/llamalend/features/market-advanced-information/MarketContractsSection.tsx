import { ReactNode } from 'react'
import { getAddress, zeroAddress } from 'viem'
import {
  getAmmAddress,
  getControllerAddress,
  getGaugeAddress,
  getTokens,
  getVaultAddress,
  getMonetaryPolicy,
} from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import { useMarketOracleAddress } from '@/llamalend/queries/market'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { AddressActionInfo } from '@evm-ui/shared/ui/AddressActionInfo'
import { scanAddressPath } from '@legacy-ui/utils'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { Badge } from '@ui/components/Badge'
import { ExternalLink } from '@ui/components/ExternalLink'
import { TokenLabel } from '@ui/components/TokenLabel'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { ActionInfo, type ActionInfoProps } from '@ui/features/forms/action-info/ActionInfo'
import type { QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { MarketIdRow } from './MarketParameterRows'

const { Spacing } = SizesAndSpaces

/** Either `address` (for a link) or `fallbackValue` (e.g. gauge = zeroAddress) is provided, not both */
type AddressItem = {
  key: string
  label: ReactNode
  address?: string
  fallbackValue?: ReactNode
  labelTooltip?: ActionInfoProps['labelTooltip']
}

type MarketContractsProps = {
  chainId: IChainId
  blockchainId: string
  market: MarketTemplate | undefined
  apiMarket: QueryProp<LlamaMarket>
}

const GaugeLabel = () => (
  <Stack direction="row" sx={{ gap: Spacing.xs, alignItems: 'center' }}>
    <Typography variant="bodyMRegular" color="textSecondary">
      {t`Gauge`}
    </Typography>
    <Badge size="extraSmall" color="active" label={t`Active`} />
  </Stack>
)

const AssetRow = ({
  title,
  chainId,
  blockchainId,
  token,
  testId,
}: {
  title: ReactNode
  chainId: number
  blockchainId: string
  token: { symbol?: string; address?: string } | undefined
  testId: string
}) => {
  const address = token?.address
  return (
    <ActionInfo
      testId={testId}
      label={title}
      value={
        <TokenLabel
          blockchainId={blockchainId}
          tooltip={token?.symbol}
          address={address}
          label={token?.symbol ?? ''}
          size="mui-md"
        />
      }
      copyValue={address}
      format={getAddress}
      valueTooltip={maybe(address && scanAddressPath(chainId, address), link => (
        <ExternalLink href={link} label={t`View on explorer`} />
      ))}
    />
  )
}

const MarketDataSkeleton = ({
  market,
  apiMarket,
  children,
}: Pick<MarketContractsProps, 'market' | 'apiMarket'> & { children: ReactNode }) => (
  <WithSkeleton loading={!market && !apiMarket.data} variant="rectangular" height="4lh" width="100%">
    <Stack>{children}</Stack>
  </WithSkeleton>
)

export const MarketAssets = ({ chainId, blockchainId, market, apiMarket }: MarketContractsProps) => {
  const { collateralToken, borrowToken } = getTokens(market, apiMarket.data) ?? {}

  return (
    <MarketDataSkeleton market={market} apiMarket={apiMarket}>
      <AssetRow
        testId="market-contract-collateral-token"
        chainId={chainId}
        blockchainId={blockchainId}
        title={t`Collateral`}
        token={collateralToken}
      />
      <AssetRow
        testId="market-contract-borrow-token"
        chainId={chainId}
        blockchainId={blockchainId}
        title={t`Borrowed`}
        token={borrowToken}
      />
    </MarketDataSkeleton>
  )
}

export const MarketContractsSection = ({ chainId, blockchainId, market, apiMarket }: MarketContractsProps) => {
  const { data: onChainOracleAddress, isLoading: oracleAddressIsLoading } = useMarketOracleAddress({
    chainId,
    marketId: market?.id,
  })

  const hasContractData = !!market || !!apiMarket.data
  const contractsLoading = !hasContractData || (!!market && oracleAddressIsLoading)
  const gaugeAddress = getGaugeAddress(market)
  const vaultAddress = getVaultAddress(market, apiMarket.data) ?? undefined
  const monetaryPolicyAddress = getMonetaryPolicy(market, apiMarket.data)
  const oracleAddress = market ? onChainOracleAddress : apiMarket.data?.oracleAddress

  const infraAddressItems = notFalsy<AddressItem>(
    oracleAddress && { key: 'oracle', label: t`Oracle`, address: oracleAddress },
    hasContractData && { key: 'amm', label: t`AMM`, address: getAmmAddress(market, apiMarket.data) },
    vaultAddress && { key: 'vault', label: t`Vault`, address: vaultAddress },
    hasContractData && {
      key: 'controller',
      label: t`Controller`,
      address: getControllerAddress(market, apiMarket.data),
    },
    (market ?? monetaryPolicyAddress) && {
      key: 'monetary-policy',
      label: t`Monetary Policy`,
      labelTooltip: {
        title: t`The rule set that controls how fast borrow costs rise or fall as market conditions change.`,
      },
      address: monetaryPolicyAddress,
    },
    gaugeAddress &&
      (gaugeAddress === zeroAddress
        ? { key: 'gauge', label: t`Gauge`, fallbackValue: t`No gauge` }
        : { key: 'gauge', label: <GaugeLabel />, address: gaugeAddress }),
  )

  return (
    <Stack data-testid="market-contracts-section">
      <Card size="extraSmall" variant="inline" data-testid="market-assets-section">
        <CardHeader title={t`Assets`} />
        <CardContent component={Stack} sx={{ marginBlock: Spacing.sm }}>
          <MarketAssets chainId={chainId} blockchainId={blockchainId} market={market} apiMarket={apiMarket} />
        </CardContent>
      </Card>

      <Card size="extraSmall" variant="inline">
        <CardHeader title={t`Contracts`} />
        <CardContent component={Stack} sx={{ marginBlock: Spacing.sm }}>
          <WithSkeleton loading={contractsLoading} variant="rectangular" height="8lh" width="100%">
            <Stack spacing={Spacing.sm}>
              <Stack>
                {infraAddressItems.map(({ key, label, labelTooltip, address, fallbackValue }) =>
                  fallbackValue != null ? (
                    <ActionInfo
                      key={key}
                      testId={`market-contract-${key}`}
                      label={label}
                      labelTooltip={labelTooltip}
                      value={fallbackValue}
                    />
                  ) : (
                    <AddressActionInfo
                      key={key}
                      testId={`market-contract-${key}`}
                      chainId={chainId}
                      title={label}
                      labelTooltip={labelTooltip}
                      address={address}
                    />
                  ),
                )}
              </Stack>
              <MarketIdRow marketId={market?.id ?? apiMarket.data?.controllerAddress} />
            </Stack>
          </WithSkeleton>
        </CardContent>
      </Card>
    </Stack>
  )
}
