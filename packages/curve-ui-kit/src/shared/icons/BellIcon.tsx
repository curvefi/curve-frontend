import { styled } from '@mui/material/styles'
import { keyframes } from '@mui/material/styles'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import { createSvgIcon } from '@mui/material/utils'

export const BellIcon = createSvgIcon(
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 24 24" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.4682 1.66794C11.4682 2.33957 11.017 2.90581 10.4011 3.07997C13.5277 3.28638 15.9999 5.88788 15.9999 9.06677V13.6668C15.9999 14.7418 16.0438 15.61 16.9647 16.0705C17.2413 16.2088 17.3864 16.519 17.3154 16.82C17.2444 17.1209 16.9758 17.3335 16.6666 17.3335H10.8818C11.1586 17.5778 11.3332 17.9352 11.3332 18.3334C11.3332 19.0698 10.7363 19.6668 9.99988 19.6668C9.2635 19.6668 8.66655 19.0698 8.66655 18.3334C8.66655 17.9352 8.84113 17.5778 9.11793 17.3335H3.33324C3.02405 17.3335 2.75544 17.1209 2.6844 16.82C2.61337 16.519 2.75855 16.2088 3.03509 16.0705C3.95602 15.61 3.9999 14.7418 3.9999 13.6668V9.06677C3.9999 5.88728 6.47299 3.28541 9.60048 3.07986C8.98481 2.90556 8.53373 2.33943 8.53373 1.66794C8.53373 0.857594 9.19064 0.200684 10.001 0.200684C10.8113 0.200684 11.4682 0.857594 11.4682 1.66794ZM9.9999 4.40011C7.42257 4.40011 5.33324 6.48944 5.33324 9.06677L5.33328 13.7347C5.33392 14.3286 5.33486 15.2113 4.93231 16.0001H15.0675C14.6649 15.2113 14.6659 14.3286 14.6665 13.7347L14.6666 9.06677C14.6666 6.48945 12.5772 4.40011 9.9999 4.40011Z"
      fill="currentColor"
    />
  </svg>,
  'Bell',
)

// Bell ringing animation - smooth shake with rotation
const bellRing = keyframes`
  0% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-12deg); }
  30% { transform: rotate(10deg); }
  40% { transform: rotate(-8deg); }
  50% { transform: rotate(6deg); }
  60% { transform: rotate(-4deg); }
  70% { transform: rotate(2deg); }
  80% { transform: rotate(-1deg); }
  90% { transform: rotate(0.5deg); }
  100% { transform: rotate(0deg); }
`

// BellRingingIcon component with hover animation
export const BellRingingIcon = styled(BellIcon)<SvgIconProps>(() => ({
  transformOrigin: 'top center',
  '&:hover, .group:hover &': {
    animation: `${bellRing} 0.6s ease-in-out`,
  },
}))
