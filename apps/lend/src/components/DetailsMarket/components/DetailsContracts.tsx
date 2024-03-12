import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { INVALID_ADDRESS } from '@/constants'

import { SubTitle } from '@/components/DetailsMarket/styles'
import Box from '@/ui/Box'
import Chip from '@/ui/Typography/Chip'
import ChipInactive from '@/components/ChipInactive'
import DetailInfoAddressLookup from '@/components/DetailsMarket/components/DetailInfoAddressLookup'
import TokenLabel from '@/components/TokenLabel'

type ContractItems = { label: string | React.ReactNode; address: string | undefined; invalidText?: string }[]

const DetailsContracts = ({
  rChainId,
  owmDataCachedOrApi,
  borrowed_token,
  collateral_token,
  type,
}: Pick<PageContentProps, 'rChainId' | 'owmDataCachedOrApi' | 'borrowed_token' | 'collateral_token'> & {
  type: 'borrow' | 'supply'
}) => {
  const { addresses } = owmDataCachedOrApi?.owm ?? {}

  // prettier-ignore
  let contracts: { borrow: ContractItems[], supply: ContractItems[] } = {
    borrow: [
      [
        { label: <TokenWrapper><Chip isBold size="sm">{t`Collateral`}</Chip> <TokenLabel isDisplayOnly rChainId={rChainId} token={collateral_token} /></TokenWrapper>, address: addresses?.collateral_token },
        { label: <TokenWrapper><Chip isBold size="sm">{t`Borrowed`}</Chip> <TokenLabel isDisplayOnly rChainId={rChainId} token={borrowed_token} /></TokenWrapper>, address: addresses?.borrowed_token },
      ],
      [
        { label: 'AMM', address: addresses?.amm },
        { label: t`Controller`, address: addresses?.controller },
        { label: t`Monetary policy`, address: addresses?.monetary_policy },
      ],
    ],
    supply: [
      [
        { label: <TokenWrapper><Chip isBold size="sm">{t`Borrowed`}</Chip> <TokenLabel isDisplayOnly rChainId={rChainId} token={borrowed_token} /></TokenWrapper>, address: addresses?.borrowed_token }
      ],
      [
        { label: t`Vault`, address: addresses?.vault },
        { label: t`Gauge`, address: addresses?.gauge, invalidText: addresses?.gauge === INVALID_ADDRESS ? t`No gauge` : '' }
      ],
    ]
  }

  return (
    <>
      <SubTitle>{t`Contracts`}</SubTitle>
      <Box grid gridRowGap={3}>
        {contracts[type].map((contracts, idx) => {
          return (
            <div key={`contracts-${idx}`}>
              {contracts.map(({ label, address, invalidText }, idx) => {
                const key = `${address}-${idx}`
                return invalidText ? (
                  <Box
                    key={key}
                    flex
                    flexJustifyContent="space-between"
                    padding="var(--spacing-1) 3.24rem var(--spacing-1) 0"
                  >
                    <Chip isBold size="sm">{t`Gauge`}</Chip>
                    <ChipInactive>{invalidText}</ChipInactive>
                  </Box>
                ) : (
                  <DetailInfoAddressLookup
                    key={key}
                    isBorderBottom={idx !== contracts.length - 1 && !contracts[idx + 1]?.invalidText}
                    chainId={rChainId}
                    title={label}
                    address={address}
                  />
                )
              })}
            </div>
          )
        })}
      </Box>
    </>
  )
}

const TokenWrapper = styled.div`
  display: grid;
  grid-gap: var(--spacing-1);
  justify-items: flex-start;
  padding-bottom: var(--spacing-1);
  padding-top: var(--spacing-1);
`

export default DetailsContracts
