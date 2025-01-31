import type { DeploymentType, GaugeType } from '@/dex/components/PageDeployGauge/types'
import type { ContractTransactionResponse } from 'ethers'
import type { PoolType, PoolTypes } from '@/dex/components/PageDeployGauge/types'
import type { GetState, SetState } from 'zustand'
import type { State } from '@/dex/store/useStore'
import produce from 'immer'
import { t } from '@lingui/macro'
import { shortenTokenAddress } from '@/dex/utils'
import { CurveApi, ChainId } from '@/dex/types/main.types'
import { useWalletStore } from '@ui-kit/features/connect-wallet'

type NetworkWithFactory = {
  chainId: ChainId
  name: string
  poolTypes: PoolTypes
}

type NetworksWithFactory = {
  [key: string]: NetworkWithFactory
}

type DeploymentStatus = {
  status: 'LOADING' | 'CONFIRMING' | 'ERROR' | 'SUCCESS' | ''
  transaction: ContractTransactionResponse | null
  errorMessage: string
}

type SidechainNav = 0 | 1

type SliceState = {
  curveNetworks: NetworksWithFactory
  sidechainGauge: boolean
  currentPoolType: PoolType | null
  currentSidechain: ChainId | null
  poolAddress: string
  lpTokenAddress: string
  linkPoolAddress: string
  sidechainNav: SidechainNav
  deploymentStatus: {
    mainnet: DeploymentStatus
    sidechain: DeploymentStatus
    mirror: DeploymentStatus
  }
}

const sliceKey = 'deployGauge'

export type DeployGaugeSlice = {
  [sliceKey]: SliceState & {
    setCurveNetworks: () => void
    setSidechainGauge: (bool: boolean) => void
    setCurrentPoolType: (poolType: PoolType | string) => void
    setCurrentSidechain: (chainName: string) => void
    setPoolAddress: (poolAddress: string) => void
    setLpTokenAddress: (lpTokenAddress: string) => void
    setLinkPoolAddress: (linkPoolAddress: string) => void
    setSidechainNav: (number: number) => void
    deployGauge: (curve: CurveApi, gaugeType: GaugeType, deploymentType: DeploymentType, isLite?: boolean) => void
    resetState: () => void
  }
}

const DEFAULT_STATE: SliceState = {
  curveNetworks: {},
  sidechainGauge: true,
  currentPoolType: null,
  currentSidechain: null,
  poolAddress: '',
  lpTokenAddress: '',
  linkPoolAddress: '',
  sidechainNav: 0,
  deploymentStatus: {
    mainnet: {
      status: '',
      transaction: null,
      errorMessage: '',
    },
    sidechain: {
      status: '',
      transaction: null,
      errorMessage: '',
    },
    mirror: {
      status: '',
      transaction: null,
      errorMessage: '',
    },
  },
}

