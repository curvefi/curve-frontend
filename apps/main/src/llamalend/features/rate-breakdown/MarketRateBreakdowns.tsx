import { useMemo, type ReactNode } from 'react'
import { useMarketContext } from '@/llamalend/features/market-context'
import type { MarketToken } from '@/llamalend/llama.utils'
import { aprToApy } from '@/llamalend/rates.utils'
import {
  type BorrowRate,
  type SupplyRate,
  usePageHeaderRates,
} from '@/llamalend/widgets/page-header/hooks/usePageHeader'
import type { CampaignRewards } from '@evm-ui/entities/campaigns'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { useCopyToClipboard } from '@evm-ui/hooks/useCopyToClipboard'
import { t } from '@evm-ui/lib/i18n'
import { useTokenUsdRate, useTokenUsdRates } from '@evm-ui/lib/model/entities/token-usd-rate'
import { Badge } from '@evm-ui/shared/ui/Badge'
import {
  CLICKABLE_IN_ROW_CLASS,
  createAppColumnHelper,
  type CurveTableFeatures,
  useCurveTable,
} from '@evm-ui/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@evm-ui/shared/ui/DataTable/DataTable'
import { InlineTableCell } from '@evm-ui/shared/ui/DataTable/inline-cells/InlineTableCell'
import { ExternalLink } from '@evm-ui/shared/ui/ExternalLink'
import { RewardIcon } from '@evm-ui/shared/ui/RewardIcon'
import { TokenInfo, type TokenInfoProps } from '@evm-ui/shared/ui/TokenInfo'
import { Tooltip } from '@evm-ui/shared/ui/Tooltip'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { constQ, mapQuery, type QueryProp } from '@evm-ui/types/util'
import { Chain, formatNumber, MAINNET_CRV_ADDRESS, shortenAddress } from '@evm-ui/utils'
import { scanTokenPath } from '@legacy-ui/utils'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import { notFalsy } from '@primitives/objects.utils'
import type { Column, ColumnVisibilityState } from '@tanstack/react-table'

const { Spacing } = SizesAndSpaces

type BreakdownSource = {
  tokenInfo: TokenInfoProps
  address?: string
  explorerUrl?: string
  yieldBearing?: boolean
}

export type RateBreakdownRow = {
  source: BreakdownSource
  price?: number
  rate?: number | null
  maxBoostRate?: number | null
}

export type PointsCampaignRow = {
  source: TokenInfoProps
  multiplier: string
  campaignUrl: string
}

export type RateBreakdownData = {
  rows: RateBreakdownRow[]
  points: PointsCampaignRow[]
  total: number | null
  maxBoostTotal?: number | null
  hasAdjustments: boolean
}

type TokenPrices = Record<string, number> | undefined

const tokenPrice = (prices: TokenPrices, address: string, fallback?: number) => prices?.[address] ?? fallback

const pointsRows = (campaigns: CampaignRewards[]): PointsCampaignRow[] =>
  campaigns
    .filter(({ reward, symbol }) => reward?.type === 'points' || (!reward?.type && symbol))
    .map(({ dashboardLink, reward, platform, platformImageId, symbol }) => ({
      source: {
        icon: <RewardIcon src={platformImageId} alt={platform} size="lg" />,
        iconPosition: 'left',
        primary: platform,
      },
      multiplier: reward?.value != null || symbol == null ? formatNumber(reward?.value, 'multiplier') : symbol,
      campaignUrl: dashboardLink,
    }))

// eslint-disable-next-line react-refresh/only-export-components -- Exported for deterministic table coverage.
export const buildBorrowRateBreakdown = ({
  rate,
  chainId,
  blockchainId,
  collateralToken,
  prices,
}: {
  rate: BorrowRate
  chainId: number
  blockchainId: string
  collateralToken: MarketToken | undefined
  prices?: Record<string, number>
}): RateBreakdownData => {
  const incentives = notFalsy(
    ...rate.extraRewards.map(campaign => campaign.reward?.type === 'apr' && { ...campaign, reward: campaign.reward }),
  )
  const rebasingRow = notFalsy(
    rate.rebasingYield != null && collateralToken
      ? {
          source: {
            tokenInfo: {
              address: collateralToken.address,
              blockchainId,
              iconPosition: 'left' as const,
              primary: collateralToken.symbol,
            },
            address: collateralToken.address,
            explorerUrl: scanTokenPath(chainId, collateralToken.address),
            yieldBearing: true,
          },
          price: tokenPrice(prices, collateralToken.address),
          rate: -rate.rebasingYield,
        }
      : false,
  )

  return {
    rows: [
      ...incentives.map(({ platform, platformImageId, reward, symbol }) => ({
        source: {
          tokenInfo: {
            icon: <RewardIcon src={platformImageId} alt={platform} size="lg" />,
            iconPosition: 'left' as const,
            primary: symbol ?? platform,
          },
          address: reward.address,
          explorerUrl: scanTokenPath(chainId, reward.address),
        },
        price: tokenPrice(prices, reward.address, reward.price),
        rate: -reward.value,
      })),
      ...rebasingRow,
      {
        source: { tokenInfo: { icon: null, iconPosition: 'left', primary: t`Borrow APR` } },
        rate: rate.rate,
      },
    ],
    points: pointsRows(rate.extraRewards),
    total: rate.totalBorrowRate,
    hasAdjustments: incentives.length > 0 || rate.rebasingYield != null,
  }
}

