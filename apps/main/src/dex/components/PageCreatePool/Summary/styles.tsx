import { styled } from 'styled-components'
import { Icon } from '@ui/Icon'
import { ExternalLink } from '@ui/Link/ExternalLink'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'

export const CategoryColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: var(--spacing-3) 0;
  padding-bottom: var(--spacing-2);
  border-bottom: 1px solid var(--gray-500a25);
  .rebasing-row {
    margin-top: var(--spacing-3);
    margin-left: none;
    align-items: center;
  }
`

export const CategoryDataRow = styled.div`
  display: flex;
  margin-left: var(--spacing-2);
  margin-right: var(--spacing-2);
  margin-bottom: var(--spacing-2);
  align-items: center;
`

export const ExtraMarginRow = styled(CategoryDataRow)`
  display: flex;
  margin-top: var(--spacing-2);
`

export const CategoryDataColumn = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: var(--spacing-2);
  margin-right: var(--spacing-2);
  margin-bottom: var(--spacing-2);
`

export const SummaryCategoryTitle = styled.p`
  color: var(--page--text-color);
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  margin-bottom: var(--spacing-3);
  opacity: 0.7;
`

export const SummaryDataTitle = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  padding-right: var(--spacing-1);
  color: var(--page--text-color);
`

export const SummarySubTitle = styled.p`
  font-size: var(--font-size-2);
  font-weight: var(--bold);
  padding-right: var(--spacing-1);
  color: var(--page--text-color);
  opacity: 0.7;
`

export const SummaryData = styled.p`
  color: var(--page--text-color);
  font-size: var(--font-size-2);
  margin-left: auto;
  font-weight: var(--semi-bold);
`

export const SummaryDataPlaceholder = styled.p`
  font-style: italic;
  padding-left: var(--spacing-1);
  font-size: var(--font-size-2);
  color: var(--input--disabled--color);
  color: var(--page--text-color);
  margin-left: auto;
  &.left-aligned {
    margin-left: var(--spacing-2);
  }
`

export const StyledCheckmark = styled(Icon)`
  color: var(--primary-400);
  margin-right: var(--spacing-1);
`

export const TokenRow = styled.div`
  display: flex;
  margin-bottom: calc(var(--spacing-1) + (var(--spacing-1) / 2));
  align-items: center;
`

export const TokenSymbol = styled.p`
  display: flex;
  justify-content: center;
  margin-right: auto;
  font-weight: var(--bold);
  color: var(--page--text-color);
`

export const TokenType = styled.p`
  margin-right: auto;
  font-weight: var(--semi-bold);
  font-size: var(--font-size-2);
  opacity: 0.7;
  color: var(--page--text-color);
`

export const AddressLink = styled(ExternalLink)`
  font-size: var(--font-size-2);
  font-weight: var(--font-weight--bold);

  color: var(--page--text-color);
  margin-left: auto;
  svg {
    padding-top: 0.3125rem;
  }
  &:hover:not(:disabled) {
    color: var(--button_filled-hover-contrast--background-color);
  }
`

export const ButtonTokenIcon = styled(TokenIcon)`
  margin-right: 0.25rem;
`
