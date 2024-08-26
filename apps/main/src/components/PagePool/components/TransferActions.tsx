import type { TransferProps } from '@/components/PagePool/types'

import React from 'react'
import { t } from '@lingui/macro'

import { formatNumber } from '@/ui/utils'
import { getChainPoolIdActiveKey, shortenTokenName } from '@/utils'
import useStore from '@/store/useStore'
import useTokenAlert from '@/hooks/useTokenAlert'

import AlertBox from '@/ui/AlertBox'
import FormConnectWallet from '@/components/FormConnectWallet'

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
  const connectState = useStore((state) => state.connectState)
  const currencyReserves = useStore((state) => state.pools.currencyReserves[getChainPoolIdActiveKey(rChainId, rPoolId)])
  const walletBalancesLoading = useStore((state) => state.user.walletBalancesLoading)
  const poolTotal = currencyReserves?.total

  const isLoading =
    loading || typeof poolData === 'undefined' || typeof poolTotal === 'undefined' || connectState.status === 'loading'

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
      <FormConnectWallet loading={isLoading}>{children}</FormConnectWallet>
    </>
  )
}

export default TransferActions
