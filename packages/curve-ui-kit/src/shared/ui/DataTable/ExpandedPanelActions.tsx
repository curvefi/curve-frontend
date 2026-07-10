import { useId, useState } from 'react'
import Button, { type ButtonOwnProps, type ButtonProps } from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { splitAt } from '@primitives/array.utils'
import { t } from '@ui-kit/lib/i18n'
import { DotsVerticalIcon } from '@ui-kit/shared/icons/DotsVertical'
import { ExternalLink } from '@ui-kit/shared/ui/ExternalLink'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { DrawerHeader } from '@ui-kit/shared/ui/SwipeableDrawer/DrawerHeader'
import { DrawerItems } from '@ui-kit/shared/ui/SwipeableDrawer/DrawerItems'
import { SwipeableDrawer } from '@ui-kit/shared/ui/SwipeableDrawer/SwipeableDrawer'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { applySxProps } from '@ui-kit/utils'
import type { ExpandedPanelAction } from './data-table.utils'

const { MaxHeight, Spacing } = SizesAndSpaces
// number of button rendered before hiding the rest in a kebab menu
const VISIBLE_ACTION_COUNT = 2

const ExpandedPanelActionButton = ({ action, inDrawer }: { action: ExpandedPanelAction; inDrawer?: boolean }) => {
  const { id: _, label, href, testId, sx, type, color, size, ...buttonProps } = action

  const sharedProps = {
    ...buttonProps,
    color: inDrawer ? ('ghost' as const) : color,
    size: inDrawer ? 'medium' : size,
    sx: applySxProps({ flex: 1, minWidth: 0 }, sx),
    ...(testId && { 'data-testid': testId }),
  }

  return href?.startsWith('https') ? (
    <ExternalLink {...sharedProps} href={href} label={label} />
  ) : href ? (
    <Button {...(sharedProps as ButtonOwnProps)} component={RouterLink} href={href}>
      {label}
    </Button>
  ) : (
    <Button {...sharedProps} type={type ?? 'button'}>
      {label}
    </Button>
  )
}

export const ExpandedPanelActions = ({ actions }: { actions: readonly ExpandedPanelAction[] }) => {
  const [open, setOpen] = useState(false)
  const drawerId = useId()
  const [primaryActions, overflowActions] = splitAt([...actions], VISIBLE_ACTION_COUNT)
  const visibleButtonsSize = primaryActions[0].size ?? 'medium'

  return (
    <Stack direction="row" sx={{ gap: Spacing.xs }}>
      {primaryActions.map(action => (
        <ExpandedPanelActionButton key={action.id} action={action} />
      ))}
      {overflowActions.length > 0 && (
        <SwipeableDrawer
          paperSx={{ maxHeight: MaxHeight.drawer }}
          button={
            <IconButton
              aria-controls={drawerId}
              aria-expanded={open}
              aria-haspopup="dialog"
              aria-label={t`More actions`}
              color="primary"
              data-testid="expanded-panel-actions-menu-button"
              onClick={() => setOpen(true)}
              size={visibleButtonsSize}
            >
              <DotsVerticalIcon />
            </IconButton>
          }
          open={open}
          setOpen={setOpen}
        >
          <DrawerHeader title={t`More actions`} />
          <DrawerItems id={drawerId} data-testid="expanded-panel-actions-menu">
            {overflowActions.map(action => (
              <ExpandedPanelActionButton key={action.id} action={action} inDrawer />
            ))}
          </DrawerItems>
        </SwipeableDrawer>
      )}
    </Stack>
  )
}
