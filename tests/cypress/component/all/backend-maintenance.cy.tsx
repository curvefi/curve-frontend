import { BACKEND_MAINTENANCE } from '@/maintenances'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { BackendMaintenanceBanner } from '@ui-kit/features/maintenance/components/BackendMaintenanceBanner'
import { BackendMaintenanceModal } from '@ui-kit/features/maintenance/components/BackendMaintenanceModal'
import { useMaintenance, type MaintenanceConfig } from '@ui-kit/features/maintenance/hooks/useMaintenance'
import { TIME_FRAMES, TIME_OPTION_MS } from '@ui-kit/lib/model/time'

const MODAL_TEST_ID = 'backend-maintenance-modal'
const BANNER_TEST_ID = 'backend-maintenance-banner'

/**
 * Builds maintenance fixtures relative to the current time.
 *
 * Instead of hardcoding a maintenance date and changing the clock in each test, we move the maintenance date backward
 * or forward from now depending on the scenario.
 */
const createMaintenance = ({ offsetMs }: { offsetMs: number }) => ({
  dateISO: new Date(Date.now() + offsetMs).toISOString(),
  warnBeforeMs: TIME_OPTION_MS['7d'],
  durationMs: TIME_OPTION_MS['1h'],
  expectedDurationLabel: '20 minutes to 1 hour',
})

function BackendMaintenanceTest({ maintenance }: { maintenance: MaintenanceConfig }) {
  const backendMaintenance = useMaintenance(maintenance)

  return (
    <>
      <BackendMaintenanceModal {...backendMaintenance} />
      {backendMaintenance.showBanner && <BackendMaintenanceBanner {...backendMaintenance} />}
    </>
  )
}

const mountBackendMaintenance = (maintenance: MaintenanceConfig) =>
  cy.mount(
    <ComponentTestWrapper>
      <BackendMaintenanceTest maintenance={maintenance} />
    </ComponentTestWrapper>,
  )

describe('backend maintenance constant', () => {
  it('keeps the configured dateISO as a valid UTC ISO string', () => {
    if (!BACKEND_MAINTENANCE) return

    expect(new Date(BACKEND_MAINTENANCE.dateISO).toISOString()).to.eq(BACKEND_MAINTENANCE.dateISO)
  })
})

describe('BackendMaintenance', () => {
  beforeEach(() => {
    clearMaintenanceStorage()
  })

  it('renders nothing when no maintenance is configured', () => {
    mountBackendMaintenance(null)

    cy.get(`[data-testid="${MODAL_TEST_ID}"]`).should('not.exist')
    cy.get(`[data-testid="${BANNER_TEST_ID}"]`).should('not.exist')
  })

  it('renders nothing before the warning window', () => {
    mountBackendMaintenance(createMaintenance({ offsetMs: 8 * TIME_FRAMES.DAY_MS }))

    cy.get(`[data-testid="${MODAL_TEST_ID}"]`).should('not.exist')
    cy.get(`[data-testid="${BANNER_TEST_ID}"]`).should('not.exist')
  })

  it('renders the modal during the warning window before dismissal', () => {
    mountBackendMaintenance(createMaintenance({ offsetMs: 3 * TIME_FRAMES.DAY_MS }))

    cy.get(`[data-testid="${BANNER_TEST_ID}"]`).should('not.exist')
    cy.get(`[data-testid="${MODAL_TEST_ID}"]`).should('be.visible')
    cy.get(`[data-testid="${MODAL_TEST_ID}-dismiss"]`).click()
    cy.get(`[data-testid="${MODAL_TEST_ID}"]`).should('not.exist')
  })

  it('renders the banner 24 hours after the modal was dismissed', () => {
    const maintenance = createMaintenance({ offsetMs: 3 * TIME_FRAMES.DAY_MS })

    seedDismissedModal({
      dateISO: maintenance.dateISO,
      dismissedAtISO: new Date(Date.now() - TIME_FRAMES.DAY_MS - 1).toISOString(),
    })
    mountBackendMaintenance(maintenance)

    cy.get(`[data-testid="${MODAL_TEST_ID}"]`).should('not.exist')
    cy.get(`[data-testid="${BANNER_TEST_ID}"]`).should('be.visible')
  })

  it('dismisses the banner when clicked', () => {
    const maintenance = createMaintenance({ offsetMs: 3 * TIME_FRAMES.DAY_MS })

    seedDismissedModal({
      dateISO: maintenance.dateISO,
      dismissedAtISO: new Date(Date.now() - TIME_FRAMES.DAY_MS - 1).toISOString(),
    })
    mountBackendMaintenance(maintenance)

    cy.get(`[data-testid="${BANNER_TEST_ID}"]`).find('button').click()
    cy.get(`[data-testid="${BANNER_TEST_ID}"]`).should('not.exist')
  })

  it('renders nothing after the maintenance date has passed', () => {
    mountBackendMaintenance(createMaintenance({ offsetMs: -(TIME_FRAMES.DAY_MS / 24) }))

    cy.get(`[data-testid="${MODAL_TEST_ID}"]`).should('not.exist')
    cy.get(`[data-testid="${BANNER_TEST_ID}"]`).should('not.exist')
  })
})

const clearMaintenanceStorage = () =>
  cy.window().then(win => {
    win.localStorage.clear()
  })

const seedDismissedModal = ({ dateISO, dismissedAtISO }: { dateISO: string; dismissedAtISO: string }) =>
  cy.window().then(win => {
    win.localStorage.setItem(`maintenance-modal-${dateISO}`, JSON.stringify(dismissedAtISO))
  })
