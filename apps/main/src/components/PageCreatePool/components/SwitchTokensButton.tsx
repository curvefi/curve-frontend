import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import Icon from '@/ui/Icon'
import IconButton from '@/ui/IconButton'

type Props = {
  curve: CurveApi
  chainId: ChainId
  from: 'tokenA' | 'tokenB' | 'tokenC'
  to: 'tokenB' | 'tokenC' | 'tokenD'
  disabled?: boolean
  className?: string
}

const SwitchTokensButton = ({ curve, chainId, from, to, disabled, className }: Props) => {
  const { tokenA, tokenB, tokenC, tokenD } = useStore((state) => state.createPool.tokensInPool)
  const updateTokensInPool = useStore((state) => state.createPool.updateTokensInPool)

  const handleClick = () => {
    // switch between token A and B
    if (from === 'tokenA') {
      updateTokensInPool(curve, tokenB, tokenA, tokenC, tokenD, chainId)
    }
    if (from === 'tokenB' && to === 'tokenC') {
      updateTokensInPool(curve, tokenA, tokenC, tokenB, tokenD, chainId)
    }
    if (from === 'tokenC' && to === 'tokenD') {
      updateTokensInPool(curve, tokenA, tokenB, tokenD, tokenC, chainId)
    }
  }

  return (
    <IconButton className={className} disabled={disabled} onClick={handleClick} size="medium">
      <StyledArrowsVertical name={'ArrowsVertical'} size={20} aria-label={t`Switch tokens`} />
    </IconButton>
  )
}

const StyledArrowsVertical = styled(Icon)`
  color: var(--box--primary--color);
`

export default SwitchTokensButton
