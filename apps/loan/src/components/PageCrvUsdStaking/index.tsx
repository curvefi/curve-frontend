import styled from 'styled-components'
import { useEffect } from 'react'

import useStore from '@/store/useStore'
import { useSignerAddress } from '@/entities/signer'
import { useChainId } from '@/entities/chain'

import StatsBanner from '@/components/PageCrvUsdStaking/StatsBanner'
import DepositWithdraw from '@/components/PageCrvUsdStaking/DepositWithdraw'
import UserInformation from '@/components/PageCrvUsdStaking/UserInformation'

const CrvUsdStaking = () => {
  const { fetchUserBalances, checkApproval, inputAmount, getExchangeRate } = useStore((state) => state.scrvusd)
  const lendApi = useStore((state) => state.lendApi)
  const { data: signerAddress } = useSignerAddress()
  const chainId = useChainId().data

  useEffect(() => {
    const fetchData = async () => {
      if (!lendApi || !signerAddress) return

      fetchUserBalances(signerAddress)
      getExchangeRate()
    }

    fetchData()
  }, [fetchUserBalances, lendApi, signerAddress, getExchangeRate])

  useEffect(() => {
    if (!lendApi || !chainId || !signerAddress || inputAmount === 0) return

    checkApproval.depositApprove(inputAmount)
  }, [checkApproval, lendApi, chainId, signerAddress, inputAmount])

  return (
    <Wrapper>
      <StyledStatsBanner />
      <StyledDepositWithdraw />
      <UserInformation />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 var(--spacing-4);
  gap: var(--spacing-4);
`

const StyledStatsBanner = styled(StatsBanner)``

const StyledDepositWithdraw = styled(DepositWithdraw)`
  margin: 0 auto;
`

export default CrvUsdStaking
