import { ReactNode } from 'react'
import { getAddress } from 'viem'
import {
  getAmmAddress,
  getControllerAddress,
  getGaugeAddress,
  getMonetaryPolicy,
  getVaultAddress,
  type MarketTokensOrEmpty,
} from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import { useMarketBorrowGaugeAddress } from '@/llamalend/queries/market/market-borrow-gauge-address.query'
import {
  useMarketBorrowGaugeStatus,
  useMarketSupplyGaugeStatus,
} from '@/llamalend/queries/market/market-gauge-status.query'
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
import type { Address, Token } from '@primitives/address.utils'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { ExternalLink } from '@ui/components/ExternalLink'
import { GaugeStatusLabel } from '@ui/components/GaugeStatusLabel'
import { SectionContentCard } from '@ui/components/SectionContentCard'
import type { IconToken } from '@ui/components/TokenIcon'
import { TokenLabel } from '@ui/components/TokenLabel'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { ActionInfo, type ActionInfoProps } from '@ui/features/forms/action-info/ActionInfo'
import { AddressActionInfo } from '@ui/features/forms/action-info/AddressActionInfo'
import { combineQueries } from '@ui/features/queries/combine'
import { q, type QueryProp } from '@ui/features/queries/util'
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
  market: QueryProp<MarketTemplate>
  apiMarket: QueryProp<LlamaMarket>
  tokens: MarketTokensOrEmpty
}

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
  token: (Token & IconToken) | undefined
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
          token={token}
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
  <WithSkeleton loading={!market.data && !apiMarket.data} variant="rectangular" height="4lh" width="100%">
    <Stack>{children}</Stack>
  </WithSkeleton>
)

const MarketAssets = ({
  chainId,
  blockchainId,
  market,
  apiMarket,
  tokens: { collateralToken, borrowToken },
}: MarketContractsProps) => (
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

export const MarketContractsSection = ({ chainId, blockchainId, market, apiMarket, tokens }: MarketContractsProps) => {
  const { data: onChainOracleAddress, isLoading: oracleAddressIsLoading } = useMarketOracleAddress({
    chainId,
    marketId: market.data?.id,
  })
  const { data: onChainBorrowGaugeAddress, isLoading: borrowGaugeAddressIsLoading } = useMarketBorrowGaugeAddress({
    chainId,
    marketId: market.data?.id,
  })

  const supplyGaugeStatus = q(useMarketSupplyGaugeStatus({ chainId, marketId: market.data?.id }))
  const borrowGaugeStatus = q(useMarketBorrowGaugeStatus({ chainId, marketId: market.data?.id }))

  const hasContractData = !!market.data || !!apiMarket.data
  const contractsLoading =
    !hasContractData || (!!market.data && (oracleAddressIsLoading || borrowGaugeAddressIsLoading))
  const supplyGaugeAddress = getGaugeAddress(market.data, apiMarket.data)
  const borrowGaugeAddress = market.data ? onChainBorrowGaugeAddress : null // todo: the prices API should return the borrow gauge
  const vaultAddress = getVaultAddress(market.data, apiMarket.data) ?? undefined
  const monetaryPolicyAddress = getMonetaryPolicy(market.data, apiMarket.data)
  const oracleAddress = market.data ? onChainOracleAddress : apiMarket.data?.oracleAddress

  const infraAddressItems = notFalsy<AddressItem>(
    oracleAddress && { key: 'oracle', label: t`Oracle`, address: oracleAddress as Address },
    hasContractData && { key: 'amm', label: t`AMM`, address: getAmmAddress(market.data, apiMarket.data) },
    vaultAddress && { key: 'vault', label: t`Vault`, address: vaultAddress },
    hasContractData && {
      key: 'controller',
      label: t`Controller`,
      address: getControllerAddress(market.data, apiMarket.data),
    },
    (market.data ?? monetaryPolicyAddress) && {
      key: 'monetary-policy',
      label: t`Monetary Policy`,
      labelTooltip: {
        title: t`The rule set that controls how fast borrow costs rise or fall as market conditions change.`,
      },
      address: monetaryPolicyAddress,
    },
    ...(
      [
        { type: 'supply', address: supplyGaugeAddress, status: supplyGaugeStatus },
        { type: 'borrow', address: borrowGaugeAddress, status: borrowGaugeStatus },
      ] as const
    ).map(
      ({ type, address, status }) =>
        address && {
          key: `${type}-gauge`,
          label: (
            <GaugeStatusLabel
              label={{ supply: t`Supply gauge`, borrow: t`Borrow gauge` }[type]}
              status={combineQueries([market, status], (_, status) => status)}
              testId={`market-contract-${type}-gauge-status`}
            />
          ),
          address,
        },
    ),
  )

  return (
    <Stack data-testid="market-contracts-section">
      <Card size="extraSmall" variant="inline" data-testid="market-assets-section">
        <CardHeader title={t`Assets`} />
        <CardContent component={SectionContentCard}>
          <MarketAssets
            chainId={chainId}
            blockchainId={blockchainId}
            market={market}
            apiMarket={apiMarket}
            tokens={tokens}
          />
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
              <MarketIdRow chainId={chainId} marketId={market.data?.id ?? apiMarket.data?.controllerAddress} />
            </Stack>
          </WithSkeleton>
        </CardContent>
      </Card>
    </Stack>
  )
}
