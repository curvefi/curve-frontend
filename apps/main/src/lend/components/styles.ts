import type { ComponentProps, ComponentPropsWithRef } from 'react'
import { styled, type IStyledComponent } from 'styled-components'
import { Chip } from '@ui/Typography'

type DivProps = ComponentPropsWithRef<'div'>
type ChipComponentProps = ComponentProps<typeof Chip>
type StyledInpChipProps = { noPadding?: boolean }

export const StyledInpChip: IStyledComponent<'web', StyledInpChipProps & ChipComponentProps> = styled(
  Chip,
)<StyledInpChipProps>`
  padding: ${({ noPadding }) => (noPadding ? '0' : '0 0.3125rem')}; // 5px
  min-height: 0.875rem; // 14px
  opacity: 0.9;
`

export const StyledDetailInfoWrapper: IStyledComponent<'web', DivProps> = styled.div`
  margin-top: 0.375rem; // 6px
`
