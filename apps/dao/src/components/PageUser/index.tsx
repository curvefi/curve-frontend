import styled from 'styled-components'
import { t } from '@lingui/macro'
import { useEffect, useMemo } from 'react'

import useStore from '@/store/useStore'
import networks from '@/networks'
import { convertToLocaleTimestamp } from '@/ui/Chart/utils'
import { copyToClipboard } from '@/utils'
import { shortenTokenAddress } from '@/ui/utils'

import Box from '@/ui/Box'

type Props = {
  routerParams: {
    rUserAddress: string
  }
}

const UserPage = ({ routerParams: { rUserAddress } }: Props) => {
  return <Wrapper></Wrapper>
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-4) auto var(--spacing-6);
  width: 65rem;
  max-width: 100%;
  flex-grow: 1;
  min-height: 100%;
  @media (min-width: 34.375rem) {
    max-width: 95%;
  }
`

const UserPageContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: var(--spacing-4);
  margin-bottom: auto;
`

export default UserPage
