import Chip from '@/ui/Typography/Chip'
import styled from 'styled-components'


const ChipInpHelper = styled(Chip)<{ noPadding?: boolean }>`
  padding: ${({ noPadding }) => (noPadding ? '0' : '0 0.3125rem')}; // 5px
  min-height: 0.875rem; // 14px
  opacity: 0.9;
`

export default ChipInpHelper
