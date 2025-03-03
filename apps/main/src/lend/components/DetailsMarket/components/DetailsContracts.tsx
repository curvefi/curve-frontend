import { t } from '@ui-kit/lib/i18n'
import { INVALID_ADDRESS } from '@/lend/constants'
import { SubTitle } from '@/lend/components/DetailsMarket/styles'
import Box from '@ui/Box'
import Chip from '@ui/Typography/Chip'
import ChipInactive from '@/lend/components/ChipInactive'
import DetailInfoAddressLookup from '@/lend/components/DetailsMarket/components/DetailInfoAddressLookup'
import TokenLabel from '@/lend/components/TokenLabel'
import { PageContentProps } from '@/lend/types/lend.types'
import { ReactNode } from 'react'

type ContractItems = { label: ReactNode; address: string | undefined; invalidText?: string }[]

const DetailsContracts = ({
  rChainId,
  market,
  type,
}: Pick<PageContentProps, 'rChainId' | 'market'> & {
  type: 'borrow' | 'supply'
}) => {
  const { addresses, borrowed_token, collateral_token } = market ?? {}

  // prettier-ignore
  let contracts: { borrow: ContractItems[], supply: ContractItems[] } = {
    borrow: [
      [
        { label: <TokenLabel isDisplayOnly rChainId={rChainId} token={collateral_token} />, address: addresses?.collateral_token },
        { label: <TokenLabel isDisplayOnly rChainId={rChainId} token={borrowed_token} />, address: addresses?.borrowed_token },
      ],
      [
        { label: 'AMM', address: addresses?.amm },
        { label: t`Controller`, address: addresses?.controller },
        { label: t`Monetary policy`, address: addresses?.monetary_policy },
      ],
    ],
    supply: [
      [
        { label: <TokenLabel isDisplayOnly rChainId={rChainId} token={borrowed_token} />, address: addresses?.borrowed_token },
        { label: <TokenLabel isDisplayOnly rChainId={rChainId} token={collateral_token} />, address: addresses?.collateral_token },
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
        {contracts[type].map((contracts, idx) => (
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
        ))}
      </Box>
    </>
  )
}

export default DetailsContracts
