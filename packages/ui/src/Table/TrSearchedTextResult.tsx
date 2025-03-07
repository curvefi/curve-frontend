import { shortenAddress } from 'curve-ui-kit/src/utils'
import { useMemo } from 'react'
import styled from 'styled-components'
import Icon from 'ui/src/Icon'
import IconButton from 'ui/src/IconButton'
import ExternalLink from 'ui/src/Link/ExternalLink'
import { breakpoints, handleClickCopy } from 'ui/src/utils'

type Result = { [key: string]: { value: string } }

interface Props {
  className?: string
  id: string
  isMobile: boolean
  colSpan: number
  result: Result
  searchTermMapper: { [key: string]: { label?: string } } | undefined
  scanAddressPath(hash: string): string
}

const TrSearchedTextResult = ({
  className = '',
  id,
  isMobile,
  colSpan,
  result,
  searchTermMapper,
  scanAddressPath,
}: Props) => {
  const parsedResult = useMemo(() => removeDuplicateValues(result), [result])

  return (
    <Tr className={`${className} searchTermsResult`}>
      <Td colSpan={colSpan}>
        <ul>
          {parsedResult &&
            Object.entries(parsedResult).map(([key, { value }], idx) => {
              const label = searchTermMapper && key in searchTermMapper ? searchTermMapper[key]?.label : ''

              return (
                <li key={`${id}${key}${idx}`}>
                  <strong>{label ?? ''}:</strong>{' '}
                  <span>
                    <StyledExternalLink href={scanAddressPath(value)}>
                      {isMobile ? shortenAddress(value) : value}
                      <Icon name="Launch" size={16} />
                    </StyledExternalLink>
                    <CopyIconButton size="medium" onClick={() => handleClickCopy(value)}>
                      <Icon name="Copy" size={16} />
                    </CopyIconButton>
                  </span>
                </li>
              )
            })}
        </ul>
      </Td>
    </Tr>
  )
}

const Tr = styled.tr`
  border-bottom: 1px solid var(--border-400);
  border-top: 1px dotted var(--border-400);
`

const Td = styled.td`
  cursor: initial;
  font-size: var(--font-size-2);
  padding: var(--spacing-1) var(--spacing-narrow);

  @media (min-width: ${breakpoints.sm}rem) {
    padding: var(--spacing-1) var(--spacing-normal);
  }
`

const CopyIconButton = styled(IconButton)`
  align-items: center;
  color: inherit;
  display: inline-flex;
  padding: var(--spacing-2);
  padding-top: 0;

  background-color: transparent;
  border: 1px solid transparent;
  opacity: 0.5;

  &:hover {
    color: var(--button_icon--hover--color);
    background-color: var(--button_icon--hover--background-color);
  }
`

const StyledExternalLink = styled(ExternalLink)`
  color: inherit;
  font-size: var(--font-size-2);
  text-transform: inherit;
  text-decoration: none;

  svg {
    padding-top: 0.3125rem;
  }
`

export default TrSearchedTextResult

function removeDuplicateValues(result: Result) {
  const values = new Set()
  const parsedResult: Result = {}

  Object.keys(result).forEach((k) => {
    const value = result[k].value
    if (!values.has(value)) {
      values.add(value)
      parsedResult[k] = result[k]
    }
  })

  return parsedResult
}
