import { styled } from 'styled-components'
import {
  TOKEN_A,
  TOKEN_B,
  TOKEN_C,
  TOKEN_D,
  TOKEN_E,
  TOKEN_F,
  TOKEN_G,
  TOKEN_H,
} from '@/dex/components/PageCreatePool/constants'
import { useStore } from '@/dex/store/useStore'
import { CurveApi } from '@/dex/types/main.types'
import { Icon } from '@ui/Icon'
import { IconButton } from '@ui/IconButton'
import { t } from '@ui-kit/lib/i18n'

type Props = {
  curve: CurveApi
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

export const SwitchTokensButton = ({ curve, from, to, disabled, className }: Props) => {
  const tokenA = useStore((state) => state.createPool.tokensInPool.tokenA)
  const tokenB = useStore((state) => state.createPool.tokensInPool.tokenB)
  const tokenC = useStore((state) => state.createPool.tokensInPool.tokenC)
  const tokenD = useStore((state) => state.createPool.tokensInPool.tokenD)
  const tokenE = useStore((state) => state.createPool.tokensInPool.tokenE)
  const tokenF = useStore((state) => state.createPool.tokensInPool.tokenF)
  const tokenG = useStore((state) => state.createPool.tokensInPool.tokenG)
  const tokenH = useStore((state) => state.createPool.tokensInPool.tokenH)
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
