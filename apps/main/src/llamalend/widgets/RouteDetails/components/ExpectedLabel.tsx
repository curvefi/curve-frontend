import { Dispatch, SetStateAction } from 'react'
import { styled } from 'styled-components'
import { Loader } from '@ui/Loader'
import { t } from '@ui-kit/lib/i18n'
import { ChevronDownIcon } from '@ui-kit/shared/icons/ChevronDownIcon'
import { RotatableIcon } from '@ui-kit/shared/ui/DataTable/RotatableIcon'
import { DetailsButton } from '../index'
import type { RouteDetailsProps } from '../types'
import { format } from '../utils'

export const ExpectedLabel = ({
  loading,
  label,
  total,
  swapToSymbol,
  showDetails,
  toggleShowDetails,
}: Pick<RouteDetailsProps, 'loading' | 'total'> & {
  label: string
  showDetails: boolean
  swapToSymbol: string
  toggleShowDetails: Dispatch<SetStateAction<boolean>>
}) => (
  <Label>
    <strong>{label}:</strong>
    <span>
      {loading ? (
        <Loader skeleton={[80, 18]} />
      ) : (
        <strong>
          {format(total, { defaultValue: '-' })} {swapToSymbol}
        </strong>
      )}
      <DetailsButton
        type="button"
        $isOpen={showDetails}
        variant="outlined"
        onClick={() => toggleShowDetails((prev) => !prev)}
      >
        {t`Details` + ' '}
        <RotatableIcon rotated={showDetails} icon={ChevronDownIcon} fontSize={16} />
      </DetailsButton>
    </span>
  </Label>
)

const Label = styled.h3`
  align-items: center;
  display: flex;
  font-size: var(--font-size-2);
  justify-content: space-between;
  padding-top: var(--spacing-1);

  > span:last-of-type {
    align-items: center;
    display: inline-flex;
  }
`
