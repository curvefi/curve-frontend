import { ethers } from 'ethers'

export async function setEthBalance(account: string, amount: BigInt | string, provider: ethers.JsonRpcProvider) {
  amount = typeof amount === 'string' ? ethers.parseEther(amount) : amount
  const amountHex = `0x${amount.toString(16)}`
  await provider.send('hardhat_setBalance', [account, amountHex])
  const balance = await provider.getBalance(account)
  console.log(balance, amount)
  expect(balance, 'ETH balance').to.equal(amount)
}

export async function allocateToken(
  account: string,
  token: string,
  amount: bigint,
  whales: string[],
  provider: ethers.JsonRpcProvider
) {
  // find donor whale
  let donorWhale: string
  for (const whale of whales) {
    const whaleBalance = await getTokenBalance(token, whale, provider)
    if (whaleBalance >= amount) {
      donorWhale = whale
      break
    }
  }
  expect(donorWhale, 'donor whale').to.exist

  // transfer from whale
  await setEthBalance(donorWhale, '100', provider)
  const whaleSigner = await getImpersonatedSigner(donorWhale, provider)
  await transferToken(token, account, amount, whaleSigner)
  await stopImpersonation(donorWhale, provider)

  // check balance
  const balance = await getTokenBalance(token, account, provider)
  expect(balance, 'wallet token balance').to.equal(amount)
}

export const getTokenBalance = async (token: string, account: string, provider: ethers.Provider): Promise<bigint> => {
  const iERC20 = ['function balanceOf(address account) external view returns (uint256)']
  const erc20 = new ethers.Contract(token, iERC20, provider)
  return erc20.balanceOf(account)
}

export async function transferToken(token: string, account: string, amount: BigInt, provider: ethers.ContractRunner) {
  const iERC20 = ['function transfer(address to, uint amount) returns (bool)']
  const erc20 = new ethers.Contract(token, iERC20, provider)
  const tx: ethers.ContractTransactionResponse = await erc20.transfer(account, amount)
  await tx.wait()
}

export async function getImpersonatedSigner(
  address: string,
  provider: ethers.JsonRpcProvider
): Promise<ethers.JsonRpcSigner> {
  await provider.send('hardhat_impersonateAccount', [address])
  return new ethers.JsonRpcSigner(provider, address)
}

export async function stopImpersonation(address: string, provider: ethers.JsonRpcProvider): Promise<void> {
  await provider.send('hardhat_stopImpersonatingAccount', [address])
}
