import { useMemo } from 'react'
import { styled } from 'styled-components'
import { CollateralAlert } from '@/loan/types/loan.types'
import { breakpoints } from '@ui/utils'

export const useCollateralAlert = (collateralAddress: string | undefined) =>
  useMemo(() => {
    const alerts: { [collateralAddress: string]: CollateralAlert } = {
      '0x136e783846ef68c8bd00a3369f787df8d683a696': {
        // sfrxeth
        address: '0x136e783846ef68c8bd00a3369f787df8d683a696',
        alertType: 'info',
        isDeprecated: true,
        message: (
          <MessageWrapper>
            Please note this market is being phased out. We recommend migrating to the sfrxETH v2 market which uses an
            updated oracle.
          </MessageWrapper>
        ),
      },
    }

    let parsedAlert: CollateralAlert | null = null

    if (collateralAddress) {
      parsedAlert = alerts[collateralAddress]
    }
    return parsedAlert || null
  }, [collateralAddress])

const MessageWrapper = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;

  a {
    word-break: break-word;
  }

  @media (min-width: ${breakpoints.sm}rem) {
    align-items: center;
    flex-direction: row;
  }
`
