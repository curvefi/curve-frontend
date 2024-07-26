import React, { useState } from 'react'
import styled from 'styled-components'

import Button from '@/ui/Button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const [inputPage, setInputPage] = useState('')

  const getPageNumbers = () => {
    let start = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
    let end = Math.min(start + 4, totalPages)

    if (end - start < 4) {
      start = Math.max(1, end - 4)
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value)
  }

  const handleInputSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const page = parseInt(inputPage)
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
      setInputPage('')
    }
  }

  return (
    <PaginationWrapper>
      <PaginationButton variant="text" size="small" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
        First
      </PaginationButton>
      <PaginationButton
        variant="text"
        size="small"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
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
        Next
      </PaginationButton>
      <PaginationButton
        variant="text"
        size="small"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        Last ({totalPages})
      </PaginationButton>
    </PaginationWrapper>
  )
}

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: var(--spacing-3);
  border-top: 1px solid var(--gray-500a20);
`

const PaginationButton = styled(Button)`
  padding: var(--spacing-1) var(--spacing-2);
  margin: 0 var(--spacing-1);
  background-color: var(--color-background-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  color: var(--page--text-color);
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

export default Pagination
