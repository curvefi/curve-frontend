import { SelectableChip } from '@ui/components/SelectableChip'
import { Tooltip } from '@ui/components/Tooltip'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { ActiveIcon } from '@ui/icons/ActiveIcon'
import { t } from '@ui/lib/i18n'
import { ACTIVE_POOL_DAYS } from '@ui/lib/time'

export const PoolsChips = ({
  activePoolsFilter,
  isLite,
}: {
  activePoolsFilter: { isSelected: boolean; toggle: () => void }
  isLite: boolean
}) => (
  <Tooltip
    title={t`Active pools`}
    body={
      isLite
        ? t`Only show pools with TVL above $0.`
        : t`Only show pools with TVL above $0 that are at least ${ACTIVE_POOL_DAYS} days old.`
    }
    placement="top"
  >
    <SelectableChip
      label={!useIsMobile() && t`Active`}
      selected={activePoolsFilter.isSelected}
      aria-pressed={activePoolsFilter.isSelected}
      size="medium"
      variant="ghost"
      toggle={activePoolsFilter.toggle}
      icon={<ActiveIcon />}
      data-testid="chip-active"
    />
  </Tooltip>
)
