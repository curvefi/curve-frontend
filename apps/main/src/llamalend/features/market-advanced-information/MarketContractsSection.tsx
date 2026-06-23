import { ReactNode } from 'react'
import { zeroAddress } from 'viem'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useMarketOracleAddress } from '@/llamalend/queries/market'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { type BaseConfig } from '@ui/utils'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo, type ActionInfoProps } from '@ui-kit/shared/ui/ActionInfo'
import { AddressActionInfo } from '@ui-kit/shared/ui/AddressActionInfo'
import { Badge } from '@ui-kit/shared/ui/Badge'
import { TokenIcon, type TokenIconProps } from '@ui-kit/shared/ui/TokenIcon'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type AddressItem = {
  key: string
  label: ReactNode
  address?: string
  labelTooltip?: ActionInfoProps['labelTooltip']
}

type MarketContractsProps = {
  chainId: IChainId
  market: LlamaMarketTemplate | undefined
  network: BaseConfig | undefined
}

const GaugeLabel = () => (
  <Stack direction="row" sx={{ gap: Spacing.xs, alignItems: 'center' }}>
    <Typography variant="bodyMRegular" color="textSecondary">
      {t`Gauge`}
    </Typography>
    <Badge size="extraSmall" color="active" label={t`Active`} />
  </Stack>
)

const TokenLabel = ({ blockchainId, address, label, tooltip }: TokenIconProps & { label: string }) => (
  <Stack direction="row" sx={{ gap: Spacing.xs, alignItems: 'center' }}>
    <TokenIcon blockchainId={blockchainId} address={address} tooltip={tooltip} size="mui-md" />
    <Typography variant="bodyMRegular">{label}</Typography>
  </Stack>
)

const AssetRow = ({
  network,
  title,
  token,
}: {
  network: BaseConfig | undefined
  title: ReactNode
  token: { symbol?: string; address?: string } | undefined
}) => (
  <Stack>
    <Typography variant="bodyMBold" color="textSecondary">
      {title}
    </Typography>
    <AddressActionInfo
      network={network}
      title={
        <TokenLabel
          blockchainId={network?.id}
          tooltip={token?.symbol}
          address={token?.address}
          label={token?.symbol ?? ''}
        />
      }
      address={token?.address}
    />
  </Stack>
)

export const MarketContractsSection = ({ chainId, market, network }: MarketContractsProps) => {
  const isMobile = useIsMobile()
  const { collateralToken, borrowToken } = maybe(market, getTokens) ?? {}
  const { data: oracleAddress, isLoading: oracleAddressIsLoading } = useMarketOracleAddress({
    chainId,
    marketId: market?.id,
  })

  const assetsLoading = !network || !market
  const contractsLoading = assetsLoading || oracleAddressIsLoading
  const isLendMarket = market instanceof LendMarketTemplate
  const gaugeAddress = market instanceof LendMarketTemplate ? market.addresses.gauge : undefined

  const infraAddressItems = notFalsy<AddressItem>(
    market && { key: 'oracle', label: t`Oracle`, address: oracleAddress },
    market && { key: 'amm', label: t`AMM`, address: isLendMarket ? market.addresses.amm : market.address },
    isLendMarket && { key: 'vault', label: t`Vault`, address: market.addresses.vault },
    market && {
      key: 'controller',
      label: t`Controller`,
      address: isLendMarket ? market.addresses.controller : market.controller,
    },
    market && {
      key: 'rate-policy',
      label: t`Rate policy`,
      labelTooltip: {
        title: t`The rule set that controls how fast borrow costs rise or fall as market conditions change.`,
      },
      address: isLendMarket ? market.addresses.monetary_policy : market.monetaryPolicy,
    },
  )

  return (
    <Stack>
      <Card size="inline">
        <CardHeader title={t`Assets`} />
        <CardContent component={Stack} sx={{ marginBlock: Spacing.sm }}>
          <WithSkeleton loading={assetsLoading} variant="rectangular" height="4lh" width="100%">
            <Stack>
              <AssetRow network={network} title={t`Collateral`} token={collateralToken} />
              <AssetRow network={network} title={t`Borrowed`} token={borrowToken} />
            </Stack>
          </WithSkeleton>
        </CardContent>
      </Card>

      <Card size="inline">
        <CardHeader title={isMobile ? t`Market Contracts` : t`Contracts`} />
        <CardContent component={Stack} sx={{ marginBlock: Spacing.sm }}>
          <WithSkeleton loading={contractsLoading} variant="rectangular" height="8lh" width="100%">
            <Stack>
              {infraAddressItems.map(({ key, label, labelTooltip, address }) => (
                <AddressActionInfo
                  key={key}
                  network={network}
                  title={label}
                  labelTooltip={labelTooltip}
                  address={address}
                />
              ))}
              {gaugeAddress &&
                (gaugeAddress === zeroAddress ? (
                  <ActionInfo label={t`Gauge`} value={t`No gauge`} />
                ) : (
                  <AddressActionInfo network={network} title={<GaugeLabel />} address={gaugeAddress} />
                ))}
            </Stack>
          </WithSkeleton>
        </CardContent>
        <ActionInfo label={t`Market ID`} value={market?.id} loading={!market?.id} />
      </Card>
    </Stack>
  )
}
