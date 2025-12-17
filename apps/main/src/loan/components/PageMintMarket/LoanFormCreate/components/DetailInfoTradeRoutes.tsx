import { useMemo } from 'react'
import { styled } from 'styled-components'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Box from '@ui/Box'
import { RCCircle } from '@ui/images'
import Loader from '@ui/Loader'
import { formatNumber } from '@ui/utils'
import { useActionInfo } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { RouteTrack } from '@ui-kit/widgets/RouteTrack'

const { Spacing } = SizesAndSpaces

const DetailInfoTradeRoutes = ({
  input,
  inputSymbol,
  isValidFormValues = true,
  loading,
  output,
  outputSymbol,
  routes,
}: {
  input: string
  inputSymbol: string
  isValidFormValues?: boolean
  loading: boolean
  output: string | number
  outputSymbol: string
  routes: string
}) => {
  const parsedRoutes = useMemo(() => routes?.split(/\s*-->\s*|\s*->\s*/) || [], [routes])
  const routesLength = parsedRoutes.length
  const isMultiRoutes = parsedRoutes.length > 1

  return useActionInfo() ? (
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
  ) : (
    <Wrapper grid gridAutoFlow="row">
      <Label isMultiRoutes>{t`Trade routed through:`}</Label>
      <Detail isMultiRoutes>
        {loading ? (
          <Loader skeleton={[130, 19 * (routesLength || 1)]} />
        ) : isValidFormValues && routesLength > 0 ? (
          <DetailInfoRoute
            grid
            gridAutoFlow="column"
            gridColumnGap="1"
            gridTemplateColumns={routesLength === 1 ? '1fr' : 'auto 1fr'}
            flexJustifyContent={isMultiRoutes ? 'flex-start' : 'flex-end'}
            isMultiRoutes={isMultiRoutes}
          >
            {routesLength > 1 && (
              <RouteTravelDecor>
                <CircleIcon />
                <RouteTravelBar></RouteTravelBar>
                <CircleIcon />
              </RouteTravelDecor>
            )}
            <ul>
              {parsedRoutes.map((route, idx) => {
                const from =
                  idx === 0 && input ? (
                    <>
                      {formatNumber(input)} {inputSymbol}
                    </>
                  ) : (
                    ''
                  )

                const to =
                  idx === parsedRoutes.length - 1 && output ? (
                    <>
                      receive {formatNumber(output)} {outputSymbol}
                    </>
                  ) : (
                    ''
                  )
                return (
                  <Item key={`${route}`}>
                    <Box flex flexAlignItems="baseline" flexJustifyContent="space-between">
                      <RouteName title={route}>{route}</RouteName>{' '}
                      <RouteTradedInfo>{!isMultiRoutes ? to || '' : from || to || ''}</RouteTradedInfo>
                    </Box>
                  </Item>
                )
              })}
            </ul>
          </DetailInfoRoute>
        ) : (
          '-'
        )}
      </Detail>
    </Wrapper>
  )
}

const Item = styled.li`
  white-space: nowrap;
  text-align: left;
`

const RouteTradedInfo = styled.span`
  font-size: var(--font-size-1);
  font-weight: bold;
  padding: 1px 3px;
  opacity: 0.7;
  margin-left: 4px;
`

const RouteTravelBar = styled.div`
  border-left: 2px dotted;
  margin: -1px 0 -3px 3px;
  height: 100%;
  opacity: 0.5;
`

const CircleIcon = styled(RCCircle)`
  width: 0.5rem;
  height: 0.5rem;
  fill: currentColor;
`

const RouteTravelDecor = styled.div`
  height: calc(100% - 34px);
  margin-left: var(--spacing-1);
  margin-top: 0.1875rem; // 3px
  opacity: 0.7;
`

const Detail = styled(Box)<{ isMultiRoutes: boolean }>`
  padding-bottom: var(--spacing-1);
  ${({ isMultiRoutes }) => {
    if (!isMultiRoutes) {
      return `
        display: grid;
        grid-direction: row;
        grid-row-gap: 1;
        justify-content: flex-end;
        min-height: 1.7rem;
      `
    }
  }}
`

const DetailInfoRoute = styled(Box)<{ isMultiRoutes: boolean }>`
  ${({ isMultiRoutes }) => (!isMultiRoutes ? `margin-left: 10px;` : '')}
`

const Label = styled.strong<{ isMultiRoutes: boolean }>`
  padding-bottom: var(--spacing-1);

  ${({ isMultiRoutes }) => {
    if (isMultiRoutes) {
      return `
        padding-top: 6px;
      `
    } else {
      return `
        align-items: center;
        display: flex;
        min-height: 1.7rem;
      `
    }
  }}
`

const Wrapper = styled(Box)`
  font-size: var(--font-size-2);
`

const RouteName = styled.strong`
  display: inline-block;
  max-width: 120px;
  color: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
`

export default DetailInfoTradeRoutes
