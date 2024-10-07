import Button from '@/ui/Button'
import DetailInfo from '@/ui/DetailInfo'
import IconTooltip from '@/ui/Tooltip/TooltipIcon'
import TxInfoBar from '@/ui/TxInfoBar'
import { breakpoints, formatNumber } from '@/ui/utils'
import { t } from '@lingui/macro'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import AlertFormError from '@/components/AlertFormError'
import LoanFormConnect from '@/components/LoanFormConnect'
import networks from '@/networks'
import useStore from '@/store/useStore'


type Props = {
  rChainId: ChainId
  poolName: string
  pegKeeperAddress: string
}

const PegKeeperForm = ({ rChainId, poolName, pegKeeperAddress }: Props) => {
  const isSubscribed = useRef(false)

  const curve = useStore((state) => state.curve)
  const detailsMapper = useStore((state) => state.pegKeepers.detailsMapper)
  const formStatus = useStore((state) => state.pegKeepers.formStatus)
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const fetchUpdate = useStore((state) => state.pegKeepers.fetchUpdate)

  const [txInfoBar, setTxInfoBar] = useState<React.ReactNode | null>(null)

  const { signerAddress } = curve || {}

  const handleClick = useCallback(
    async (curve: Curve, pegKeeperAddress: string) => {
      setTxInfoBar(null)

      const notifyMessage = t`Please confirm update ${poolName} pool`
      const notify = notifyNotification(notifyMessage, 'pending')
      const resp = await fetchUpdate(curve, pegKeeperAddress)

      if (isSubscribed.current && resp) {
        if (!resp.error) {
          const txMessage = t`Transaction complete.`
          setTxInfoBar(<TxInfoBar description={txMessage} txHash={networks[rChainId].scanTxPath(resp.hash)} />)
        }

        if (notify && typeof notify.dismiss === 'function') notify.dismiss()
      }
    },
    [fetchUpdate, notifyNotification, poolName, rChainId]
  )

  // onMount
  useEffect(() => {
    isSubscribed.current = true

    return () => {
      isSubscribed.current = false
    }
  }, [])

  const { estCallerProfit } = detailsMapper[pegKeeperAddress] ?? {}

  return (
    <>
      <DetailInfo
        label={t`Est. update profit:`}
        tooltip={
          <StyledIconTooltip
            placement="top end"
            minWidth="200px"
            textAlign="left"
          >{t`Profit is denominated in ${poolName} LP Tokens`}</StyledIconTooltip>
        }
      >
        <strong>{formatNumber(detailsMapper[pegKeeperAddress]?.estCallerProfit)}</strong>
      </DetailInfo>

      <LoanFormConnect haveSigner={!!signerAddress} loading={!curve}>
        {txInfoBar}
        <AlertFormError limitHeight errorKey={formStatus[pegKeeperAddress]?.error} />
        {!!curve && (
          <Button
            fillWidth
            loading={formStatus[pegKeeperAddress]?.isInProgress}
            disabled={estCallerProfit === undefined || Number(estCallerProfit) === 0}
            size="large"
            variant="filled"
            onClick={() => handleClick(curve, pegKeeperAddress)}
          >
            Update
          </Button>
        )}
      </LoanFormConnect>
    </>
  )
}

const StyledIconTooltip = styled(IconTooltip)`
  > svg {
    top: 0;
  }

  @media (min-width: ${breakpoints.xs}rem) {
    margin-left: 0.1rem;
    > svg {
      top: 2px;
    }
  }
`

export default PegKeeperForm
