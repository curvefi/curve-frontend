import { useMemo, useState } from 'react'
import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import { maybe } from '@primitives/objects.utils'
import { q } from '@ui/features/queries/util'
import { getBalancerChain } from './api/balancer.api'
import { BalancerPositionsTable } from './components/BalancerPositionsTable'
import { CurvePoolsTable } from './components/CurvePoolsTable'
import { MigrationFormTabs } from './components/MigrationFormTabs'
import { MigrationPage } from './components/MigrationPage'
import { useCurveTargets } from './hooks/useCurveTargets'
import { useMigrationUser } from './hooks/useMigrationUser'
import { getBalancerClassification, getBalancerTokenAddresses } from './migration.utils'
import { useBalancerPositions } from './queries/balancer-positions.query'

export const PageBalancerMigration = () => {
  const network = useNetworkFromUrl()
  const userAddress = useMigrationUser()
  const chainId = network?.chainId
  const blockchainId = network?.blockchainId ?? 'ethereum'
  const isSupportedChain = chainId != null && !!getBalancerChain(chainId)

  const positions = useBalancerPositions({ chainId, userAddress }, isSupportedChain)
  const [selectedId, setSelectedId] = useState<string>()
  const selected = positions.data?.find(({ id }) => id === selectedId) ?? positions.data?.[0]
  const { target, isLoaded, setTargetAddress, tableProps } = useCurveTargets({
    network,
    sourceTokens: useMemo(() => maybe(selected, getBalancerTokenAddresses), [selected]),
    classification: maybe(selected?.type, getBalancerClassification),
  })

  return (
    <MigrationPage
      source="balancer"
      blockchainId={blockchainId}
      isSupportedChain={isSupportedChain}
      sourceTable={
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
      }
      targetTable={!!positions.data?.length && <CurvePoolsTable {...tableProps} />}
      showForm={!!userAddress && !!selected}
      form={
        userAddress &&
        selected &&
        chainId != null &&
        isLoaded && (
          <MigrationFormTabs
            // Remount per position so the amount resets.
            key={selected.id}
            chainId={chainId}
            userAddress={userAddress}
            blockchainId={blockchainId}
            position={selected}
            target={target}
          />
        )
      }
    />
  )
}
