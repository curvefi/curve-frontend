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
import { TabsSwitcher } from '@ui/components/Tabs/TabsSwitcher'
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

/** Sits beside the table titles on desktop and between the stacked tables below it. */
const MigrationArrow = () => (
  <Stack sx={{ alignSelf: { mobile: 'center', desktop: 'start' } }}>
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
  const candidates = useMemo(
    () => (selected && curvePools.data ? findCurveTargets(selected, recordValues(curvePools.data)) : []),
    [selected, curvePools.data],
  )
  const targetRows = useCurveTargetRows({ network, position: selected, candidates })
  const { targets } = targetRows
  const target = targets.find(({ pool }) => pool.address === targetAddress) ?? targets[0]
  const targetRow = targetRows.rows.find(({ address }) => address === target?.pool.address)

  const isReady = !!userAddress && isSupportedChain
  return (
    <DetailPageLayout
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
                  targetRow={targetRow}
                />
              ),
            }
          : null
      }
      testId="balancer-migration-page"
    >
      {isReady ? (
        <Stack>
          <TabsSwitcher
            variant="contained"
            value="migrate"
            options={[{ value: 'migrate', label: t`Migrate your Balancer positions` }]}
          />
          <Stack
            direction={{ mobile: 'column', desktop: 'row' }}
            sx={{ gap: Spacing.md, padding: Spacing.md, backgroundColor: t => t.design.Layer[1].Fill }}
          >
            <Stack sx={{ flex: 1, minWidth: 0 }}>
              <BalancerPositionsTable
                blockchainId={blockchainId}
                query={q(positions)}
                selectedId={selected?.id}
                onSelect={({ id }) => {
                  setSelectedId(id)
                  setTargetAddress(undefined)
                }}
                onReload={positions.refetch}
              />
            </Stack>
            {!!positions.data?.length && (
              <>
                <MigrationArrow />
                <Stack sx={{ flex: 1, minWidth: 0 }}>
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
                  />
                </Stack>
              </>
            )}
          </Stack>
        </Stack>
      ) : userAddress ? (
        <Alert variant="outlined" severity="info">{t`Balancer migration isn't available on this network.`}</Alert>
      ) : (
        <ConnectWalletPrompt description={t`Connect your wallet to see your Balancer positions.`} />
      )}
    </DetailPageLayout>
  )
}
