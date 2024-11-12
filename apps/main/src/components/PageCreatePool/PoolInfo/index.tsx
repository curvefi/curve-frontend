import styled from 'styled-components'
import { t } from '@lingui/macro'
import useStore from '@/store/useStore'
import { STABLESWAP } from '@/components/PageCreatePool/constants'
import Box from '@/ui/Box'
import Button from '@/ui/Button'
import TextInput from '@/components/PageCreatePool/components/TextInput'

type Props = {
  chainId: ChainId
}

const PoolInfo = ({ chainId }: Props) => {
  const networks = useStore((state) => state.networks.networks)
  const swapType = useStore((state) => state.createPool.swapType)
  const poolName = useStore((state) => state.createPool.poolName)
  const poolSymbol = useStore((state) => state.createPool.poolSymbol)
  const assetType = useStore((state) => state.createPool.assetType)
  const updatePoolName = useStore((state) => state.createPool.updatePoolName)
  const updatePoolSymbol = useStore((state) => state.createPool.updatePoolSymbol)
  const updateAssetType = useStore((state) => state.createPool.updateAssetType)

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
        {swapType === STABLESWAP && !networks[chainId].stableswapFactory && (
          <>
            <TagButtonsWrapper flex flexColumn>
              <TagsTitle>{t`Set pool asset type tag:`}</TagsTitle>
              <Row>
                <TagButton
                  nowrap
                  className={assetType === 'USD' ? 'active' : ''}
                  size="small"
                  variant="select"
                  onClick={() => updateAssetType('USD')}
                >
                  USD
                </TagButton>
                <TagButton
                  nowrap
                  className={assetType === 'ETH' ? 'active' : ''}
                  size="small"
                  variant="select"
                  onClick={() => updateAssetType('ETH')}
                >
                  ETH
                </TagButton>
                <TagButton
                  nowrap
                  className={assetType === 'BTC' ? 'active' : ''}
                  size="small"
                  variant="select"
                  onClick={() => updateAssetType('BTC')}
                >
                  BTC
                </TagButton>
                <TagButton
                  nowrap
                  className={assetType === 'OTHER' ? 'active' : ''}
                  size="small"
                  variant="select"
                  onClick={() => updateAssetType('OTHER')}
                >
                  OTHER
                </TagButton>
              </Row>
            </TagButtonsWrapper>
          </>
        )}
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

const TagButtonsWrapper = styled(Box)`
  display: flex;
  margin: var(--spacing-normal) 0;
`

const TagsTitle = styled.p`
  font-size: var(--font-size-2);
  margin: var(--spacing-narrow) var(--spacing-2) var(--spacing-2);
  color: var(--box--primary--color);
`

const TagButton = styled(Button)`
  margin-right: var(--spacing-2);
  &:hover:not(:disabled) {
    background: var(--dropdown--active--background-color);
    color: var(--button-text-contrast--color);
    border-color: var(--button--border-color);
    box-shadow: 3px 3px 0 var(--button--shadow-color);
  }
  &.active:not(:disabled) {
    background: var(--dropdown--active--background-color);
    color: var(--button-text-contrast--color);
    &:hover {
      background-color: var(--button_filled-hover-contrast--background-color);
      color: var(--button-text-contrast--color);
      border-color: var(--button--border-color);
    }
  }
`

export default PoolInfo
