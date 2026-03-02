import { recordEntries } from '@primitives/objects.utils'
import { useAnalyticsApp } from '@ui-kit/hooks/useFeatureFlags'
import { APP_LINK } from '@ui-kit/shared/routes'

/** Some app links are not always visible, depending on certain situations requiring hooks. */
export function useVisibleAppLinks() {
  const showAnalytics = useAnalyticsApp()
  return recordEntries(APP_LINK).filter(([app]) => app !== 'analytics' || showAnalytics)
}