// eslint-disable-next-line react-refresh/only-export-components -- Exported for deterministic table coverage.
export const buildSupplyRateBreakdown = ({
  rate,
  chainId,
  blockchainId,
  borrowToken,
  prices,
  crvPrice,
}: {
  rate: SupplyRate
  chainId: number
  blockchainId: string
  borrowToken: MarketToken | undefined
  prices?: Record<string, number>
  crvPrice?: number
}): RateBreakdownData => {
  const crvRates = [rate.supplyApyCrvMinBoost, rate.supplyApyCrvMaxBoost]
  const crvRow: RateBreakdownRow[] = notFalsy(
    crvRates.some(Boolean) && {
      source: {
        tokenInfo: {
          address: MAINNET_CRV_ADDRESS,
          blockchainId: 'ethereum',
          iconPosition: 'left',
          primary: 'CRV',
        },
        address: MAINNET_CRV_ADDRESS,
        explorerUrl: scanTokenPath(Chain.Ethereum, MAINNET_CRV_ADDRESS),
      },
      price: crvPrice,
      rate: rate.supplyApyCrvMinBoost,
      maxBoostRate: rate.supplyApyCrvMaxBoost,
    },
  )
  const directIncentives = rate.extraIncentives.filter(({ address }) => address.toLowerCase() !== MAINNET_CRV_ADDRESS)
  const campaigns = notFalsy(
    ...rate.extraRewards.map(campaign => campaign.reward?.type === 'apr' && { ...campaign, reward: campaign.reward }),
  )
  const rebasingRow = notFalsy(
    rate.rebasingYield != null && borrowToken
      ? {
          source: {
            tokenInfo: {
              address: borrowToken.address,
              blockchainId,
              iconPosition: 'left' as const,
              primary: borrowToken.symbol,
            },
            address: borrowToken.address,
            explorerUrl: scanTokenPath(chainId, borrowToken.address),
            yieldBearing: true,
          },
          price: tokenPrice(prices, borrowToken.address),
          rate: rate.rebasingYield,
        }
      : false,
  )

  return {
    rows: [
      ...crvRow,
      ...directIncentives.map(({ address, blockchainId, percentage, title }) => ({
        source: {
          tokenInfo: { address, blockchainId, iconPosition: 'left' as const, primary: title },
          address,
          explorerUrl: scanTokenPath(chainId, address),
        },
        price: tokenPrice(prices, address),
        rate: percentage,
      })),
      ...campaigns.map(({ platform, platformImageId, reward, symbol }) => ({
        source: {
          tokenInfo: {
            icon: <RewardIcon src={platformImageId} alt={platform} size="lg" />,
            iconPosition: 'left' as const,
            primary: symbol ?? platform,
          },
          address: reward.address,
          explorerUrl: scanTokenPath(chainId, reward.address),
        },
        price: tokenPrice(prices, reward.address, reward.price),
        rate: aprToApy(reward.value),
      })),
      ...rebasingRow,
      {
        source: { tokenInfo: { icon: null, iconPosition: 'left', primary: t`Supply APY` } },
        rate: rate.supplyApy,
      },
    ],
    points: pointsRows(rate.extraRewards),
    total: rate.totalMinBoost,
    maxBoostTotal: rate.totalMaxBoost,
    hasAdjustments:
      crvRow.length > 0 || directIncentives.length > 0 || campaigns.length > 0 || rate.rebasingYield != null,
  }
}

enum RateColumnId {
  Source = 'source',
  Price = 'price',
  Rate = 'rate',
}

enum PointsColumnId {
  Source = 'source',
  Multiplier = 'multiplier',
  CampaignUrl = 'campaignUrl',
}

