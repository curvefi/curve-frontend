import { RefuelFormList } from '@/dex/features/manage-pool/components/RefuelFormList'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
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

describe('RefuelFormList', () => {
  it('shows empty projections until an amount is entered', () => {
    mountRefuelFormList(baseProps)

    getActionValue('refuel-size-action-info').should('equal', '-')
    getActionValue('refuel-weekly-action-info').should('equal', '-')
    getActionValue('refuel-bi-weekly-action-info').should('equal', '-')
    getActionValue('refuel-monthly-action-info').should('equal', '-')
  })

  it('calculates the pool share and yearly projections from token amounts', () => {
    mountRefuelFormList({
      ...baseProps,
      values: { tokenAAmount: '2', tokenBAmount: '3' },
    })

    getActionValue('refuel-size-action-info').should('equal', '0.80%')
    getActionValue('refuel-weekly-action-info').should('equal', '41.60%')
    getActionValue('refuel-bi-weekly-action-info').should('equal', '20.80%')
    getActionValue('refuel-monthly-action-info').should('equal', '9.60%')
  })

  it('falls back when pricing or TVL data is unavailable', () => {
    mountRefuelFormList({
      ...baseProps,
      values: { tokenAAmount: '10', tokenBAmount: undefined },
      tokenB: constQ(undefined),
    })

    getActionValue('refuel-size-action-info').should('be.undefined')
    getActionValue('refuel-weekly-action-info').should('be.undefined')
    getActionValue('refuel-bi-weekly-action-info').should('be.undefined')
    getActionValue('refuel-monthly-action-info').should('be.undefined')
  })
})
