import { UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { Metric, type MetricProps } from '@ui/components/Metric'
import { TokenIcon, type TokenIconProps } from '@ui/components/TokenIcon'

type MetricExpandedPanelProps = Omit<MetricProps, 'category' | 'icon'> & {
  icon?: { blockchainId: TokenIconProps['blockchainId']; token?: Pick<TokenIconProps, 'address'> | null }
}

export const MetricExpandedPanel = ({ icon, valueOptions, ...props }: MetricExpandedPanelProps) => (
  <Metric
    {...props}
    category="table.mobileExpandedPanel"
    valueOptions={{ abbreviate: false, fallback: UNAVAILABLE_NOTATION, ...valueOptions }}
    icon={
      icon?.token?.address && <TokenIcon blockchainId={icon.blockchainId} address={icon.token.address} size="mui-sm" />
    }
  />
)
