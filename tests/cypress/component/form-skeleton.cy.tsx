import { DepositForm } from '@/llamalend/features/supply/components/DepositForm'
import { MockLoanTestWrapper } from '@cy/support/helpers/llamalend/MockLoanTestWrapper'
import { createDepositScenario } from '@cy/support/helpers/llamalend/supply/supply-test-scenarios.helpers'
import {
  llamaNetworks,
  resetLlamaTestContext,
  setGasInfo,
  setLlamaApi,
} from '@cy/support/helpers/llamalend/test-context.helpers'
import { t } from '@evm-ui/lib/i18n'
import { FormSkeleton } from '@evm-ui/widgets/DetailPageLayout/FormSkeleton'
import { type FormTab, FormTabs } from '@evm-ui/widgets/DetailPageLayout/FormTabs'
import Stack from '@mui/material/Stack'

type DepositTabsParams = Record<string, never>

const depositMenu = [
  {
    value: 'deposit',
    label: t`Deposit`,
    component: (props: DepositTabsParams) => <DepositForm networks={llamaNetworks} {...props} />,
  },
] satisfies FormTab<DepositTabsParams>[]

const HEIGHT_TOLERANCE = 1

const getHeight = (selector: string) =>
  cy
    .get(selector)
    .should('be.visible')
    .then($element => $element[0].getBoundingClientRect().height)

const shouldMatchHeight = (actualSelector: string, skeletonSelector: string) => {
  getHeight(skeletonSelector).then(skeletonHeight =>
    getHeight(actualSelector).should(actualHeight =>
      expect(actualHeight).to.be.closeTo(skeletonHeight, HEIGHT_TOLERANCE),
    ),
  )
}

describe('FormSkeleton', () => {
  beforeEach(resetLlamaTestContext)

  it('matches the layout heights of a one-input deposit form', () => {
    const { llamaApi, market } = createDepositScenario({
      chainId: 1,
      approved: true,
    })

    setLlamaApi(llamaApi)
    setGasInfo({ chainId: 1, networks: llamaNetworks })

    cy.mount(
      <MockLoanTestWrapper llamaApi={llamaApi} market={market}>
        <Stack>
          <Stack data-testid="skeleton-form">
            <FormSkeleton />
          </Stack>
          <Stack data-testid="actual-form">
            <FormTabs params={{}} menu={depositMenu} />
          </Stack>
        </Stack>
      </MockLoanTestWrapper>,
    )

    cy.get('[data-testid="actual-form"] [data-testid="supply-deposit-input"]').should('be.visible')

    shouldMatchHeight(
      '[data-testid="actual-form"] [data-testid="tab-deposit"]',
      '[data-testid="skeleton-form"] [data-testid="tab-tab"]',
    )
    shouldMatchHeight(
      '[data-testid="actual-form"] [data-testid="supply-deposit-input"]',
      '[data-testid="skeleton-form"] .MuiCard-root .MuiSkeleton-rectangular',
    )
    shouldMatchHeight(
      '[data-testid="actual-form"] [data-testid="supply-deposit-submit-button"]',
      '[data-testid="skeleton-form"] .MuiCardContent-root > button.MuiButton-root',
    )
    shouldMatchHeight('[data-testid="actual-form"] .MuiCard-root', '[data-testid="skeleton-form"] .MuiCard-root')
  })
})
