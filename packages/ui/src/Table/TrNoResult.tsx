import React from 'react'
import styled from 'styled-components'

import AlertBox from 'ui/src/AlertBox'
import Box from 'ui/src/Box'
import Button from 'ui/src/Button'
import ExternalLink from 'ui/src/Link/ExternalLink'

export enum ERROR {
  api = 'api',
  search = 'search',
  filter = 'filter',
}

export type TrNoResultProps = {
  type: 'pool' | 'market'
  noResultKey: keyof typeof ERROR | ''
  value: string
  action?: () => void
}

const TrNoResult = ({ type, noResultKey, value, action }: TrNoResultProps) => {
  const listType = type === 'pool' ? 'pool' : 'market'

  return (
    <Wrapper>
      {noResultKey === ERROR.api ? (
        <Box flex flexJustifyContent="center">
          <AlertBox alertType="error">Unable to retrieve {listType} list. Please try again later.</AlertBox>
        </Box>
      ) : noResultKey === ERROR.search || noResultKey === ERROR.filter ? (
        <>
          No market found for “{value}”.
          {typeof action === 'function' && (
            <>
              <br />{' '}
              <Button variant="text" onClick={action}>
                View all
              </Button>
            </>
          )}
        </>
      ) : (
        <>
          Can&apos;t find what you&apos;re looking for?{' '}
          <ExternalLink $noStyles href="https://t.me/curvefi">
            Feel free to ask us on Telegram
          </ExternalLink>
        </>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  padding: var(--spacing-5);
  text-align: center;
`

export default TrNoResult
