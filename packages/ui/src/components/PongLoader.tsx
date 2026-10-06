import Box, { type BoxProps } from '@mui/material/Box'
import { keyframes, styled } from '@mui/material/styles'
import { t } from '@ui/lib/i18n'

const pongBall = keyframes`
  0%, 100% {
    transform: translate(var(--pw), calc(var(--s) * 0.219));
  }
  25% {
    transform: translate(calc(var(--s) * 1.8 - var(--pw) - var(--b)), calc(var(--s) * 0.656));
  }
  50% {
    transform: translate(var(--pw), calc(var(--s) * 0.525));
  }
  75% {
    transform: translate(calc(var(--s) * 1.8 - var(--pw) - var(--b)), calc(var(--s) * 0.131));
  }
`

const pongLeft = keyframes`
  0%, 100% {
    transform: translateY(calc(var(--s) * 0.103));
  }
  50% {
    transform: translateY(calc(var(--s) * 0.409));
  }
`

const pongRight = keyframes`
  0%, 100% {
    transform: translateY(calc(var(--s) * 0.278));
    animation-timing-function: cubic-bezier(0.61, 1, 0.88, 1);
  }
  25% {
    transform: translateY(calc(var(--s) * 0.54));
    animation-timing-function: cubic-bezier(0.37, 0, 0.63, 1);
  }
  75% {
    transform: translateY(calc(var(--s) * 0.015));
    animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0);
  }
`

const Pong = styled(Box)({
  '--s': 'var(--ldr-size, 48px)',
  '--c': 'var(--ldr-color, currentColor)',
  '--pw': 'calc(var(--s) / 10)',
  '--ph': 'calc(var(--s) / 2.8)',
  '--b': 'calc(var(--s) / 8)',
  position: 'relative',
  width: 'calc(var(--s) * 1.8)',
  height: 'var(--s)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 'calc(50% - var(--s) / 60)',
    width: 'calc(var(--s) / 30)',
    background:
      'repeating-linear-gradient(to bottom, color-mix(in srgb, var(--c) 35%, transparent) 0 calc(var(--s) / 12), transparent 0 calc(var(--s) / 6))',
  },
  '& > span': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 'var(--pw)',
    height: 'var(--ph)',
    borderRadius: 'calc(var(--s) / 40)',
    background: 'var(--c)',
    animation: `${pongLeft} 3.2s cubic-bezier(0.37, 0, 0.63, 1) infinite`,
  },
  '& > span + span': { left: 'auto', right: 0, animationName: `${pongRight}` },
  '& > i': {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 'var(--b)',
    height: 'var(--b)',
    borderRadius: 'calc(var(--s) / 50)',
    background: 'var(--c)',
    animation: `${pongBall} 3.2s linear infinite`,
  },
  '@media (prefers-reduced-motion: reduce)': { '& > span, & > i': { animationDuration: '3s' } },
})

export const PongLoader = (props: BoxProps) => (
  <Pong role="status" aria-label={t`Loading`} {...props}>
    <span />
    <span />
    <i />
  </Pong>
)
