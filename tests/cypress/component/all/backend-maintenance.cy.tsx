import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { BACKEND_MAINTENANCES } from '@ui-kit/features/maintenance/backend-maintenances.constants'
import { BackendMaintenanceBanner } from '@ui-kit/features/maintenance/BackendMaintenanceBanner'
import { BackendMaintenanceModal } from '@ui-kit/features/maintenance/BackendMaintenanceModal'
import {
  useBackendMaintenance,
  type BackendMaintenanceConfig,
} from '@ui-kit/features/maintenance/hooks/useBackendMaintenance'
import { TIME_FRAMES } from '@ui-kit/lib/model/time'

/**
 * Builds maintenance fixtures relative to the current time.
 *
 * Instead of hardcoding a maintenance date and changing the clock in each test, we move the maintenance date backward
 * or forward from now depending on the scenario.
 */
const createMaintenance = ({
  offsetMs,
  warnBefore = 'week',
  expectedDurationLabel = '20 minutes to 1 hour',
}: {
  offsetMs: number
  warnBefore?: BackendMaintenanceConfig[number]['warnBefore']
  expectedDurationLabel?: string
}): BackendMaintenanceConfig => [
  {
    dateISO: new Date(Date.now() + offsetMs).toISOString(),
    warnBefore,
    expectedDurationLabel,
  },
]

function BackendMaintenanceTest({ maintenances }: { maintenances: BackendMaintenanceConfig }) {
  const backendMaintenance = useBackendMaintenance({ maintenances })

  return (
    <>
      <BackendMaintenanceModal {...backendMaintenance} />
      {backendMaintenance.showBanner && <BackendMaintenanceBanner {...backendMaintenance} />}
    </>
  )
}

const mountBackendMaintenance = (maintenances: BackendMaintenanceConfig) =>
  cy.mount(
    <ComponentTestWrapper>
      <BackendMaintenanceTest maintenances={maintenances} />
    </ComponentTestWrapper>,
  )

const expectToHaveText = (selector: string) => cy.get(selector).invoke('text').should('match', /\S+/)

describe('backend maintenance constants', () => {
  it('keeps every configured dateISO as a valid UTC ISO string', () => {
    for (const { dateISO } of BACKEND_MAINTENANCES) {
      expect(new Date(dateISO).toISOString()).to.eq(dateISO)
    }
  })
})

describe('BackendMaintenance', () => {
  beforeEach(() => {
    clearMaintenanceStorage()
  })

  it('renders nothing when the maintenance list is empty', () => {
    mountBackendMaintenance([])

    cy.get('[data-testid="backend-maintenance-modal"]').should('not.exist')
    cy.get('[data-testid="backend-maintenance-banner"]').should('not.exist')
  })

  it('renders nothing before the warning window', () => {
    mountBackendMaintenance(createMaintenance({ offsetMs: 8 * TIME_FRAMES.DAY_MS }))

    cy.get('[data-testid="backend-maintenance-modal"]').should('not.exist')
    cy.get('[data-testid="backend-maintenance-banner"]').should('not.exist')
  })

  it('renders the modal during the warning window before dismissal', () => {
    mountBackendMaintenance(createMaintenance({ offsetMs: 3 * TIME_FRAMES.DAY_MS }))

    cy.get('[data-testid="backend-maintenance-modal"]').should('be.visible')
    expectToHaveText('[data-testid="backend-maintenance-modal"]')
    cy.get('[data-testid="backend-maintenance-banner"]').should('not.exist')
  })

  it('renders the banner 24 hours after the modal was dismissed', () => {
    const maintenances = createMaintenance({ offsetMs: 3 * TIME_FRAMES.DAY_MS })
    const [maintenance] = maintenances

    seedDismissedModal({
      dateISO: maintenance.dateISO,
      dismissedAtISO: new Date(Date.now() - TIME_FRAMES.DAY_MS - 1).toISOString(),
    })
    mountBackendMaintenance(maintenances)

    cy.get('[data-testid="backend-maintenance-modal"]').should('not.exist')
    cy.get('[data-testid="backend-maintenance-banner"]').should('be.visible')
    expectToHaveText('[data-testid="backend-maintenance-banner"]')
  })

  it('dismisses the banner when clicked', () => {
    const maintenances = createMaintenance({ offsetMs: 3 * TIME_FRAMES.DAY_MS })
    const [maintenance] = maintenances

    seedDismissedModal({
      dateISO: maintenance.dateISO,
      dismissedAtISO: new Date(Date.now() - TIME_FRAMES.DAY_MS - 1).toISOString(),
    })
    mountBackendMaintenance(maintenances)

    cy.get('[data-testid="backend-maintenance-banner"]').find('button').click()
    cy.get('[data-testid="backend-maintenance-banner"]').should('not.exist')
  })

  it('renders nothing after the maintenance date has passed', () => {
    mountBackendMaintenance(createMaintenance({ offsetMs: -(TIME_FRAMES.DAY_MS / 24) }))

    cy.get('[data-testid="backend-maintenance-modal"]').should('not.exist')
    cy.get('[data-testid="backend-maintenance-banner"]').should('not.exist')
  })
})

const clearMaintenanceStorage = () =>
  cy.window().then(win => {
    win.localStorage.clear()
  })

const seedDismissedModal = ({ dateISO, dismissedAtISO }: { dateISO: string; dismissedAtISO: string }) =>
  cy.window().then(win => {
    win.localStorage.setItem(`backend-maintenance-modal-${dateISO}`, JSON.stringify(dismissedAtISO))
  })
