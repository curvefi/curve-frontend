import type { PropsWithChildren } from 'react'
import { styled, type IStyledComponent } from 'styled-components'
import { Chip } from '@ui/Typography/Chip'
import type { ChipProps } from '@ui/Typography/types'

export const ChipInactive: IStyledComponent<'web', PropsWithChildren<ChipProps>> = styled(Chip)`
  opacity: 0.7;
  border: 1px solid var(--border-400);
  padding: 0 2px;
  margin-left: auto;
`
