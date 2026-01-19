import { styled } from 'styled-components'
import { Box } from '@ui/Box'
import { Button } from '@ui/Button'
import { Icon } from '@ui/Icon'
import { t } from '@ui-kit/lib/i18n'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const getPageNumbers = () => {
    let start = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
    const end = Math.min(start + 4, totalPages)

    if (end - start < 4) {
      start = Math.max(1, end - 4)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  return (
    <PaginationWrapper>
      <Box flex>
        <PaginationButton
          className="first-last-button"
          variant="text"
          size="small"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          {t`First`}
        </PaginationButton>
        <PaginationButton
          variant="text"
          size="small"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Icon size={16} name="ChevronLeft" />
        </PaginationButton>
        {getPageNumbers().map((number) => (
          <PageNumber
            variant="text"
            size="small"
            key={number}
            onClick={() => onPageChange(number)}
            active={currentPage === number}
          >
            {number}
          </PageNumber>
        ))}
        <PaginationButton
          variant="text"
          size="small"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Icon size={16} name="ChevronRight" />
        </PaginationButton>
        <PaginationButton
          className="first-last-button"
          variant="text"
          size="small"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          {t`Last`} ({totalPages})
        </PaginationButton>
      </Box>
      <SmallScreenRow>
        <PaginationButton variant="text" size="small" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
          {t`First`}
        </PaginationButton>
        <PaginationButton
          variant="text"
          size="small"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          {t`Last`} ({totalPages})
        </PaginationButton>
      </SmallScreenRow>
    </PaginationWrapper>
  )
}

const PaginationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-3) var(--spacing-3) 0;
  border-top: 1px solid var(--gray-500a20);
`

const PaginationButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-1) var(--spacing-2);
  margin: 0 var(--spacing-1);
  color: var(--page--text-color);
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  &.first-last-button {
    @media (max-width: 27.8125rem) {
      display: none;
    }
  }
`

const SmallScreenRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: var(--spacing-2);
  @media (min-width: 27.8125rem) {
    display: none;
  }
`

const PageNumber = styled(Button)<{ active: boolean }>`
  padding: var(--spacing-1) var(--spacing-2);
  margin: 0 var(--spacing-1);
  background-color: ${(props) => (props.active ? 'var(--color-primary)' : 'var(--color-background-secondary)')};
  color: ${(props) => (props.active ? 'var(--page--text-color)' : 'var(--page--text-color)')};
  border: ${(props) => (props.active ? '1px solid var(--page--text-color)' : 'none')};
  font-weight: ${(props) => (props.active ? 'var(--bold)' : 'normal')};
  border-radius: var(--border-radius);
  cursor: pointer;
  &:hover {
    border: ${(props) => (props.active ? '1px solid var(--button_text--hover--color)' : 'none')};
  }
`