const SourceCell = ({ source: { tokenInfo, address, explorerUrl, yieldBearing } }: { source: BreakdownSource }) => {
  address = address ?? ('address' in tokenInfo ? tokenInfo.address : undefined)
  const copyAddress = useCopyToClipboard({ copyText: address })

  return (
    <InlineTableCell>
      <Tooltip
        title={explorerUrl && <ExternalLink href={explorerUrl} label={t`View on explorer`} />}
        placement="top"
        clickable={!!explorerUrl}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: Spacing.xs }}>
          <TokenInfo
            {...tokenInfo}
            boldPrimary
            secondary={
              !useIsMobile() &&
              address && (
                <Box
                  component="span"
                  className={CLICKABLE_IN_ROW_CLASS}
                  onClick={event => {
                    event.stopPropagation()
                    copyAddress()
                  }}
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                >
                  {shortenAddress(address)}
                </Box>
              )
            }
          />
          {yieldBearing && <Badge size="extraSmall" label={t`Yield bearing`} sx={{ alignSelf: 'flex-end' }} />}
        </Box>
      </Tooltip>
    </InlineTableCell>
  )
}

const rateColumnHelper = createAppColumnHelper<RateBreakdownRow>()
const rateColumns = (rateHeader: string) =>
  rateColumnHelper.columns([
    rateColumnHelper.accessor('source', {
      id: RateColumnId.Source,
      header: t`Source`,
      cell: ({ getValue }) => <SourceCell source={getValue()} />,
      enableSorting: false,
    }),
    rateColumnHelper.accessor('price', {
      id: RateColumnId.Price,
      header: t`Price`,
      cell: ({ getValue }) => (
        <InlineTableCell>
          <Typography>{formatNumber(getValue(), 'usd.precise')}</Typography>
        </InlineTableCell>
      ),
      enableSorting: false,
      meta: { type: 'numeric' },
    }),
    rateColumnHelper.accessor('rate', {
      id: RateColumnId.Rate,
      header: rateHeader,
      cell: ({ getValue, row }) => (
        <InlineTableCell sx={{ alignItems: 'end' }}>
          <TokenInfo
            icon={null}
            iconPosition="right"
            primary={formatNumber(getValue(), 'percent.rate')}
            secondary={
              row.original.maxBoostRate != null && row.original.maxBoostRate !== getValue()
                ? t`Max boost ${formatNumber(row.original.maxBoostRate, 'percent.rate')}`
                : undefined
            }
          />
        </InlineTableCell>
      ),
      enableSorting: false,
      meta: { type: 'numeric' },
    }),
  ])

const BORROW_COLUMNS = rateColumns(t`APR`)
const SUPPLY_COLUMNS = rateColumns(t`APY`)
const MOBILE_COLUMN_VISIBILITY = {
  [RateColumnId.Source]: true,
  [RateColumnId.Price]: false,
  [RateColumnId.Rate]: true,
} satisfies ColumnVisibilityState

