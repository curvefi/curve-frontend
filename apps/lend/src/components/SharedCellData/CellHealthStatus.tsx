import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { FORMAT_OPTIONS, breakpoints, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import { HealthColorText } from '@/components/DetailsUser/styles'
import Box from '@/ui/Box'
import ExternalLink from 'ui/src/Link/ExternalLink'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'

const CellHealthStatus = ({ userActiveKey, type }: { userActiveKey: string; type: 'status' | 'percent' }) => {
  const resp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])

  const { details, error } = resp ?? {}

  return (
    <>
      {typeof resp === 'undefined' ? null : error ? (
        '?'
      ) : type === 'status' ? (
        <HealthColorText as="strong" colorKey={details?.status?.colorKey}>
          {details?.status?.label}
        </HealthColorText>
      ) : type === 'percent' ? (
        <HealthColorText colorKey={details?.status?.colorKey}>
          <strong>{formatNumber(details?.healthFull, FORMAT_OPTIONS.PERCENT)} </strong>
          <StyledIconTooltip minWidth="250px">
            <Box grid gridGap={2}>
              <p>{t`The loan metric indicates the current health of your position.`}</p>
              <p>
                {t`Hard liquidation is triggered when health is 0 or below.`}{' '}
                <ExternalLink href="https://resources.curve.fi/lending/overview/#health-hard-liquidation" $noStyles>
                  Click here to learn more.
                </ExternalLink>
              </p>
            </Box>
          </StyledIconTooltip>
        </HealthColorText>
      ) : null}
    </>
  )
}

const StyledIconTooltip = styled(IconTooltip)`
  min-width: 0;

  @media (min-width: ${breakpoints.xs}rem) {
    min-width: auto;
  }
`

export default CellHealthStatus
