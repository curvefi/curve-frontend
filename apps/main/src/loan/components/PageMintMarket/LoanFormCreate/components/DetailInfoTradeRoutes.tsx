import { useMemo } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { RouteTrack } from '@ui-kit/widgets/RouteTrack'

const { Spacing } = SizesAndSpaces

export const DetailInfoTradeRoutes = ({
  input,
  inputSymbol,
  loading,
  output,
  outputSymbol,
  routes,
}: {
  input: string
  inputSymbol: string
  loading: boolean
  output: string | number
  outputSymbol: string
  routes: string
}) => {
  const parsedRoutes = useMemo(() => routes?.split(/\s*-->\s*|\s*->\s*/) || [], [routes])
  const isMultiRoutes = parsedRoutes.length > 1

  return (
    <ActionInfo
      label={t`Trade routed through:`}
      value={
        parsedRoutes?.length ? (
          <WithWrapper shouldWrap={isMultiRoutes} Wrapper={Stack} direction="row" gap={Spacing.sm}>
            {isMultiRoutes && <RouteTrack />}
            <WithWrapper shouldWrap={isMultiRoutes} Wrapper={Stack} width="100%">
              {parsedRoutes.map((route, i) => {
                const from = !i && input && `${formatNumber(input)} ${inputSymbol}`
                const to = i === parsedRoutes.length - 1 && output && `receive ${formatNumber(output)} ${outputSymbol}`
                return (
                  <Stack key={route} direction="row" justifyContent="space-between" title={route}>
                    <Typography
                      sx={{
                        maxWidth: 120,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      variant="bodySBold"
                    >
                      {route}
                    </Typography>
                    <Typography variant="bodySRegular">{(isMultiRoutes && from) || to}</Typography>
                  </Stack>
                )
              })}
            </WithWrapper>
          </WithWrapper>
        ) : (
          '-'
        )
      }
      {...(parsedRoutes && {
        alignItems: 'start',
        sx: {
          flexWrap: 'wrap',
          // for some reason the routes are not taking 100% width, and we need to override the ActionInfo styles
          '& .ActionInfo-valueGroup': {
            flexBasis: '100%',
            '& .ActionInfo-value': { flexBasis: '100%', '& > .MuiTypography-root': { width: '100%' } },
          },
        },
      })}
      loading={loading && [180, 24]}
    />
  )
}