const pointsColumnHelper = createAppColumnHelper<PointsCampaignRow>()
const POINTS_COLUMNS = pointsColumnHelper.columns([
  pointsColumnHelper.accessor('source', {
    id: PointsColumnId.Source,
    header: t`Source`,
    cell: ({ getValue }) => (
      <InlineTableCell>
        <TokenInfo {...getValue()} boldPrimary />
      </InlineTableCell>
    ),
    enableSorting: false,
  }),
  pointsColumnHelper.accessor('multiplier', {
    id: PointsColumnId.Multiplier,
    header: t`Multiplier`,
    cell: ({ getValue }) => (
      <InlineTableCell>
        <Typography>{getValue()}</Typography>
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
  pointsColumnHelper.accessor('campaignUrl', {
    id: PointsColumnId.CampaignUrl,
    header: t`Details`,
    cell: ({ getValue }) => (
      <InlineTableCell>
        <ExternalLink
          href={getValue()}
          label={<Box component="span" sx={{ display: { mobile: 'none', tablet: 'inline' } }}>{t`To campaign`}</Box>}
          sx={{ justifyContent: 'end' }}
        />
      </InlineTableCell>
    ),
    enableSorting: false,
    meta: { type: 'numeric' },
  }),
])

const FooterRow = ({
  visibleColumns,
  title,
  total,
  maxBoostTotal,
}: {
  visibleColumns: Column<CurveTableFeatures, RateBreakdownRow>[]
  title: ReactNode
  total: number | null
  maxBoostTotal?: number | null
}) =>
  visibleColumns.map(({ id }) => {
    if (id === 'source')
      return (
        <TableCell key={id} sx={{ paddingInline: Spacing.md }}>
          <Typography variant="tableCellMBold">{title}</Typography>
        </TableCell>
      )
    if (id === 'price') return <TableCell key={id} />
    return (
      <TableCell key={id} sx={{ paddingInline: Spacing.md, paddingBlock: Spacing.sm, textAlign: 'right' }}>
        <Typography variant="tableCellMBold">{formatNumber(total, 'percent.rate')}</Typography>
        {maxBoostTotal != null && maxBoostTotal !== total && (
          <Typography variant="tableCellSRegular" color="textSecondary">
            {t`Max boost ${formatNumber(maxBoostTotal, 'percent.rate')}`}
          </Typography>
        )}
      </TableCell>
    )
  })

export const RateBreakdownTable = ({
  rateType,
  query,
}: {
  rateType: 'borrow' | 'supply'
  query: QueryProp<RateBreakdownData>
}) => {
  const isBorrow = rateType === 'borrow'
  const table = useCurveTable({
    query: mapQuery(query, ({ rows }) => rows),
    columns: isBorrow ? BORROW_COLUMNS : SUPPLY_COLUMNS,
    state: { columnVisibility: useIsMobile() ? MOBILE_COLUMN_VISIBILITY : undefined },
  })
  const showFooter = query.data && (!isBorrow || query.data.hasAdjustments)

  return (
    <Card size="small" data-testid={`${rateType}-rate-breakdown`}>
      <CardHeader title={isBorrow ? t`Borrow Cost Breakdown` : t`Yield Breakdown`} size="small" />
      <DataTable
        category="detail"
        table={table}
        emptyState={{ title: isBorrow ? t`No borrow cost breakdown found` : t`No yield breakdown found` }}
        errorState={{ title: isBorrow ? t`Could not load borrow cost breakdown` : t`Could not load yield breakdown` }}
        footerRow={
          showFooter && (
            <FooterRow
              visibleColumns={table.getVisibleLeafColumns()}
              title={isBorrow ? t`Net Borrow APR` : t`Total APY`}
              total={query.data!.total}
              maxBoostTotal={query.data!.maxBoostTotal}
            />
          )
        }
      />
    </Card>
  )
}

export const PointsCampaignsTable = ({
  rateType,
  rows,
}: {
  rateType: 'borrow' | 'supply'
  rows: PointsCampaignRow[]
}) => {
  const table = useCurveTable({
    query: constQ(rows),
    columns: POINTS_COLUMNS,
  })

  return (
    <Card size="small" data-testid={`${rateType}-points-campaigns`}>
      <CardHeader title={t`Points Campaigns`} size="small" />
      <DataTable category="detail" table={table} emptyState={{ title: t`No points campaigns found` }} />
    </Card>
  )
}

export const MarketRateBreakdowns = ({ showBorrow, showSupply }: { showBorrow?: boolean; showSupply?: boolean }) => {
  const {
    chainId,
    blockchainId,
    tokens: { collateralToken, borrowToken },
  } = useMarketContext()
  const { borrowRate, supplyRate } = usePageHeaderRates()
  const addresses = useMemo(
    () =>
      notFalsy(
        showBorrow && collateralToken?.address,
        showSupply && borrowToken?.address,
        ...(borrowRate.data?.extraRewards.map(({ reward }) => showBorrow && reward?.type === 'apr' && reward.address) ??
          []),
        ...(supplyRate?.data?.extraIncentives.map(
          ({ address }) => showSupply && address.toLowerCase() !== MAINNET_CRV_ADDRESS && address,
        ) ?? []),
        ...(supplyRate?.data?.extraRewards.map(
          ({ reward }) => showSupply && reward?.type === 'apr' && reward.address,
        ) ?? []),
      ),
    [borrowRate.data?.extraRewards, borrowToken, collateralToken, showBorrow, showSupply, supplyRate?.data],
  )
  const { data: prices } = useTokenUsdRates({ chainId, tokenAddresses: addresses }, addresses.length > 0)
  const { data: crvPrice } = useTokenUsdRate({
    chainId: Chain.Ethereum,
    tokenAddress: showSupply ? MAINNET_CRV_ADDRESS : undefined,
  })
  const borrowQuery = mapQuery(borrowRate, rate =>
    buildBorrowRateBreakdown({ rate, chainId, blockchainId, collateralToken, prices }),
  )
  const supplyQuery = supplyRate
    ? mapQuery(supplyRate, rate =>
        buildSupplyRateBreakdown({ rate, chainId, blockchainId, borrowToken, prices, crvPrice }),
      )
    : undefined

  return (
    <Stack sx={{ gap: Spacing.md }}>
      {showBorrow && (
        <>
          <RateBreakdownTable rateType="borrow" query={borrowQuery} />
          {!!borrowQuery.data?.points.length && (
            <PointsCampaignsTable rateType="borrow" rows={borrowQuery.data.points} />
          )}
        </>
      )}
      {showSupply && supplyQuery && (
        <>
          <RateBreakdownTable rateType="supply" query={supplyQuery} />
          {!!supplyQuery.data?.points.length && (
            <PointsCampaignsTable rateType="supply" rows={supplyQuery.data.points} />
          )}
        </>
      )}
    </Stack>
  )
}
