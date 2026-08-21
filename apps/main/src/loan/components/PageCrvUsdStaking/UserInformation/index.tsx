import type { NetworkUrlParams } from '@/loan/types/loan.types'
import { t } from '@evm-ui/lib/i18n'
import { YieldGrowth } from '@evm-ui/shared/icons/YieldGrowth'
import { DEX_ROUTES, getInternalUrl } from '@evm-ui/shared/routes'
import { ExternalLink } from '@evm-ui/shared/ui/ExternalLink'
import { RouterLink } from '@evm-ui/shared/ui/RouterLink'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { RCCrvUSDLogoSM, RCScrvUSDLogoSM } from '@legacy-ui/images'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const { Spacing } = SizesAndSpaces

export const UserInformation = ({ params: { network } }: { params: NetworkUrlParams }) => (
  <Card>
    <CardContent component={Stack} sx={{ gap: Spacing.md }} direction="column">
      <Typography variant="headingSBold" sx={{ alignSelf: 'center' }}>
        {t`How to get yield with Savings crvUSD?`}
      </Typography>
      <Stack
        direction="row"
        sx={{
          gap: Spacing.lg,

          flexWrap: {
            mobile: 'wrap',
            tablet: 'wrap',
            desktop: 'nowrap',
          },
        }}
      >
        <Stack sx={{ gap: Spacing.sm }}>
          <img src={RCCrvUSDLogoSM} alt="crvUSD logo" width={48} height={48} />
          <Typography variant="headingXsBold">{t`Get crvUSD`}</Typography>
          <Typography variant="bodyMRegular">
            {t`To access the yield of Savings crvUSD (scrvUSD), you need crvUSD.`}{' '}
            {t`You can acquire it on the open markets or borrow it in the LLAMALEND markets.`}
          </Typography>
          <Typography variant="bodyMRegular">
            {t`We recommend using Curve's`}{' '}
            <RouterLink href={getInternalUrl('dex', network, DEX_ROUTES.PAGE_SWAP)}>swap</RouterLink>
            {t`, or alternatively an aggregator like`}{' '}
            <Link href="https://swap.cow.fi/#/1/swap/WETH/scrvUSD">Cowswap</Link>.
          </Typography>
        </Stack>

        <Stack sx={{ gap: Spacing.sm }}>
          <img src={RCScrvUSDLogoSM} alt="scrvUSD logo" width={48} height={48} />
          <Typography variant="headingXsBold">{t`Deposit crvUSD and get scrvUSD`}</Typography>
          <Typography variant="bodyMRegular">
            {t`By depositing crvUSD in the Curve Savings Vault, you get`}{' '}
            <Link href="https://docs.curve.finance/user/yield/guides/deposit-scrvusd">scrvUSD</Link>.{' '}
            {t`This token  represents your share of all the crvUSD deposited in the vault. `}
          </Typography>
          <Typography variant="bodyMRegular">
            {t`scrvUSD is a yield-bearing stablecoin you can use further in DeFi.`}
          </Typography>
        </Stack>

        <Stack sx={{ gap: Spacing.sm }}>
          <YieldGrowth color="inherit" width={48} height={48} />
          <Typography variant="headingXsBold">{t`Watch your yield grow`}</Typography>
          <Typography variant="bodyMRegular">
            {t`Upon deposit, your crvUSD is instantly generating yield and your rewards get `}{' '}
            <Link href="https://docs.curve.finance/user/yield/scrvusd#how-scrvusd-works-earn-savings-on-your-crvusd">
              {t`automatically compounded`}
            </Link>
            .
          </Typography>
          <Typography variant="bodyMRegular">
            {t`The more crvUSD’s market grows, the more revenue it generates and the more yield get directed to Savings crvUSD and veCRV holders.`}
          </Typography>
        </Stack>
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <ExternalLink href="https://docs.curve.finance/user/curve-tokens/scrvusd" label={t`Learn More`} />
      </Box>
    </CardContent>
  </Card>
)
