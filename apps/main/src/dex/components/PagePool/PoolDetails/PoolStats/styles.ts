import type { ComponentProps, ComponentPropsWithRef } from 'react'
import { styled, css, type IStyledComponent } from 'styled-components'
import { Box } from '@ui/Box'
import { Icon } from '@ui/Icon'
import type { IconProps } from '@ui/Icon/Icon'
import { IconButton } from '@ui/IconButton'

type PProps = ComponentPropsWithRef<'p'>
type BoxComponentProps = ComponentProps<typeof Box>
type IconButtonComponentProps = ComponentProps<typeof IconButton>

export const DescriptionChip: IStyledComponent<'web', PProps> = styled.p`
  font-size: var(--font-size-2);
  font-weight: 500;
`

const actionStyles = css`
  align-items: center;
  display: inline-flex;

  color: inherit;
  background-color: transparent;
  border: 1px solid transparent;
  opacity: 0.5;

  &:hover {
    color: var(--button_icon--hover--color);
    background-color: var(--button_icon--hover--background-color);
  }
`
export const StyledIconButton: IStyledComponent<'web', IconButtonComponentProps> = styled(IconButton)`
  ${actionStyles}
`

type StatsProps = {
  isBorderBottom?: boolean
  padding?: boolean
}

export const StyledStats: IStyledComponent<'web', StatsProps & BoxComponentProps> = styled(Box)<StatsProps>`
  align-items: center;
  display: flex;
  padding: var(--spacing-1);

  font-weight: 500;

  ${({ padding }) => {
    if (padding) {
      return 'padding: 0.25rem 0;'
    }
  }}

  ${({ isBorderBottom }) => {
    if (isBorderBottom) {
      return 'border-bottom: 1px solid var(--border-600);'
    }
  }}
`

export const StyledInformationSquare16: IStyledComponent<'web', IconProps> = styled(Icon)`
  opacity: 0.4;

  &:hover {
    opacity: 1;
  }
`
