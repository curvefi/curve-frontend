import InternalLink from '@/ui/Link/InternalLink'
import React from 'react'
import type { Params } from 'react-router'


import { ROUTE } from '@/constants'
import networks from '@/networks'
import { getPath } from '@/utils/utilsRouter'


const AlertCompensation = ({ rChainId, params, poolId }: { rChainId: ChainId; params: Params; poolId: string }) => {
  return networks[rChainId].compensations[poolId] ? (
    <strong>
      <i>
        Compensation is now available for this pool, please click{' '}
        <InternalLink $noStyles href={getPath(params, ROUTE.PAGE_COMPENSATION)}>
          here
        </InternalLink>{' '}
        to claim.
      </i>
    </strong>
  ) : null
}

export default AlertCompensation
