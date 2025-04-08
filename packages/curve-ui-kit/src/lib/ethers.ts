import { ethers } from 'ethers'
import PromisePool from '@supercharge/promise-pool'

type Provider = ethers.BrowserProvider

export const waitForTransaction = async (hash: string, provider: Provider) => {
  const tx = await provider.waitForTransaction(hash)
  if (!tx?.status) {
    throw new Error(`Transaction ${hash} failed`)
  }
  return tx
}

export const waitForTransactions = async (hashes: string[], provider: Provider) => {
  const { results, errors } = await PromisePool.for(hashes).process((hash) => waitForTransaction(hash, provider))
  if (Array.isArray(errors) && errors.length > 0) {
    throw errors
  }
  return results
}
