import { ReactNode } from 'react'
import { getAddress } from 'viem'
import {
  getAddressOrPair,
  getAmmAddress,
  getControllerAddress,
  getGaugeAddress,
  getMonetaryPolicy,
  getTokens,
  getVaultAddress,
} from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import { useMarketBorrowGaugeAddress } from '@/llamalend/queries/market/market-borrow-gauge-address.query'
import { useMarketOracleAddress } from '@/llamalend/queries/market/market-oracle-address.query'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Chain } from '@curvefi/prices-api'
import { evmAddressDisplay } from '@evm-ui/utils'
import { scanAddressPath } from '@legacy-ui/utils'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Address } from '@primitives/address.utils'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { Badge } from '@ui/components/Badge'
import { ExternalLink } from '@ui/components/ExternalLink'
import { SectionContentCard } from '@ui/components/SectionContentCard'
import { TokenLabel } from '@ui/components/TokenLabel'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { ActionInfo, type ActionInfoProps } from '@ui/features/forms/action-info/ActionInfo'
import { AddressActionInfo } from '@ui/features/forms/action-info/AddressActionInfo'
import type { QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { MarketIdRow } from './MarketParameterRows'

const { Spacing } = SizesAndSpaces

type AddressItem = {
  key: string
  label: ReactNode
  address: Address | undefined
  labelTooltip?: ActionInfoProps['labelTooltip']
}

type MarketContractsProps = {
  chainId: IChainId
  blockchainId: Chain
  market: MarketTemplate | undefined
  apiMarket: QueryProp<LlamaMarket>
}

const GaugeLabel = ({ type }: { type: 'supply' | 'borrow' }) => (
  <Stack direction="row" sx={{ gap: Spacing.xs, alignItems: 'center' }}>
    <Typography variant="bodyMRegular" color="textSecondary">
      {{ supply: 'Supply', borrow: 'Borrow' }[type] + ' gauge'}
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
  blockchainId: Chain
  token: { symbol?: string; address?: Address } | undefined
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
          address={getAddressOrPair(blockchainId, address)}
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

const MarketAssets = ({ chainId, blockchainId, market, apiMarket }: MarketContractsProps) => {
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
  const { data: onChainBorrowGaugeAddress, isLoading: borrowGaugeAddressIsLoading } = useMarketBorrowGaugeAddress({
    chainId,
    marketId: market?.id,
  })

  const hasContractData = !!market || !!apiMarket.data
  const contractsLoading = !hasContractData || (!!market && (oracleAddressIsLoading || borrowGaugeAddressIsLoading))
  const supplyGaugeAddress = getGaugeAddress(market, apiMarket.data)
  const borrowGaugeAddress = market ? onChainBorrowGaugeAddress : null // todo: the prices API should return the borrow gauge
  const vaultAddress = getVaultAddress(market, apiMarket.data) ?? undefined
  const monetaryPolicyAddress = getMonetaryPolicy(market, apiMarket.data)
  const oracleAddress = market ? onChainOracleAddress : apiMarket.data?.oracleAddress

  const infraAddressItems = notFalsy<AddressItem>(
    oracleAddress && { key: 'oracle', label: t`Oracle`, address: oracleAddress as Address },
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
    supplyGaugeAddress && { key: 'supply-gauge', label: <GaugeLabel type="supply" />, address: supplyGaugeAddress },
    borrowGaugeAddress && { key: 'borrow-gauge', label: <GaugeLabel type="borrow" />, address: borrowGaugeAddress },
  )

  return (
    <Stack data-testid="market-contracts-section">
      <Card size="extraSmall" variant="inline" data-testid="market-assets-section">
        <CardHeader title={t`Assets`} />
        <CardContent component={SectionContentCard}>
          <MarketAssets chainId={chainId} blockchainId={blockchainId} market={market} apiMarket={apiMarket} />
        </CardContent>
      </Card>

      <Card size="extraSmall" variant="inline">
        <CardHeader title={t`Contracts`} />
        <CardContent component={SectionContentCard}>
          <WithSkeleton loading={contractsLoading} variant="rectangular" height="8lh" width="100%">
            <Stack spacing={Spacing.sm}>
              <Stack>
                {infraAddressItems.map(({ key, label, labelTooltip, address }) => (
                  <AddressActionInfo
                    key={key}
                    testId={`market-contract-${key}`}
                    chainId={chainId}
                    title={label}
                    labelTooltip={labelTooltip}
                    address={address}
                    display={evmAddressDisplay}
                  />
                ))}
              </Stack>
              <MarketIdRow chainId={chainId} marketId={market?.id ?? apiMarket.data?.controllerAddress} />
            </Stack>
          </WithSkeleton>
        </CardContent>
      </Card>
    </Stack>
  )
}
