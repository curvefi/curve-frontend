import Web3 from 'web3'

const httpProvider = new Web3.providers.HttpProvider(Cypress.env('RPC_URL'))
const minABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
]

export const getTokenBalance = async (tokenAddress: string, walletAddress: string) => {
  const web3Client = new Web3(httpProvider)
  const contract = new web3Client.eth.Contract(minABI, tokenAddress)
  const result = await contract.methods.balanceOf(walletAddress).call()
  return web3Client.utils.fromWei(result, 'ether')
}
