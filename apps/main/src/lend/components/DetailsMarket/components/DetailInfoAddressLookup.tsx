import { styled } from 'styled-components'
import { StyledStats } from '@/lend/components/DetailsMarket/styles'
import networks from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import Icon from '@ui/Icon'
import IconButton from '@ui/IconButton'
import ExternalLink from '@ui/Link/ExternalLink'
import { scanAddressPath } from '@ui/utils'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { AddressActionInfo, AddressActionInfoProps } from '@ui-kit/shared/ui/AddressActionInfo'
import { copyToClipboard, ReleaseChannel, shortenAddress } from '@ui-kit/utils'

type Props = Omit<AddressActionInfoProps, 'network'> & { chainId: ChainId }

const OldDetailInfoAddressLookup = ({ chainId, title, address, ...props }: Props) => {
  const isValidAddress = address ? address !== 'NaN' : true

  return (
    <StyledStats {...props}>
      {typeof title === 'string' ? <Label>{title}</Label> : title}
      {address && (
        <span>
          <StyledExternalLink
            isValid={isValidAddress}
            isNumber={isValidAddress}
            href={isValidAddress ? scanAddressPath(networks[chainId], address) : ''}
          >
            <strong>{address === 'NaN' ? 'no gauge' : shortenAddress(address)}</strong>
            <Icon name="Launch" size={16} />
          </StyledExternalLink>
          <CopyIconButton
            isValid={isValidAddress}
            size="medium"
            onClick={() => (isValidAddress ? copyToClipboard(address) : {})}
          >
            <Icon name="Copy" size={16} />
          </CopyIconButton>
        </span>
      )}
    </StyledStats>
  )
}

const Label = styled.span`
  font-size: var(--font-size-2);
  font-weight: bold;
`

const CopyIconButton = styled(IconButton)<{ isValid: boolean }>`
  align-items: center;
  display: inline-flex;
  padding: var(--spacing-2);

  color: inherit;
  background-color: transparent;
  border: 1px solid transparent;
  opacity: 0.5;

  &:hover {
    color: var(--button_icon--hover--color);
    background-color: var(--button_icon--hover--background-color);
  }

  ${({ isValid }) => !isValid && `visibility: hidden;`}
`

const StyledExternalLink = styled(ExternalLink)<{ isValid: boolean }>`
  color: inherit;
  font-size: var(--font-size-2);

  svg {
    padding-top: 0.3125rem;
  }

  ${({ isValid }) => {
    if (!isValid) {
      return `
        cursor: initial;
        text-decoration: none;
        &:hover {
          color: inherit;
        }
        
        svg {
          visibility: hidden;
        }
      `
    }
  }}
`

const NoGaugeActionInfo = ({ isBorderBottom, title }: Pick<Props, 'isBorderBottom' | 'title'>) => (
  <ActionInfo
    label={title}
    value={t`no gauge`}
    {...(isBorderBottom && { sx: { borderBottom: (t) => `1px solid ${t.palette.divider}` } })}
  />
)

export default function DetailInfoAddressLookup({ chainId, ...props }: Props) {
  const [releaseChannel] = useReleaseChannel()
  return releaseChannel !== ReleaseChannel.Beta ? (
    <OldDetailInfoAddressLookup chainId={chainId} {...props} />
  ) : props.address === 'NaN' ? (
    <NoGaugeActionInfo {...props} />
  ) : (
    <AddressActionInfo network={networks[chainId]} {...props} />
  )
}
