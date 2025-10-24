import { SliderProps } from '@mui/material/Slider'
import { type Responsive } from '@ui-kit/themes/basic-theme'
import { DesignSystem } from '@ui-kit/themes/design'

export type SliderSize = NonNullable<SliderProps['size']>
export type SliderRailBackground = NonNullable<SliderProps['rail-background']>

export type SliderSizeDefinition = {
  height: Responsive
  thumbWidth: Responsive
}

export type GradientStopsDefinition = Readonly<Record<number | `${number}`, string>>

export type OrientationConfig = {
  gradientDirection: 'to right' | 'to top'
  extensionOffsets: {
    start: Record<string, string>
    end: Record<string, string>
  }
  root: {
    size: {
      height: string
      width: string
    }
    margins: {
      marginInline: string | number
      marginBlock: string | number
    }
  }
  thumb: {
    size: {
      width: string
      height: string
    }
    getImage: (design: DesignSystem) => string
  }
  track: {
    size: Record<string, string>
    beforePosition: Record<string, string>
    beforeSize: Record<string, string>
  }
  rail: {
    startOffset: Record<string, string>
    endOffset: Record<string, string>
    size: Record<string, string>
  }
}
