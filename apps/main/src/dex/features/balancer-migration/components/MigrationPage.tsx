import type { ReactNode } from 'react'
import { getPath } from '@/dex/utils/utilsRouter'
import { ConnectWalletPrompt } from '@evm-ui/features/connect-wallet'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import { recordEntries } from '@primitives/objects.utils'
import { TabsSwitcher } from '@ui/components/Tabs/TabsSwitcher'
import { DetailPageLayout } from '@ui/features/layout/DetailPageLayout/DetailPageLayout'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ArrowDownIcon } from '@ui/icons/ArrowDownIcon'
import { t } from '@ui/lib/i18n'
import { useMigrationUser } from '../hooks/useMigrationUser'

const { Spacing } = SizesAndSpaces

export type MigrationSource = 'balancer' | 'uniswap'

const SOURCES = {
  balancer: { label: t`Migrate from Balancer`, path: '/migrate-balancer' },
  uniswap: { label: t`Migrate from Uniswap`, path: '/migrate-uniswap' },
} satisfies Record<MigrationSource, { label: string; path: string }>

/** Sits beside the table titles on desktop and between the stacked tables below it. */
const MigrationArrow = () => (
  <Stack sx={{ alignSelf: { mobile: 'center', desktop: 'start' } }}>
    <ArrowDownIcon sx={{ transform: { desktop: 'rotate(-90deg)' } }} />
  </Stack>
)

/**
 * Shared shell of the migration pages: the source tabs, the source and target tables side by side, and the form.
 * `isSupportedChain` is per source, so a network can support one source and not the other.
 */
export const MigrationPage = ({
  source,
  blockchainId,
  isSupportedChain,
  sourceTable,
  targetTable,
  details,
  showForm,
  form,
}: {
  source: MigrationSource
  blockchainId: string
  isSupportedChain: boolean
  sourceTable: ReactNode
  /** Shown once the user has a position to migrate. */
  targetTable: ReactNode
  /** Full-width content under the tables, e.g. a comparison of the selected positions. */
  details?: ReactNode
  /** Whether the form column is shown; it shows a skeleton until `form` is ready. */
  showForm: boolean
  form: ReactNode
}) => {
  const userAddress = useMigrationUser()
  return (
    <DetailPageLayout formTabs={showForm ? { content: form } : null} testId={`${source}-migration-page`}>
      {userAddress && isSupportedChain ? (
        <Stack sx={{ gap: Spacing.md }}>
          <Stack>
            <TabsSwitcher
              variant="contained"
              value={source}
              options={recordEntries(SOURCES).map(([value, { label, path }]) => ({
                value,
                label,
                href: getPath({ network: blockchainId }, path),
              }))}
            />
            <Stack
              direction={{ mobile: 'column', desktop: 'row' }}
              sx={{ gap: Spacing.md, padding: Spacing.md, backgroundColor: t => t.design.Layer[1].Fill }}
            >
              <Stack sx={{ flex: 1, minWidth: 0 }}>{sourceTable}</Stack>
              {targetTable && (
                <>
                  <MigrationArrow />
                  <Stack sx={{ flex: 1, minWidth: 0 }}>{targetTable}</Stack>
                </>
              )}
            </Stack>
          </Stack>
          {details}
        </Stack>
      ) : userAddress ? (
        <Alert variant="outlined" severity="info">{t`This migration isn't available on this network.`}</Alert>
      ) : (
        <ConnectWalletPrompt description={t`Connect your wallet to see the positions you can migrate.`} />
      )}
    </DetailPageLayout>
  )
}
