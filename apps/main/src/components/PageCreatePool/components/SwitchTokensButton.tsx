import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@main/store/useStore'
import {
  TOKEN_A,
  TOKEN_B,
  TOKEN_C,
  TOKEN_D,
  TOKEN_E,
  TOKEN_F,
  TOKEN_G,
  TOKEN_H,
} from '@main/components/PageCreatePool/constants'

import Icon from '@ui/Icon'
import IconButton from '@ui/IconButton'
import { CurveApi, ChainId } from '@main/types/main.types'

type Props = {
  curve: CurveApi
  chainId: ChainId
  from:
    | typeof TOKEN_A
    | typeof TOKEN_B
    | typeof TOKEN_C
    | typeof TOKEN_D
    | typeof TOKEN_E
    | typeof TOKEN_F
    | typeof TOKEN_G
  to:
    | typeof TOKEN_B
    | typeof TOKEN_C
    | typeof TOKEN_D
    | typeof TOKEN_E
    | typeof TOKEN_F
    | typeof TOKEN_G
    | typeof TOKEN_H
  disabled?: boolean
  className?: string
}

const SwitchTokensButton = ({ curve, chainId, from, to, disabled, className }: Props) => {
  const { tokenA, tokenB, tokenC, tokenD, tokenE, tokenF, tokenG, tokenH } = useStore(
    (state) => state.createPool.tokensInPool,
  )
  const updateTokensInPool = useStore((state) => state.createPool.updateTokensInPool)

  const handleClick = () => {
    // switch between token A and B
    if (from === TOKEN_A) {
      updateTokensInPool(curve, tokenB, tokenA, tokenC, tokenD, tokenE, tokenF, tokenG, tokenH)
    }
    if (from === TOKEN_B && to === TOKEN_C) {
      updateTokensInPool(curve, tokenA, tokenC, tokenB, tokenD, tokenE, tokenF, tokenG, tokenH)
    }
    if (from === TOKEN_C && to === TOKEN_D) {
      updateTokensInPool(curve, tokenA, tokenB, tokenD, tokenC, tokenE, tokenF, tokenG, tokenH)
    }
    if (from === TOKEN_D && to === TOKEN_E) {
      updateTokensInPool(curve, tokenA, tokenB, tokenC, tokenE, tokenD, tokenF, tokenG, tokenH)
    }
    if (from === TOKEN_E && to === TOKEN_F) {
      updateTokensInPool(curve, tokenA, tokenB, tokenC, tokenD, tokenF, tokenE, tokenG, tokenH)
    }
    if (from === TOKEN_F && to === TOKEN_G) {
      updateTokensInPool(curve, tokenA, tokenB, tokenC, tokenD, tokenE, tokenG, tokenF, tokenH)
    }
    if (from === TOKEN_G && to === TOKEN_H) {
      updateTokensInPool(curve, tokenA, tokenB, tokenC, tokenD, tokenE, tokenF, tokenH, tokenG)
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
