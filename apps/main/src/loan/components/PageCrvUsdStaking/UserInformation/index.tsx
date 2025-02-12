import styled from 'styled-components'
import { t } from '@ui-kit/lib/i18n'
import Image from 'next/image'
import { RCCrvUSDLogoSM, RCScrvUSDLogoSM } from 'ui/src/images'
import Icon from '@ui/Icon'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { APP_LINK } from '@ui-kit/shared/routes'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { useTheme } from '@mui/material/styles'
import { YieldGrowth } from '@ui-kit/shared/icons/YieldGrowth'
const { Spacing, Sizing } = SizesAndSpaces

const UserInformation = () => {
  const {
    design: { Layer, Text },
  } = useTheme()

  return (
    <Stack direction="column" gap={Spacing.md} padding={Spacing.lg} sx={{ backgroundColor: Layer[1].Fill }}>
      <Typography alignSelf="center" variant="headingSBold">
        {t`How to get yield with Savings crvUSD?`}
      </Typography>
      <Stack
        direction="row"
        gap={Spacing.lg}
        sx={{
          flexWrap: {
            tablet: 'wrap',
            desktop: 'nowrap',
          },
        }}
      >
        <Stack direction="column" gap={Spacing.sm}>
          <Image src={RCCrvUSDLogoSM} alt="crvUSD logo" width={48} height={48} />
          <Typography variant="headingXsBold">{t`Get crvUSD`}</Typography>
          <Typography variant="bodyMRegular">
            {t`To access the yield of Savings crvUSD (scrvUSD), you need crvUSD.`}{' '}
            {t`You can acquire it on the open markets or borrow it in the LLAMALEND markets.`}
          </Typography>
          <Typography variant="bodyMRegular">
            {t`We recommend using Curve's`} <Link href={APP_LINK.main.root}>QuickSwap</Link>
            {t`, or alternatively an aggregator like`}{' '}
            <Link href="https://swap.cow.fi/#/1/swap/WETH/crvUSD">Cowswap</Link>.
          </Typography>
        </Stack>
        <Stack direction="column" gap={Spacing.sm}>
          <Image src={RCScrvUSDLogoSM} alt="scrvUSD logo" width={48} height={48} />
          <Typography variant="headingXsBold">{t`Deposit crvUSD and get scrvUSD`}</Typography>
          <Typography variant="bodyMRegular">
            {t`By depositing crvUSD in the Curve Savings Vault, you get`}{' '}
            <Link href="https://resources.curve.fi/crvusd/scrvusd/#how-to-deposit-and-withdraw-crvusd">scrvUSD</Link>.{' '}
            {t`This token  represents your share of all the crvUSD deposited in the vault. `}
          </Typography>
          <Typography variant="bodyMRegular">
            {t`scrvUSD is a yield-bearing stablecoin you can use further in DeFi.`}
          </Typography>
        </Stack>
        <Stack direction="column" gap={Spacing.sm}>
          <YieldGrowth
            sx={{
              width: 48,
              height: 48,
              '& path': {
                fill: Text.TextColors.Primary,
                stroke: Text.TextColors.Primary,
              },
            }}
          />
          <Typography variant="headingXsBold">{t`Watch your yield grow`}</Typography>
          <Typography variant="bodyMRegular">
            {t`Upon deposit, your crvUSD is instantly generating yield and your rewards get `}{' '}
            <Link href="https://resources.curve.fi/crvusd/scrvusd/#how-does-the-interest-accrue">
              {t`automatically compounded`}
            </Link>
            .
          </Typography>
          <Typography variant="bodyMRegular">
            {t`The more crvUSD’s market grows, the more revenue it generates and the more yield get directed to Savings crvUSD and veCRV holders.`}
          </Typography>
        </Stack>
      </Stack>
      <Button color="ghost" href="https://resources.curve.fi/crvusd/scrvusd/">
        {t`LEARN MORE`}
        <Icon name="ArrowUpRight" size={20} />
      </Button>
    </Stack>
  )
}

export default UserInformation
