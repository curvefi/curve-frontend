import { t } from '@ui-kit/lib/i18n'
import styled from 'styled-components'
import { Chip } from '@ui/Typography'

type Props = {
  isCrypto: boolean | undefined
  referenceAsset: string | undefined
}

const TableCellReferenceAsset = ({ isCrypto, referenceAsset }: Props) => {
  const referenceAssets: { [referenceAsset: string]: string } = {
    CRYPTO: t`CRYPTO V2`,
    OTHER: t`OTHER`,
  }

  const tooltip = isCrypto
    ? t`V2 pools contain non pegged assets. Liquidity providers are exposed to all assets in the pools.`
    : ''

  return (
    <StyledChip size="xs" tooltip={tooltip}>
      {referenceAsset ? (referenceAssets[referenceAsset] ?? referenceAsset) : ''}
    </StyledChip>
  )
}

const StyledChip = styled(Chip)`
  margin-bottom: 0.125rem;
`

export default TableCellReferenceAsset
