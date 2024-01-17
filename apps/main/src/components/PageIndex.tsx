import type { NextPage } from 'next'

import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ROUTE } from '@/constants'
import { useConnectWallet } from 'onboard-helpers'
import { getPath } from '@/utils/utilsRouter'
import { getStorageValue } from '@/utils'
import { getWalletChainId } from '@/store/createWalletSlice'
import networks from '@/networks'

/*
  Determine which network to switch to.
    If localstorage has walletName, connect wallet and redirect to `/<wallet's network>/swap`
    If walletName is not found in localstorage or rejected connection, redirect to `/ethereum/swap`
 */
const PageIndex: NextPage<PageProps> = () => {
  const params = useParams()
  const navigate = useNavigate()
  const [{ wallet }, connect, disconnect] = useConnectWallet()

  const defaultPath = getPath({ ...params, network: 'ethereum' }, ROUTE.PAGE_SWAP)

  useEffect(() => {
    const { walletName = '' } = getStorageValue('APP_CACHE') ?? {}
    if (!walletName) {
      navigate(defaultPath)
    } else {
      ;(async () => {
        if (wallet) await disconnect(wallet)
        const walletsState = await connect({ autoSelect: { label: walletName, disableModals: true } })
        const firstWallet = walletsState[0]

        if (!firstWallet) {
          navigate(defaultPath)
        } else {
          const walletChainId = getWalletChainId(firstWallet)
          const walletNetwork = networks[walletChainId as ChainId]?.id

          if (walletNetwork) {
            navigate(getPath({ ...params, network: walletNetwork }, ROUTE.PAGE_SWAP))
          } else {
            navigate(defaultPath)
          }
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <></>
}

export default PageIndex
