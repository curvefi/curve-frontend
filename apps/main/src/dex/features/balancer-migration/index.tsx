import { useMemo, useState } from 'react'
import { useConnection } from 'wagmi'
import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import { usePoolsPricesApi } from '@/dex/queries/pools-prices-api.query'
import { getPricesApiBlockchainId } from '@curvefi/prices-api'
import { ConnectWalletPrompt } from '@evm-ui/features/connect-wallet'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import { recordValues } from '@primitives/objects.utils'
import { PageHeader } from '@ui/components/PageHeader'
import { DetailPageLayout } from '@ui/features/layout/DetailPageLayout/DetailPageLayout'
import { q } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ArrowDownIcon } from '@ui/icons/ArrowDownIcon'
import { t } from '@ui/lib/i18n'
import { getBalancerChain } from './api/balancer.api'
import { BalancerPositionsTable } from './components/BalancerPositionsTable'
import { CurvePoolsTable } from './components/CurvePoolsTable'
import { MigrationFormTabs } from './components/MigrationFormTabs'
import { useCurveTargetRows } from './hooks/useCurveTargetRows'
import { findCurveTargets } from './migration.utils'
import { useBalancerPositions } from './queries/balancer-positions.query'

const { Spacing } = SizesAndSpaces

const MigrationArrow = () => (
  <Stack sx={{ alignSelf: 'center', color: t => t.design.Text.TextColors.Secondary }}>
    <ArrowDownIcon sx={{ transform: { desktop: 'rotate(-90deg)' } }} />
  </Stack>
)

export const PageBalancerMigration = () => {
  const network = useNetworkFromUrl()
  const { address: userAddress } = useConnection()
  const chainId = network?.chainId
  const blockchainId = network?.blockchainId ?? 'ethereum'
  const isSupportedChain = chainId != null && !!getBalancerChain(chainId)

  const positions = useBalancerPositions({ chainId, userAddress }, isSupportedChain)
  const curvePools = usePoolsPricesApi({ blockchainId: getPricesApiBlockchainId(blockchainId) })
  const [selectedId, setSelectedId] = useState<string>()
  const [targetAddress, setTargetAddress] = useState<Address>()

  const selected = positions.data?.find(({ id }) => id === selectedId) ?? positions.data?.[0]
  const targets = useMemo(
    () => (selected && curvePools.data ? findCurveTargets(selected, recordValues(curvePools.data)) : []),
    [selected, curvePools.data],
  )
  const target = targets.find(({ pool }) => pool.address === targetAddress) ?? targets[0]
  const targetRows = useCurveTargetRows({ network, targets })

  const isReady = !!userAddress && isSupportedChain
  return (
    <DetailPageLayout
      header={
        <PageHeader
          title={t`Migrate from Balancer`}
          subtitle={t`Balancer is winding down. Move your liquidity into a Curve pool with the same tokens in one transaction.`}
        />
      }
      formTabs={
        isReady && selected && chainId != null
          ? {
              // Wait for Curve pools so the form starts with the best target selected; the layout shows a skeleton.
              content: curvePools.data && (
                <MigrationFormTabs
                  // Remount per position so the amount resets.
                  key={selected.id}
                  chainId={chainId}
                  blockchainId={blockchainId}
                  position={selected}
                  target={target}
                />
              ),
            }
          : null
      }
      testId="balancer-migration-page"
    >
      {isReady ? (
        <Stack direction={{ mobile: 'column', desktop: 'row' }} sx={{ gap: Spacing.md, alignItems: 'start' }}>
          <Stack sx={{ flex: 1, width: '100%' }}>
            <BalancerPositionsTable
              blockchainId={blockchainId}
              query={q(positions)}
              selectedId={selected?.id}
              onSelect={({ id }) => {
                setSelectedId(id)
                setTargetAddress(undefined)
              }}
              onReload={positions.refetch}
              isFetching={positions.isFetching}
            />
          </Stack>
          {!!positions.data?.length && (
            <>
              <MigrationArrow />
              <Stack sx={{ flex: 2, width: '100%' }}>
                <CurvePoolsTable
                  query={q({
                    data: curvePools.data && targetRows.rows,
                    isLoading: curvePools.isLoading,
                    error: curvePools.error,
                  })}
                  alerts={targetRows.alerts}
                  selectedAddress={target?.pool.address}
                  onSelect={({ address }) => setTargetAddress(address)}
                  onReload={curvePools.refetch}
                  isFetching={curvePools.isFetching || targetRows.isFetching}
                />
              </Stack>
            </>
          )}
        </Stack>
      ) : userAddress ? (
        <Alert variant="outlined" severity="info">{t`Balancer migration isn't available on this network.`}</Alert>
      ) : (
        <ConnectWalletPrompt description={t`Connect your wallet to see your Balancer positions.`} />
      )}
    </DetailPageLayout>
  )
}
