import { useMemo } from 'react'
import Image from 'next/image'
import styled from 'styled-components'

import useStore from '@/store/useStore'
import { sizes } from '@/globalStyle'

import { ChadImg, RCMoon, RCSun } from '@/images'
import IconButton from '@/ui/IconButton'

type Props = {
  className?: string
  label?: string
}

const SelectThemes = ({ className, label }: Props) => {
  const themeType = useStore((state) => state.themeType)
  const setAppCache = useStore((state) => state.setAppCache)

  const themes = useMemo(() => {
    return [
      {
        type: 'default',
        Component: <RCSun aria-label="Light theme" />,
      },
      {
        type: 'dark',
        Component: <RCMoon aria-label="Dark theme" />,
      },
      {
        type: 'chad',
        Component: <Image src={ChadImg} alt="Fun theme" />,
      },
    ]
  }, [])

  const activeTheme = useMemo(() => {
    const idx = themes.findIndex((theme) => theme.type === themeType)
    return { idx, theme: themes[idx] }
  }, [themeType, themes])

  const handleClick = (activeThemeIdx: number) => {
    let nextThemeIdx = activeThemeIdx + 1

    if (activeThemeIdx === 2) {
      nextThemeIdx = 0
    }

    const foundTheme = themes[nextThemeIdx]?.type

    if (!foundTheme) {
      if (themeType === 'chad') {
        setAppCache('themeType', 'chad')
      } else {
        console.error(`Unable to find theme ${themeType}`)
      }
    } else {
      setAppCache('themeType', foundTheme as Theme)
    }
  }

  const { idx, theme } = activeTheme

  return (
    <StyledIconButton
      className={className}
      opacity={1}
      size="medium"
      hasTitle={!!label}
      onClick={() => handleClick(idx)}
    >
      {label ? <span className="label">{label}</span> : ''}
      {theme?.Component}
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
