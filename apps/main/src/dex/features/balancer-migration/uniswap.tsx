import { useMemo, useState } from 'react'
import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import { maybe } from '@primitives/objects.utils'
import { getUniswapV3 } from './api/uniswap.api'
import { CurvePoolsTable } from './components/CurvePoolsTable'
import { UniswapMigrationFormTabs } from './components/MigrationFormTabs'
import { MigrationPage } from './components/MigrationPage'
import { UniswapCurveComparison } from './components/UniswapCurveComparison'
import { UniswapPositionsTable } from './components/UniswapPositionsTable'
import { useCurveTargets } from './hooks/useCurveTargets'
import { useMigrationUser } from './hooks/useMigrationUser'
import { useUniswapPositionRows } from './hooks/useUniswapPositionRows'
import { getUniswapClassification } from './migration.utils'

export const PageUniswapMigration = () => {
  const network = useNetworkFromUrl()
  const userAddress = useMigrationUser()
  const chainId = network?.chainId
  const blockchainId = network?.blockchainId ?? 'ethereum'
  const isSupportedChain = chainId != null && !!getUniswapV3(chainId)

  const positions = useUniswapPositionRows({ chainId, userAddress }, isSupportedChain)
  const [selectedId, setSelectedId] = useState<string>()
  const selected = positions.query.data?.find(({ id }) => id === selectedId) ?? positions.query.data?.[0]
  const { target, isLoaded, setTargetAddress, tableProps } = useCurveTargets({
    network,
    sourceTokens: useMemo(() => selected?.tokens.map(({ address }) => [address.toLowerCase()]), [selected?.tokens]),
    classification: maybe(selected?.fee, getUniswapClassification),
  })

  return (
    <MigrationPage
      source="uniswap"
      blockchainId={blockchainId}
      isSupportedChain={isSupportedChain}
      sourceTable={
        <UniswapPositionsTable
          blockchainId={blockchainId}
          query={positions.query}
          selectedId={selected?.id}
          onSelect={({ id }) => {
            setSelectedId(id)
            setTargetAddress(undefined)
          }}
          onReload={positions.refetch}
        />
      }
      targetTable={!!positions.query.data?.length && <CurvePoolsTable {...tableProps} />}
      details={selected && target && <UniswapCurveComparison position={selected} target={target} />}
      showForm={!!userAddress && !!selected}
      form={
        userAddress &&
        selected &&
        chainId != null &&
        isLoaded && (
          <UniswapMigrationFormTabs
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
