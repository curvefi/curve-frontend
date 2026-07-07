import { RefuelFormList } from '@/dex/features/manage-pool/components/RefuelFormList'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { constQ } from '@ui-kit/types/util'

type RefuelFormListProps = Parameters<typeof RefuelFormList>[0]

const baseProps = {
  values: { tokenAAmount: undefined, tokenBAmount: undefined },
  tokenA: constQ(1),
  tokenB: constQ(2),
  poolTvl: constQ(1_000),
} satisfies RefuelFormListProps

const mountRefuelFormList = (props: RefuelFormListProps) => {
  cy.mount(
    <ComponentTestWrapper>
      <RefuelFormList {...props} />
    </ComponentTestWrapper>,
  )
}

const expectActionValue = (testId: string, value: string) => {
  cy.get(`[data-testid="${testId}-value"]`).should('have.attr', 'data-value', value).and('have.text', value)
}

const expectEmptyProjections = () => {
  expectActionValue('refuel-size-action-info', '-')
  expectActionValue('refuel-weekly-action-info', '-')
  expectActionValue('refuel-bi-weekly-action-info', '-')
  expectActionValue('refuel-monthly-action-info', '-')
}

describe('RefuelFormList', () => {
  it('shows empty projections until an amount is entered', () => {
    mountRefuelFormList(baseProps)

    expectEmptyProjections()
  })

  it('calculates the pool share and yearly projections from token amounts', () => {
    mountRefuelFormList({
      ...baseProps,
      values: { tokenAAmount: '2', tokenBAmount: '3' },
    })

    expectActionValue('refuel-size-action-info', '0.80%')
    expectActionValue('refuel-weekly-action-info', '41.60%')
    expectActionValue('refuel-bi-weekly-action-info', '20.80%')
    expectActionValue('refuel-monthly-action-info', '9.60%')
  })

  it('falls back when pricing or TVL data is unavailable', () => {
    mountRefuelFormList({
      ...baseProps,
      values: { tokenAAmount: '10', tokenBAmount: undefined },
      tokenB: constQ(undefined),
    })

    expectEmptyProjections()
  })
})
