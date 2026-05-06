import { useCallback } from 'react'
import { encodeFunctionData, type Address, type Hex } from 'viem'
import { mainnet } from 'viem/chains'
import { useConfig } from 'wagmi'
import { abi as abiAgent } from '@/dao/abis/AragonAgent'
import { abi as abiVoting } from '@/dao/abis/AragonVoting'
import { abi as abiGauge } from '@/dao/abis/GaugeController'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { useTransactionMutation } from '@ui-kit/lib/model/mutation/useTransactionMutation'
import { ARAGON_OWNERSHIP_AGENT, ARAGON_OWNERSHIP_VOTING, GAUGE_CONTROLLER } from '@ui-kit/utils'
import { writeContract } from '@wagmi/core'
import { createVoteFormValidationSuite } from './create-vote.validation'
import type { CreateVoteForm } from './useCreateVoteForm'

// Free account to push some IPFS vote description data. Exposing API keys in code is bad, but this is just a free account.
const PINATA_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlMzExMTg5NS0xOTc5LTQyYmYtOTllOC0xOGI0OTk5NTI3NjQiLCJlbWFpbCI6IjB4YWx1bmFyYUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYjUyYWE3Y2QwOTk0ZmM3MWI0ZWQiLCJzY29wZWRLZXlTZWNyZXQiOiJmMTBkNjY5NDU0NDk3NWRhMGIxMGY4NDRlZWU3Y2EzOTlmMDA0YTgyMGNjNjYxMmViZWFhMzMzZThhYmU2MzgyIiwiZXhwIjoxODA5Mjc4Mjk4fQ.USkSoDAdJLnVz3JFL8e3wJ1i-rv0GBfTLwgTHM3eYvc'

const buildEvmScript = (gaugeAddress: Address) => {
  const callData = encodeFunctionData({
    abi: abiGauge,
    functionName: 'add_gauge',
    args: [gaugeAddress, 10n, 0n],
  })

  const agentCalldata = encodeFunctionData({
    abi: abiAgent,
    functionName: 'execute',
    args: [GAUGE_CONTROLLER, 0n, callData],
  }).substring(2)

  const length = Math.floor(agentCalldata.length / 2)
    .toString(16)
    .padStart(8, '0')

  return `0x00000001${ARAGON_OWNERSHIP_AGENT.substring(2)}${length}${agentCalldata}` as Hex
}

const uploadDescriptionToIpfs = async (description: string) => {
  const voteDescription = description.replace(/(\r\n|\n|\r)/gm, '')

  const formData = new FormData()
  formData.append(
    'file',
    new Blob([JSON.stringify({ text: voteDescription })], { type: 'application/json' }),
    'vote.json',
  )
  formData.append('pinataMetadata', JSON.stringify({ name: 'curve-gauge-vote' }))
  formData.append('pinataOptions', JSON.stringify({ cidVersion: 0 }))

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`IPFS pin failed: ${response.status} ${await response.text()}`)
  }

  const { IpfsHash } = (await response.json()) as { IpfsHash: string }

  return IpfsHash
}

export const useCreateVoteMutation = ({ onReset }: { onReset: () => void }) => {
  const config = useConfig()

  const { mutate, error, isPending } = useTransactionMutation<CreateVoteForm>({
    mutationKey: [...rootKeys.chain({ chainId: mainnet.id }), 'create-gauge-vote'] as const,
    mutationFn: async ({ gaugeAddress, description }) => {
      const evmScript = buildEvmScript(gaugeAddress as Address)
      const ipfsHash = await uploadDescriptionToIpfs(description)
      const hash = await writeContract(config, {
        chainId: mainnet.id,
        abi: abiVoting,
        address: ARAGON_OWNERSHIP_VOTING,
        functionName: 'newVote',
        args: [evmScript, `ipfs:${ipfsHash}`, false, false],
      })
      return { hash: hash as Hex }
    },
    validationSuite: createVoteFormValidationSuite,
    validationParams: {},
    pendingMessage: () => t`Creating gauge addition vote...`,
    successMessage: () => t`Gauge addition vote created`,
    onReset,
  })

  const onSubmit = useCallback((form: CreateVoteForm) => mutate(form), [mutate])

  return { onSubmit, error, isPending }
}
