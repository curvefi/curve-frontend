import Image from 'next/image'
import styled from 'styled-components'

import { ChadImg, RCMoon, RCSun } from 'ui/src/images'
import { sizes } from 'ui/src/utils'
import IconButton from 'ui/src/IconButton'

export type ThemeType = 'default' | 'dark' | 'chad'

const SelectThemes = ({
  className,
  label,
  themeType,
  handleThemeChange,
}: {
  className?: string
  label?: string
  themeType: ThemeType
  handleThemeChange(themeType: ThemeType): void
}) => {
  const themes = [
    { type: 'default', Component: <RCSun aria-label="Light theme" /> },
    { type: 'dark', Component: <RCMoon aria-label="Dark theme" /> },
    { type: 'chad', Component: <Image src={ChadImg} alt="Fun theme" /> },
  ]

  const activeThemeIdx = themes.findIndex((t) => t.type === themeType)

  const handleClick = (activeThemeIdx: number) => {
    let nextThemeIdx = activeThemeIdx + 1

    if (activeThemeIdx === 2) {
      nextThemeIdx = 0
    }

    const selectedTheme = (themes[nextThemeIdx]?.type ?? 'chad') as ThemeType
    handleThemeChange(selectedTheme)
  }

  return (
    <StyledIconButton
      className={className}
      opacity={1}
      size="medium"
      hasTitle={!!label}
      onClick={() => handleClick(activeThemeIdx)}
    >
      {label ? <span className="label">{label}</span> : ''}
      {themes[activeThemeIdx]?.Component}
    </StyledIconButton>
  )
}

SelectThemes.defaultProps = {
  className: '',
}

type StyledIconButtonProps = {
  hasTitle?: boolean
}

const StyledIconButton = styled(IconButton)<StyledIconButtonProps>`
  ${({ hasTitle }) => {
    if (hasTitle) {
      return `
        .label {
          ~ img {
            margin-top: -6px;
            margin-left: var(--spacing-2);
          }
          ~ svg {
            margin-left: var(--spacing-1);
          }
        }
      `
    }
  }}

  img {
    width: ${sizes['lg']};
    height: ${sizes['lg']};
    fill: currentColor;
    user-select: none;
  }

  svg {
    width: ${sizes['md']};
    height: ${sizes['md']};
    fill: currentColor;
    user-select: none;
  }
`

export default SelectThemes
