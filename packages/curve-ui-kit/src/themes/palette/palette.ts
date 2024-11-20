import type { ThemeKey } from '../basic-theme'
import { chad } from './chad.palette'
import { dark } from './dark.palette'
import { light } from './light.palette'

export const PALETTES = { light, dark, chad }
export const createPalette = (mode: ThemeKey) => PALETTES[mode]

export type Palette = ReturnType<typeof createPalette>
