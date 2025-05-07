import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import AlertFormError from '@/loan/components/AlertFormError'
import LoanFormConnect from '@/loan/components/LoanFormConnect'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import { useStablecoinConnection } from '@/loan/temp-lib'
import { ChainId, Curve } from '@/loan/types/loan.types'
import Button from '@ui/Button'
import DetailInfo from '@ui/DetailInfo'
import IconTooltip from '@ui/Tooltip/TooltipIcon'
import TxInfoBar from '@ui/TxInfoBar'
import { breakpoints, formatNumber } from '@ui/utils'
import { isLoading, notify } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'

type Props = {
  rChainId: ChainId
  poolName: string
  pegKeeperAddress: string
}

const PegKeeperForm = ({ rChainId, poolName, pegKeeperAddress }: Props) => {
  const isSubscribed = useRef(false)

  const { lib: curve, connectState } = useStablecoinConnection()
  const detailsMapper = useStore((state) => state.pegKeepers.detailsMapper)
  const formStatus = useStore((state) => state.pegKeepers.formStatus)
  const fetchUpdate = useStore((state) => state.pegKeepers.fetchUpdate)

  const [txInfoBar, setTxInfoBar] = useState<ReactNode>(null)

  const { signerAddress } = curve || {}

  const handleClick = useCallback(
    async (curve: Curve, pegKeeperAddress: string) => {
      setTxInfoBar(null)

      const notifyMessage = t`Please confirm update ${poolName} pool`
      const notification = notify(notifyMessage, 'pending')
      const resp = await fetchUpdate(curve, pegKeeperAddress)

      if (isSubscribed.current && resp) {
        if (!resp.error) {
          const txMessage = t`Transaction complete.`
          setTxInfoBar(<TxInfoBar description={txMessage} txHash={networks[rChainId].scanTxPath(resp.hash)} />)
        }

        notification?.dismiss()
      }
    },
    [fetchUpdate, poolName, rChainId],
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
        <strong>{formatNumber(estCallerProfit)}</strong>
      </DetailInfo>

      <LoanFormConnect haveSigner={!!signerAddress} loading={isLoading(connectState)}>
        {txInfoBar}
        <AlertFormError limitHeight errorKey={formStatus[pegKeeperAddress]?.error} />
        {!!curve && (
          <Button
            fillWidth
            loading={formStatus[pegKeeperAddress]?.isInProgress}
            disabled={estCallerProfit === undefined || Number(estCallerProfit) === 0 || estCallerProfit === '-'}
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
