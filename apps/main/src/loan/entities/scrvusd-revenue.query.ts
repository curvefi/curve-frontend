import { getRevenue, type Revenue } from '@curvefi/prices-api/savings'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'
import { weiToEther } from '@ui-kit/utils'

type Epoch = { startDate: Date; endDate: Date; weeklyRevenue: number; data: Revenue[] }

export type ScrvUsdRevenue = { totalDistributed: string; epochs: Epoch[]; history: Revenue[] }

/**
 * Separate the revenue in epochs (to display bars containing up to 7 days each)
 */
const organizeDataIntoEpochs = (history: Revenue[]): Epoch[] => {
  // Sort history by date
  const sortedHistory = history.toSorted((a, b) => a.timestamp - b.timestamp)

  const epochs: Epoch[] = []
  let currentEpoch: Epoch | null = null

  sortedHistory.forEach(item => {
    // If we don't have a current epoch or the item doesn't belong to current epoch
    if (!currentEpoch || new Date(item.timestamp) > new Date(currentEpoch.endDate)) {
      // Find the previous Thursday if item is not on Thursday
      const startDate = new Date(item.timestamp)
      while (startDate.getDay() !== 4) {
        // 4 represents Thursday
        startDate.setDate(startDate.getDate() - 1)
      }

      // Set end date to next Thursday
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 7)

      currentEpoch = { startDate, endDate, weeklyRevenue: 0, data: [] }
      // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
      epochs.push(currentEpoch)
    }

    // eslint-disable-next-line local/no-mutable-array-methods -- Existing violation before creating this rule.
    currentEpoch.data.push(item)
    // Add to weekly revenue (gain - loss)
    currentEpoch.weeklyRevenue += weiToEther(Number(item.gain) - Number(item.loss))
  })

  return epochs
}

const _getScrvUsdRevenue = async (): Promise<ScrvUsdRevenue> => {
  const pages = 1
  const dataPerPage = 300

  const data = await getRevenue(pages, dataPerPage)

  return { ...data, epochs: organizeDataIntoEpochs(data.history) }
}

export const { useQuery: useScrvUsdRevenue } = queryFactory({
  queryKey: () => ['scrvUsdRevenue'] as const,
  queryFn: _getScrvUsdRevenue,
  validationSuite: EmptyValidationSuite,
  category: 'savings.stats',
})
