import { ReactNode } from 'react'
import { zeroAddress } from 'viem'
import ChipInactive from '@/lend/components/ChipInactive'
import DetailInfoAddressLookup from '@/lend/components/DetailsMarket/components/DetailInfoAddressLookup'
import TokenLabel from '@/lend/components/TokenLabel'
import { PageContentProps } from '@/lend/types/lend.types'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@ui/Box'
import Chip from '@ui/Typography/Chip'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type ContractItems = { label: ReactNode; address: string | undefined; invalidText?: string }[]

const DetailsContracts = ({ rChainId, market }: Pick<PageContentProps, 'rChainId' | 'market'>) => {
  const { addresses, borrowed_token, collateral_token } = market ?? {}

  // prettier-ignore
  const contracts: ContractItems[] =
    [
      [
        { label: <TokenLabel isDisplayOnly rChainId={rChainId} token={collateral_token} />, address: addresses?.collateral_token },
        { label: <TokenLabel isDisplayOnly rChainId={rChainId} token={borrowed_token} />, address: addresses?.borrowed_token },
      ],
      [
        { label: 'AMM', address: addresses?.amm },
        { label: t`Vault`, address: addresses?.vault },
        { label: t`Controller`, address: addresses?.controller },
        { label: t`Gauge`, address: addresses?.gauge, invalidText: addresses?.gauge === zeroAddress ? t`No gauge` : '' },
        { label: t`Monetary policy`, address: addresses?.monetary_policy },
      ],
    ]

  return (
    <Stack gap={Spacing.xs}>
      <Typography variant="headingXsBold">{t`Contracts`}</Typography>
      <Box grid gridRowGap={3}>
        {contracts.map((contracts, idx) => (
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
    </Stack>
  )
}

export default DetailsContracts
