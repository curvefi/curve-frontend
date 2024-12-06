import { ethers } from 'ethers'
import EventEmitter from 'events'

/**
 * @description The `Eip1193BridgeV6` class extends `EventEmitter` to expose a standard EIP-1193 provider interface
 * using an underlying Ethers Signer and Provider. This class is part of the `curve-frontend` package
 * and is designed to be compatible with ethers.js version 6, enhancing integration with other libraries that expect
 * an EIP-1193 compliant provider. This serves as an evolution from the older implementation available in ethers v5.
 *
 *
 * @extends EventEmitter
 * @class Eip1193BridgeV6
 */
export class Eip1193BridgeV6 extends EventEmitter {
  readonly signer: ethers.HDNodeWallet
  readonly provider: ethers.HDNodeWallet['provider']

  constructor(signer: ethers.HDNodeWallet, provider?: ethers.HDNodeWallet['provider']) {
    super()
    this.signer = signer
    this.provider = provider ?? signer.provider
  }

  request(request: { method: string; params?: Array<any> }): Promise<any> {
    return this.send(request.method, request.params || [])
  }

  async send(method: string, params?: any[]): Promise<any> {
    function throwUnsupported(message: string): ethers.UnsupportedOperationError {
      const errorInfo = {
        operation: method,
      }

      return ethers.makeError<ethers.ErrorCode, ethers.UnsupportedOperationError>(
        message,
        'UNSUPPORTED_OPERATION',
        errorInfo,
      )
    }

    if (!this.provider) return null

    let coerce = (value: any) => value

    switch (method) {
      case 'eth_gasPrice': {
        const result = (await this.provider.getFeeData()).gasPrice
        return result ? ethers.toQuantity(result) : null
      }

      case 'eth_accounts':
      case 'eth_requestAccounts': {
        const result = []

        if (this.signer) {
          const address = await this.signer.getAddress()
          result.push(address)
        }

        return result
      }

      case 'eth_blockNumber': {
        return await this.provider.getBlockNumber()
      }

      case 'eth_chainId': {
        const result = await this.provider.getNetwork()
        return ethers.toQuantity(result.chainId)
      }

      case 'eth_getBalance': {
        const result = await this.provider.getBalance(params![0], params![1])
        return ethers.toQuantity(result)
      }

      case 'eth_getStorageAt': {
        return this.provider.getStorage(params![0], params![1], params![2])
      }

      case 'eth_getTransactionCount': {
        const result = await this.provider.getTransactionCount(params![0], params![1])
        return ethers.toQuantity(BigInt(result))
      }

      case 'eth_getBlockTransactionCountByHash':
      case 'eth_getBlockTransactionCountByNumber': {
        const result = await this.provider.getBlock(params![0])
        return result ? ethers.toQuantity(BigInt(result.transactions.length)) : result
      }

      case 'eth_getCode': {
        return await this.provider.getCode(params![0], params![1])
      }

      case 'eth_sendRawTransaction': {
        return await this.signer.sendTransaction(params![0])
      }

      case 'eth_call': {
        return await this.provider.call(params![0])
      }

      case 'estimateGas': {
        if (params![1] && params![1] !== 'latest') {
          throwUnsupported('estimateGas does not support blockTag')
        }

        const result = await this.provider.estimateGas(params![0])
        return ethers.toQuantity(result)
      }

      // @TODO: Transform? No uncles?
      case 'eth_getBlockByHash':
      case 'eth_getBlockByNumber': {
        if (params![1]) {
          return await this.provider.getBlock(params![0], true)
        } else {
          return await this.provider.getBlock(params![0])
        }
      }

      case 'eth_getTransactionByHash': {
        return await this.provider.getTransaction(params![0])
      }

      case 'eth_getTransactionReceipt': {
        return await this.provider.getTransactionReceipt(params![0])
      }

      case 'eth_sign': {
        if (!this.signer) {
          return throwUnsupported('eth_sign requires an account')
        }

        const address = await this.signer.getAddress()

        if (address !== ethers.getAddress(params![0])) {
          ethers.makeError('account mismatch or account not found', 'INVALID_ARGUMENT', {
            argument: 'address',
            value: params![0],
          })
        }

        return this.signer.signMessage(ethers.getBytes(params![1]))
      }

      case 'eth_sendTransaction': {
        if (!this.signer) {
          return throwUnsupported('eth_sendTransaction requires an account')
        }

        const args = { ...params![0] }

        delete args.gas

        const tx = await this.signer.sendTransaction(args as any)
        return tx.hash
      }

      case 'eth_getUncleCountByBlockHash':
      case 'eth_getUncleCountByBlockNumber': {
        coerce = ethers.toQuantity
        break
      }

      case 'eth_getTransactionByBlockHashAndIndex':
      case 'eth_getTransactionByBlockNumberAndIndex':
      case 'eth_getUncleByBlockHashAndIndex':
      case 'eth_getUncleByBlockNumberAndIndex':
      case 'eth_newFilter':
      case 'eth_newBlockFilter':
      case 'eth_newPendingTransactionFilter':
      case 'eth_uninstallFilter':
      case 'eth_getFilterChanges':
      case 'eth_getFilterLogs':
      case 'eth_getLogs':
        break
    }

    // If our provider supports send, maybe it can do a better job?
    if ((<any>this.provider).send) {
      const result = await (<any>this.provider).send(method, params)
      return coerce(result)
    }

    return throwUnsupported(`unsupported method: ${method}`)
  }
}
