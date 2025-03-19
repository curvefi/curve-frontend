import styled from 'styled-components'
import TextInput from '@/dex/components/PageCreatePool/components/TextInput'
import useStore from '@/dex/store/useStore'
import Box from '@ui/Box'
import { t } from '@ui-kit/lib/i18n'

const PoolInfo = () => {
  const poolName = useStore((state) => state.createPool.poolName)
  const poolSymbol = useStore((state) => state.createPool.poolSymbol)
  const updatePoolName = useStore((state) => state.createPool.updatePoolName)
  const updatePoolSymbol = useStore((state) => state.createPool.updatePoolSymbol)

  return (
    <>
      <Wrapper flex flexColumn>
        <Row flexJustifyContent={'space-between'}>
          <TextInput value={poolName} onChange={updatePoolName} maxLength={32} label={t`Pool Name (e.g. stETH/ETH)`} />
          <TextInput
            value={poolSymbol}
            onChange={updatePoolSymbol}
            maxLength={10}
            label={t`Pool Symbol (e.g. stETHETH)`}
          />
        </Row>
      </Wrapper>
    </>
  )
}

const Wrapper = styled(Box)`
  margin: 0 var(--spacing-normal) var(--spacing-normal);
  padding: var(--spacing-narrow) 0 var(--spacing-wide);
  min-height: 380px;
`

const Row = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
  @media (min-width: 31.25rem) {
    flex-direction: row;
  }
`

export default PoolInfo
