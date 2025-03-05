import styled from 'styled-components'
import { getPath } from '@/dao/utils/utilsRouter'
import { InternalLink } from '@ui/Link'
import Icon from '@ui/Icon'
import { useParams, useRouter } from 'next/navigation'
import type { UrlParams } from '@/dao/types/dao.types'
import { ReactNode } from 'react'

type InternalLinkButtonProps = {
  to: string
  children: ReactNode
  smallSize?: boolean
}

const InternalLinkButton = ({ to, children, smallSize }: InternalLinkButtonProps) => {
  const { push: navigate } = useRouter()
  const params = useParams() as UrlParams
  return (
    <StyledInternalLink
      size={smallSize ? 'small' : undefined}
      onClick={(e) => {
        e.preventDefault()
        navigate(getPath(params, to))
      }}
    >
      {children}
      <Icon name="ArrowRight" size={16} />
    </StyledInternalLink>
  )
}

const StyledInternalLink = styled(InternalLink)<{ smallSize?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  font-size: ${({ smallSize }) => (smallSize ? 'var(--font-size-1)' : 'var(--font-size-2)')};
  padding: ${({ smallSize }) =>
    smallSize ? 'var(--spacing-1) var(--spacing-2)' : 'var(--spacing-2) var(--spacing-4)'};
  font-weight: var(--bold);
  text-transform: none;
  text-decoration: none;
  border: ${({ smallSize }) => (smallSize ? 'none' : '1px solid var(--link--color)')};
  margin-left: auto;
  &:hover {
    cursor: pointer;
    color: var(--button_outlined--hover--color);
    border-color: ${({ smallSize }) => (smallSize ? 'none' : 'var(--button_outlined--hover--color)')};
    background-color: var(--button_outlined--hover--background-color);
  }
`

export default InternalLinkButton
