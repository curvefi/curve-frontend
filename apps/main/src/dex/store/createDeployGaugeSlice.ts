import type { ContractTransactionResponse } from 'ethers'
import { produce } from 'immer'
import type { StoreApi } from 'zustand'
import type { DeploymentType, GaugeType, PoolType, PoolTypes } from '@/dex/components/PageDeployGauge/types'
import type { State } from '@/dex/store/useStore'
import { ChainId, CurveApi } from '@/dex/types/main.types'
import { notify } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { shortenString } from '@ui-kit/utils'
import { getNetworks } from '../entities/networks'

type NetworkWithFactory = {
  chainId: ChainId
  name: string
  poolTypes: PoolTypes
  isTestnet: boolean
  isCrvRewardsEnabled: boolean
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
    setCurrentPoolType: (poolType: PoolType) => void
    setCurrentSidechain: (chainName: string) => void
    setPoolAddress: (poolAddress: string) => void
    setLpTokenAddress: (lpTokenAddress: string) => void
    setLinkPoolAddress: (linkPoolAddress: string) => void
    setSidechainNav: (number: SidechainNav) => void
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

export const createDeployGaugeSlice = (set: StoreApi<State>['setState'], get: StoreApi<State>['getState']) => ({
  deployGauge: {
    ...DEFAULT_STATE,

    setCurveNetworks: () => {
      const networksWithFactory: NetworksWithFactory = {}
      const networks = getNetworks()

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
            isTestnet: chain.isTestnet,
            isCrvRewardsEnabled: chain.isCrvRewardsEnabled,
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
      const tokenAddress = sidechainGauge ? lpTokenAddress.toLowerCase() : poolAddress.toLowerCase()
      const shortAddress = shortenString(tokenAddress)

      let dismissNotificationHandler

      const notifyPendingMessage = t`Please confirm to deploy gauge for ${shortAddress}.`
      const { dismiss: dismissConfirm } = notify(notifyPendingMessage, 'pending')

      dismissNotificationHandler = dismissConfirm

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
            const deployingNotificationMessage = t`Deploying gauge for ${shortAddress}...`
            const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            await curve.stableNgFactory.getDeployedGaugeAddress(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'SUCCESS'
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Mainnet gauge deployment successful.`
            notify(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'ERROR'
                state.deployGauge.deploymentStatus.mainnet.errorMessage = error.message
              }),
            )
            console.warn(error)
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
            const deployingNotificationMessage = t`Deploying gauge for ${shortAddress}...`
            const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            await curve.cryptoFactory.getDeployedGaugeAddress(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'SUCCESS'
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Mainnet gauge deployment successful.`
            notify(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'ERROR'
                state.deployGauge.deploymentStatus.mainnet.errorMessage = error.message
              }),
            )
            console.warn(error)
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
            const deployingNotificationMessage = t`Deploying gauge for ${shortAddress}...`
            const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            await curve.twocryptoFactory.getDeployedGaugeAddress(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'SUCCESS'
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Mainnet gauge deployment successful.`
            notify(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'ERROR'
                state.deployGauge.deploymentStatus.mainnet.errorMessage = error.message
              }),
            )
            console.warn(error)
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
            const deployingNotificationMessage = t`Deploying gauge for ${shortAddress}...`
            const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            await curve.tricryptoFactory.getDeployedGaugeAddress(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'SUCCESS'
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Mainnet gauge deployment successful.`
            notify(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'ERROR'
                state.deployGauge.deploymentStatus.mainnet.errorMessage = error.message
              }),
            )
            console.warn(error)
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
            const deployingNotificationMessage = t`Deploying gauge for ${shortAddress}...`
            const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            await curve.factory.getDeployedGaugeAddress(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'SUCCESS'
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Mainnet gauge deployment successful.`
            notify(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mainnet.status = 'ERROR'
                state.deployGauge.deploymentStatus.mainnet.errorMessage = error.message
              }),
            )
            console.warn(error)
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
            const deployingNotificationMessage = t`Deploying sidechain gauge for ${shortAddress}...`
            const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            await curve.stableNgFactory.getDeployedGaugeAddress(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'SUCCESS'
                state.deployGauge.sidechainNav = isLite ? 0 : 1
                state.deployGauge.currentSidechain = chainId
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Sidechain gauge deployment successful.`
            notify(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'ERROR'
                state.deployGauge.deploymentStatus.sidechain.errorMessage = error.message
              }),
            )
            console.warn(error)
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
            const deployingNotificationMessage = t`Deploying sidechain gauge for ${shortAddress}...`
            const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            await curve.cryptoFactory.getDeployedGaugeAddress(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'SUCCESS'
                state.deployGauge.sidechainNav = isLite ? 0 : 1
                state.deployGauge.currentSidechain = chainId
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Sidechain gauge deployment successful.`
            notify(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'ERROR'
                state.deployGauge.deploymentStatus.sidechain.errorMessage = error.message
              }),
            )
            console.warn(error)
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
            const deployingNotificationMessage = t`Deploying sidechain gauge for ${shortAddress}...`
            const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            await curve.twocryptoFactory.getDeployedGaugeAddress(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'SUCCESS'
                state.deployGauge.sidechainNav = isLite ? 0 : 1
                state.deployGauge.currentSidechain = chainId
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Sidechain gauge deployment successful.`
            notify(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'ERROR'
                state.deployGauge.deploymentStatus.sidechain.errorMessage = error.message
              }),
            )
            console.warn(error)
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
            const deployingNotificationMessage = t`Deploying sidechain gauge for ${shortAddress}...`
            const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            await curve.tricryptoFactory.getDeployedGaugeAddress(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'SUCCESS'
                state.deployGauge.sidechainNav = isLite ? 0 : 1
                state.deployGauge.currentSidechain = chainId
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Sidechain gauge deployment successful.`
            notify(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'ERROR'
                state.deployGauge.deploymentStatus.sidechain.errorMessage = error.message
              }),
            )
            console.warn(error)
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
            const deployingNotificationMessage = t`Deploying sidechain gauge for ${shortAddress}...`
            const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            await curve.factory.getDeployedGaugeAddress(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'SUCCESS'
                state.deployGauge.sidechainNav = isLite ? 0 : 1
                state.deployGauge.currentSidechain = chainId
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Sidechain gauge deployment successful.`
            notify(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.sidechain.status = 'ERROR'
                state.deployGauge.deploymentStatus.sidechain.errorMessage = error.message
              }),
            )
            console.warn(error)
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
            const deployingNotificationMessage = t`Deploying mirror gauge for ${shortAddress}...`
            const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            await curve.stableNgFactory.getDeployedGaugeMirrorAddressByTx(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'SUCCESS'
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Mirror gauge deployment successful.`
            notify(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'ERROR'
                state.deployGauge.deploymentStatus.mirror.errorMessage = error.message
              }),
            )
            console.warn(error)
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
            const deployingNotificationMessage = t`Deploying mirror gauge for ${shortAddress}...`
            const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            await curve.cryptoFactory.getDeployedGaugeMirrorAddressByTx(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'SUCCESS'
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Mirror gauge deployment successful.`
            notify(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'ERROR'
                state.deployGauge.deploymentStatus.mirror.errorMessage = error.message
              }),
            )
            console.warn(error)
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
            const deployingNotificationMessage = t`Deploying mirror gauge for ${shortAddress}...`
            const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            await curve.twocryptoFactory.getDeployedGaugeMirrorAddressByTx(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'SUCCESS'
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Mirror gauge deployment successful.`
            notify(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'ERROR'
                state.deployGauge.deploymentStatus.mirror.errorMessage = error.message
              }),
            )
            console.warn(error)
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
            const deployingNotificationMessage = t`Deploying mirror gauge for ${shortAddress}...`
            const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            await curve.tricryptoFactory.getDeployedGaugeMirrorAddressByTx(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'SUCCESS'
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Mirror gauge deployment successful.`
            notify(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'ERROR'
                state.deployGauge.deploymentStatus.mirror.errorMessage = error.message
              }),
            )
            console.warn(error)
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
            const deployingNotificationMessage = t`Deploying mirror gauge for ${shortAddress}...`
            const { dismiss: dismissDeploying } = notify(deployingNotificationMessage, 'pending')

            dismissNotificationHandler = dismissDeploying

            await curve.factory.getDeployedGaugeMirrorAddressByTx(deployGaugeTx)
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'SUCCESS'
              }),
            )
            dismissDeploying()
            const successNotificationMessage = t`Mirror gauge deployment successful.`
            notify(successNotificationMessage, 'success', 15000)
          } catch (error) {
            dismissNotificationHandler()
            set(
              produce((state) => {
                state.deployGauge.deploymentStatus.mirror.status = 'ERROR'
                state.deployGauge.deploymentStatus.mirror.errorMessage = error.message
              }),
            )
            console.warn(error)
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

function cutSalt(address: string) {
  return address.substring(0, 16)
}
