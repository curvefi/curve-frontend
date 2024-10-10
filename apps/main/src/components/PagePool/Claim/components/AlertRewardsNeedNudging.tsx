import React from 'react'
import { Trans } from '@lingui/macro'

import AlertBox from '@/ui/AlertBox'

const AlertRewardsNeedNudging: React.FC = () => {
  return (
    <AlertBox alertType="info">
      <Trans>
        This pool has CRV rewards that aren&rsquo;t streaming yet. Click &lsquo;Claim or Nudge CRV&rsquo; to resume
        reward streaming for you and everyone else!
      </Trans>
    </AlertBox>
  )
}

export default AlertRewardsNeedNudging
