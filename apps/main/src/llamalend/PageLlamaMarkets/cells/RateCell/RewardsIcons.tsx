import uniq from 'lodash/uniq'
import type { ReactElement } from 'react'
import { LlamaMarket } from '@/llamalend/entities/llama-markets'
import { useFilteredRewards } from '@/llamalend/PageLlamaMarkets/cells/cell.format'
import type { RateType } from '@/llamalend/PageLlamaMarkets/hooks/useSnapshots'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import { RCCrvLogoMD } from '@ui/images'
import { t } from '@ui-kit/lib/i18n'
import { RewardIcon, RewardsImg } from '@ui-kit/shared/ui/RewardIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

const RewardChip = ({ isLast, icon }: { isLast: boolean; icon: ReactElement }) => (
  <Chip icon={icon} size="small" color="highlight" sx={{ ...(!isLast && { marginInline: '-8px' }) }} />
)

export const RewardsIcons = ({
  market: {
    rewards,
    type: marketType,
    rates: { lendCrvAprBoosted },
  },
  rateType,
}: {
  market: LlamaMarket
  rateType: RateType
}) => {
  const filteredRewards = useFilteredRewards(rewards, marketType, rateType)
  const hasCrv = !!lendCrvAprBoosted && rateType === 'lend'
  return (
    (filteredRewards.length > 0 || hasCrv) && (
      <Stack direction="row" alignSelf="end" minWidth={IconSize.md}>
        {hasCrv && <RewardChip isLast={!filteredRewards.length} icon={<RewardsImg src={RCCrvLogoMD} alt={t`CRV`} />} />}
        {uniq(filteredRewards.map((r) => r.platformImageId)).map((img, index, all) => (
          <RewardChip
            isLast={index === all.length - 1}
            key={img}
            icon={<RewardIcon size="sm" key={img} imageId={img} />}
          />
        ))}
      </Stack>
    )
  )
}
