import React from 'react'
import { Trans } from '@lingui/macro'

import { ROUTE } from '@/constants'
import { getPath } from '@/utils/utilsRouter'
import { useParams } from 'react-router-dom'
import { usePoolContext } from '@/components/PagePool/contextPool'

import InternalLink from '@/ui/Link/InternalLink'
import networks from '@/networks'

const AlertCompensation = () => {
  const params = useParams()
  const { rChainId, poolId } = usePoolContext()

  const { compensations } = networks[rChainId]

  const hasCompensations = poolId ? compensations[poolId] : null

  return (
    <>
      {hasCompensations && (
        <Trans>
          <strong>
            <i>
              Compensation is now available for this pool, please click{' '}
              <InternalLink $noStyles href={getPath(params, ROUTE.PAGE_COMPENSATION)}>
                here
              </InternalLink>{' '}
              to claim.
            </i>
          </strong>
        </Trans>
      )}
    </>
  )
}

export default AlertCompensation
