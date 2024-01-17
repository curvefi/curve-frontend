import type { TransferProps } from '@/components/PagePool/types'

import React, { useMemo } from 'react'
import { t } from '@lingui/macro'

import { formatNumber } from '@/ui/utils'
import { getChainPoolIdActiveKey, shortenTokenName } from '@/utils'
import useStore from '@/store/useStore'
import useTokenAlert from '@/hooks/useTokenAlert'

import AlertBox from '@/ui/AlertBox'
import Button from '@/ui/Button'
import Spinner from '@/ui/Spinner'

const TransferActions = ({
  children,
  curve,
  seed,
  loading,
  poolData,
  routerParams,
  userPoolBalances,
}: React.PropsWithChildren<
  {
    loading?: boolean
  } & Pick<TransferProps, 'curve' | 'poolData' | 'poolDataCacheOrApi' | 'routerParams' | 'seed' | 'userPoolBalances'>
>) => {
  const { signerAddress } = curve || {}
  const { rChainId, rPoolId } = routerParams
  const alert = useTokenAlert(poolData?.tokenAddressesAll ?? [])
  const currencyReserves = useStore((state) => state.pools.currencyReserves[getChainPoolIdActiveKey(rChainId, rPoolId)])
  const walletBalancesLoading = useStore((state) => state.user.walletBalancesLoading)
  const updateConnectWalletStateKeys = useStore((state) => state.wallet.updateConnectWalletStateKeys)
  const poolTotal = currencyReserves?.total

  const isLoading = useMemo(() => {
    return loading || typeof poolData === 'undefined' || typeof poolTotal === 'undefined'
  }, [loading, poolData, poolTotal])

  return (
    <>
      {alert && !alert.isInformationOnly ? <AlertBox alertType={alert.alertType}>{alert.message}</AlertBox> : null}
      {seed && seed.loaded && seed.isSeed && (
        <AlertBox alertType="error">
          <p>
            {poolData?.pool.isCrypto
              ? t`This pool is still empty, it should be seeded with the following rate ${seed.cryptoSeedInitialRate}`
              : t`This pool is still empty. Assuming an exchange rate of ${formatNumber(1)}:${formatNumber(
                  1
                )}, it should be seeded with ${poolData?.seedData
                  .map((d) => {
                    const formattedPercent = formatNumber(d.percent, {
                      style: 'percent',
                      maximumFractionDigits: 2,
                      trailingZeroDisplay: 'stripIfInteger',
                    })
                    return `${shortenTokenName(d.token)} ${formattedPercent}`
                  })
                  .join(', ')}.`}
          </p>
        </AlertBox>
      )}
      {signerAddress && !isLoading && !walletBalancesLoading && typeof userPoolBalances === 'undefined' && (
        <AlertBox alertType="error">{t`Unable to get wallet balances`}</AlertBox>
      )}
      {!signerAddress && !isLoading ? (
        <Button fillWidth size="large" variant="filled" onClick={updateConnectWalletStateKeys}>
          {t`Connect Wallet`}
        </Button>
      ) : isLoading ? (
        <Button fillWidth size="large" disabled variant="icon-filled">
          {t`Loading`} <Spinner isDisabled size={15} />
        </Button>
      ) : (
        children
      )}
    </>
  )
}

export default TransferActions