const createDeployGaugeSlice = (set: SetState<State>, get: GetState<State>) => ({
  deployGauge: {
    ...DEFAULT_STATE,

    setCurveNetworks: () => {
      const networksWithFactory: NetworksWithFactory = {}

      const {
        networks: { networks },
      } = get()
      Object.entries(networks).forEach(([key, chain]) => {
        if (chain.hasFactory) {
          networksWithFactory[key] = {
            chainId: +key as ChainId,
            name: chain.name,
            poolTypes: {
              stableswap: chain.stableswapFactory,
              stableswapOld: chain.stableswapFactoryOld,
              twoCrypto: chain.twocryptoFactoryOld,
              twoCryptoNg: chain.twocryptoFactory,
              threeCrypto: chain.tricryptoFactory,
            },
          }
        }
      })

      set(
        produce((state: State) => {
          state.deployGauge.curveNetworks = networksWithFactory
        }),
      )
    },
    setCurrentPoolType: (poolType: PoolType) => {
      set(
        produce((state: State) => {
          state.deployGauge.currentPoolType = poolType
        }),
      )
    },
    setSidechainGauge: (bool: boolean) => {
      set(
        produce((state: State) => {
          state.deployGauge.sidechainGauge = bool
        }),
      )
    },
    setCurrentSidechain: (chainName: string) => {
      const curveNetworks = get().deployGauge.curveNetworks
      const chainNameLower = chainName.toLowerCase()

      const matchingEntry = Object.entries(curveNetworks).find(
        ([_, network]) => network.name.toLowerCase() === chainNameLower,
      )

      const matchingChainId: ChainId | null = matchingEntry ? (Number(matchingEntry[0]) as ChainId) : null

      set(
        produce((state: State) => {
          state.deployGauge.currentSidechain = matchingChainId
        }),
      )
    },
    setPoolAddress: (poolAddress: string) => {
      set(
        produce((state: State) => {
          state.deployGauge.poolAddress = poolAddress
        }),
      )
    },
    setLpTokenAddress: (lpTokenAddress: string) => {
      set(
        produce((state: State) => {
          state.deployGauge.lpTokenAddress = lpTokenAddress
        }),
      )
    },
    setSidechainNav: (number: SidechainNav) => {
      set(
        produce((state: State) => {
          state.deployGauge.sidechainNav = number
        }),
      )
    },
    setLinkPoolAddress: (linkPoolAddress: string) => {
      set(
        produce((state) => {
          state.deployGauge.linkPoolAddress = linkPoolAddress
        }),
      )
    },
    deployGauge: async (curve: CurveApi, gaugeType: GaugeType, deploymentType: DeploymentType, isLite = false) => {
      const { poolAddress, lpTokenAddress, sidechainGauge, currentSidechain } = get().deployGauge
      const chainId = curve.chainId
      const fetchGasInfo = get().gas.fetchGasInfo
      const { notify: notifyNotification } = useWalletStore.getState()
      const tokenAddress = sidechainGauge ? lpTokenAddress : poolAddress
      const shortenAddress = shortenTokenAddress(tokenAddress)

      let dismissNotificationHandler

      const notifyPendingMessage = t`Please confirm to deploy gauge for ${shortenAddress}.`
      const { dismiss: dismissConfirm } = notifyNotification(notifyPendingMessage, 'pending')

      dismissNotificationHandler = dismissConfirm

      await fetchGasInfo(curve)

      // --- MAINNET GAUGE ---
      if (deploymentType === 'MAINNETGAUGE') {
        set(
          produce((state: State) => {
            state.deployGauge.deploymentStatus.mainnet.status = 'CONFIRMING'
          }),
        )

        if (gaugeType === 'STABLENG') {
          try {
            const deployGaugeTx = await curve.stableNgFactory.deployGauge(tokenAddress)

            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'LOADING'
                state.deployGauge.deploymentStatus.mainnet.transaction = deployGaugeTx
              }),
            )
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying gauge for ${shortenAddress}...`
            const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            const gaugeAddress = await curve.stableNgFactory.getDeployedGaugeAddress(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'SUCCESS'
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Mainnet gauge deployment successful.`
            notifyNotification(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'ERROR'
                state.deployGauge.deploymentStatus.mainnet.errorMessage = error.message
              }),
            )
            console.log(error)
          }
        }

        if (gaugeType === 'TWOCRYPTO') {
          try {
            const deployGaugeTx = await curve.cryptoFactory.deployGauge(tokenAddress)

            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'LOADING'
                state.deployGauge.deploymentStatus.mainnet.transaction = deployGaugeTx
              }),
            )
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying gauge for ${shortenAddress}...`
            const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            const gaugeAddress = await curve.cryptoFactory.getDeployedGaugeAddress(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'SUCCESS'
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Mainnet gauge deployment successful.`
            notifyNotification(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'ERROR'
                state.deployGauge.deploymentStatus.mainnet.errorMessage = error.message
              }),
            )
            console.log(error)
          }
        }

        if (gaugeType === 'TWOCRYPTONG') {
          try {
            const deployGaugeTx = await curve.twocryptoFactory.deployGauge(tokenAddress)

            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'LOADING'
                state.deployGauge.deploymentStatus.mainnet.transaction = deployGaugeTx
              }),
            )
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying gauge for ${shortenAddress}...`
            const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            const gaugeAddress = await curve.twocryptoFactory.getDeployedGaugeAddress(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'SUCCESS'
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Mainnet gauge deployment successful.`
            notifyNotification(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'ERROR'
                state.deployGauge.deploymentStatus.mainnet.errorMessage = error.message
              }),
            )
            console.log(error)
          }
        }

        if (gaugeType === 'THREECRYPTO') {
          try {
            const deployGaugeTx = await curve.tricryptoFactory.deployGauge(tokenAddress)

            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'LOADING'
                state.deployGauge.deploymentStatus.mainnet.transaction = deployGaugeTx
              }),
            )
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying gauge for ${shortenAddress}...`
            const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            const gaugeAddress = await curve.tricryptoFactory.getDeployedGaugeAddress(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'SUCCESS'
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Mainnet gauge deployment successful.`
            notifyNotification(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'ERROR'
                state.deployGauge.deploymentStatus.mainnet.errorMessage = error.message
              }),
            )
            console.log(error)
          }
        }
        if (gaugeType === 'STABLEOLD') {
          try {
            const deployGaugeTx = await curve.factory.deployGauge(tokenAddress)

            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'LOADING'
                state.deployGauge.deploymentStatus.mainnet.transaction = deployGaugeTx
              }),
            )
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying gauge for ${shortenAddress}...`
            const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            const gaugeAddress = await curve.factory.getDeployedGaugeAddress(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'SUCCESS'
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Mainnet gauge deployment successful.`
            notifyNotification(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'ERROR'
                state.deployGauge.deploymentStatus.mainnet.errorMessage = error.message
              }),
            )
            console.log(error)
          }
        }
      }

      // --- SIDECHAIN GAUGE ---
      if (deploymentType === 'SIDECHAINGAUGE') {
        set(
          produce((state: State) => {
            state.deployGauge.deploymentStatus.sidechain.status = 'CONFIRMING'
          }),
        )

        if (gaugeType === 'STABLENG') {
          try {
            const deployGaugeTx = await curve.stableNgFactory.deployGaugeSidechain(tokenAddress, cutSalt(tokenAddress))

            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'LOADING'
                state.deployGauge.deploymentStatus.sidechain.transaction = deployGaugeTx
              }),
            )
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying sidechain gauge for ${shortenAddress}...`
            const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            const gaugeAddress = await curve.stableNgFactory.getDeployedGaugeAddress(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'SUCCESS'
                state.deployGauge.sidechainNav = isLite ? 0 : 1
                state.deployGauge.currentSidechain = chainId
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Sidechain gauge deployment successful.`
            notifyNotification(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'ERROR'
                state.deployGauge.deploymentStatus.sidechain.errorMessage = error.message
              }),
            )
            console.log(error)
          }
        }
        if (gaugeType === 'TWOCRYPTO') {
          try {
            const deployGaugeTx = await curve.cryptoFactory.deployGaugeSidechain(tokenAddress, cutSalt(tokenAddress))

            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'LOADING'
                state.deployGauge.deploymentStatus.sidechain.transaction = deployGaugeTx
              }),
            )
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying sidechain gauge for ${shortenAddress}...`
            const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            const gaugeAddress = await curve.cryptoFactory.getDeployedGaugeAddress(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'SUCCESS'
                state.deployGauge.sidechainNav = isLite ? 0 : 1
                state.deployGauge.currentSidechain = chainId
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Sidechain gauge deployment successful.`
            notifyNotification(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'ERROR'
                state.deployGauge.deploymentStatus.sidechain.errorMessage = error.message
              }),
            )
            console.log(error)
          }
        }
        if (gaugeType === 'TWOCRYPTONG') {
          try {
            const deployGaugeTx = await curve.twocryptoFactory.deployGaugeSidechain(tokenAddress, cutSalt(tokenAddress))

            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'LOADING'
                state.deployGauge.deploymentStatus.sidechain.transaction = deployGaugeTx
              }),
            )
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying sidechain gauge for ${shortenAddress}...`
            const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            const gaugeAddress = await curve.twocryptoFactory.getDeployedGaugeAddress(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'SUCCESS'
                state.deployGauge.sidechainNav = isLite ? 0 : 1
                state.deployGauge.currentSidechain = chainId
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Sidechain gauge deployment successful.`
            notifyNotification(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'ERROR'
                state.deployGauge.deploymentStatus.sidechain.errorMessage = error.message
              }),
            )
            console.log(error)
          }
        }
        if (gaugeType === 'THREECRYPTO') {
          try {
            const deployGaugeTx = await curve.tricryptoFactory.deployGaugeSidechain(tokenAddress, cutSalt(tokenAddress))

            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'LOADING'
                state.deployGauge.deploymentStatus.sidechain.transaction = deployGaugeTx
              }),
            )
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying sidechain gauge for ${shortenAddress}...`
            const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            const gaugeAddress = await curve.tricryptoFactory.getDeployedGaugeAddress(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'SUCCESS'
                state.deployGauge.sidechainNav = isLite ? 0 : 1
                state.deployGauge.currentSidechain = chainId
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Sidechain gauge deployment successful.`
            notifyNotification(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'ERROR'
                state.deployGauge.deploymentStatus.sidechain.errorMessage = error.message
              }),
            )
            console.log(error)
          }
        }
        if (gaugeType === 'STABLEOLD') {
          try {
            const deployGaugeTx = await curve.factory.deployGaugeSidechain(tokenAddress, cutSalt(tokenAddress))

            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'LOADING'
                state.deployGauge.deploymentStatus.sidechain.transaction = deployGaugeTx
              }),
            )
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying sidechain gauge for ${shortenAddress}...`
            const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            const gaugeAddress = await curve.factory.getDeployedGaugeAddress(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'SUCCESS'
                state.deployGauge.sidechainNav = isLite ? 0 : 1
                state.deployGauge.currentSidechain = chainId
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Sidechain gauge deployment successful.`
            notifyNotification(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'ERROR'
                state.deployGauge.deploymentStatus.sidechain.errorMessage = error.message
              }),
            )
            console.log(error)
          }
        }
      }

      // --- MIRROR GAUGE ---
      if (deploymentType === 'MIRRORGAUGE') {
        set(
          produce((state: State) => {
            state.deployGauge.deploymentStatus.mirror.status = 'CONFIRMING'
          }),
        )

        if (gaugeType === 'STABLENG') {
          try {
            const deployGaugeTx = await curve.stableNgFactory.deployGaugeMirror(
              currentSidechain!,
              cutSalt(lpTokenAddress),
            )

            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'LOADING'
                state.deployGauge.deploymentStatus.mirror.transaction = deployGaugeTx
              }),
            )
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying mirror gauge for ${shortenAddress}...`
            const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            const gaugeAddress = await curve.stableNgFactory.getDeployedGaugeMirrorAddressByTx(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'SUCCESS'
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Mirror gauge deployment successful.`
            notifyNotification(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'ERROR'
                state.deployGauge.deploymentStatus.mirror.errorMessage = error.message
              }),
            )
            console.log(error)
          }
        }
        if (gaugeType === 'TWOCRYPTO') {
          try {
            const deployGaugeTx = await curve.cryptoFactory.deployGaugeMirror(
              currentSidechain!,
              cutSalt(lpTokenAddress),
            )

            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'LOADING'
                state.deployGauge.deploymentStatus.mirror.transaction = deployGaugeTx
              }),
            )
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying mirror gauge for ${shortenAddress}...`
            const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            const gaugeAddress = await curve.cryptoFactory.getDeployedGaugeMirrorAddressByTx(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'SUCCESS'
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Mirror gauge deployment successful.`
            notifyNotification(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'ERROR'
                state.deployGauge.deploymentStatus.mirror.errorMessage = error.message
              }),
            )
            console.log(error)
          }
        }
        if (gaugeType === 'TWOCRYPTONG') {
          try {
            const deployGaugeTx = await curve.twocryptoFactory.deployGaugeMirror(
              currentSidechain!,
              cutSalt(lpTokenAddress),
            )

            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'LOADING'
                state.deployGauge.deploymentStatus.mirror.transaction = deployGaugeTx
              }),
            )
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying mirror gauge for ${shortenAddress}...`
            const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            const gaugeAddress = await curve.twocryptoFactory.getDeployedGaugeMirrorAddressByTx(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'SUCCESS'
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Mirror gauge deployment successful.`
            notifyNotification(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'ERROR'
                state.deployGauge.deploymentStatus.mirror.errorMessage = error.message
              }),
            )
            console.log(error)
          }
        }
        if (gaugeType === 'THREECRYPTO') {
          try {
            const deployGaugeTx = await curve.tricryptoFactory.deployGaugeMirror(
              currentSidechain!,
              cutSalt(lpTokenAddress),
            )

            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'LOADING'
                state.deployGauge.deploymentStatus.mirror.transaction = deployGaugeTx
              }),
            )
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying mirror gauge for ${shortenAddress}...`
            const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            const gaugeAddress = await curve.tricryptoFactory.getDeployedGaugeMirrorAddressByTx(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'SUCCESS'
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Mirror gauge deployment successful.`
            notifyNotification(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'ERROR'
                state.deployGauge.deploymentStatus.mirror.errorMessage = error.message
              }),
            )
            console.log(error)
          }
        }
        if (gaugeType === 'STABLEOLD') {
          try {
            const deployGaugeTx = await curve.factory.deployGaugeMirror(currentSidechain!, cutSalt(lpTokenAddress))

            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'LOADING'
                state.deployGauge.deploymentStatus.mirror.transaction = deployGaugeTx
              }),
            )
            dismissConfirm()
            const deployingNotificationMessage = t`Deploying mirror gauge for ${shortenAddress}...`
            const { dismiss: dismissDeploying } = notifyNotification(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            const gaugeAddress = await curve.factory.getDeployedGaugeMirrorAddressByTx(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'SUCCESS'
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Mirror gauge deployment successful.`
            notifyNotification(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'ERROR'
                state.deployGauge.deploymentStatus.mirror.errorMessage = error.message
              }),
            )
            console.log(error)
          }
        }
      }
    },
    resetState: () => {
      set(
        produce((state) => {
          state.deployGauge = { ...get().deployGauge, DEFAULT_STATE }
        }),
      )
    },
  },
})

export default createDeployGaugeSlice

function cutSalt(address: string) {
  return address.substring(0, 16)
}
