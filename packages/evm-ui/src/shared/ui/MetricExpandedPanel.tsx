import { UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { Metric, type MetricProps } from '@ui/components/Metric'
import { TokenIcon, type TokenIconProps } from '@ui/components/TokenIcon'

type MetricExpandedPanelProps = Omit<MetricProps, 'category' | 'icon'> & {
  icon?: { blockchainId: TokenIconProps['blockchainId']; token?: TokenIconProps['token'] | null }
}

export const MetricExpandedPanel = ({ icon, valueOptions, ...props }: MetricExpandedPanelProps) => (
  <Metric
    {...props}
    category="table.mobileExpandedPanel"
    valueOptions={{ abbreviate: false, fallback: UNAVAILABLE_NOTATION, ...valueOptions }}
    icon={icon?.token && <TokenIcon blockchainId={icon.blockchainId} token={icon.token} size="mui-sm" />}
  />
)
