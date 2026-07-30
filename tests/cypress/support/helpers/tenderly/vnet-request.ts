import { LOAD_TIMEOUT } from '@cy/support/ui'

const TRANSIENT_CONTROL_PLANE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504])
const MAX_ATTEMPTS = 4
const RETRY_DELAY_MS = 500
const MAX_RETRY_DELAY_MS = 10000

type TenderlyControlPlaneRequest = {
  body?: Cypress.RequestBody
  headers: Record<string, string>
  method: 'DELETE' | 'GET' | 'POST'
  url: string
}

const stringifyResponseBody = (body: unknown) => {
  if (typeof body === 'string') return body
  try {
    return JSON.stringify(body)
  } catch {
    return String(body)
  }
}

const retryDelay = (response: Cypress.Response<unknown>, attempt: number) => {
  const retryAfter = response.headers['retry-after']
  const retryAfterValue = Array.isArray(retryAfter) ? retryAfter[0] : retryAfter

  if (retryAfterValue) {
    const seconds = Number(retryAfterValue)
    const milliseconds = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(retryAfterValue) - Date.now()
    if (milliseconds > 0) return Math.min(milliseconds, MAX_RETRY_DELAY_MS)
  }

  return RETRY_DELAY_MS * 2 ** (attempt - 1)
}

/** Retries only transient Tenderly control-plane responses; transaction submission is deliberately excluded. */
export const requestTenderlyControlPlane = <TResponse>({
  errorMessage,
  isAccepted = response => response.isOkStatusCode,
  request,
}: {
  errorMessage: string
  isAccepted?: (response: Cypress.Response<TResponse>) => boolean
  request: TenderlyControlPlaneRequest
}): Cypress.Chainable<Cypress.Response<TResponse>> => {
  const attemptRequest = (attempt: number): Cypress.Chainable<Cypress.Response<TResponse>> =>
    cy
      .request<TResponse>({
        ...request,
        failOnStatusCode: false,
        retryOnNetworkFailure: true,
        ...LOAD_TIMEOUT,
      })
      .then(response => {
        if (isAccepted(response)) return response

        if (attempt < MAX_ATTEMPTS && TRANSIENT_CONTROL_PLANE_STATUSES.has(response.status)) {
          return cy.wait(retryDelay(response, attempt), { log: false }).then(() => attemptRequest(attempt + 1))
        }

        throw new Error(
          `${errorMessage}: ${response.status} ${response.statusText}; body=${stringifyResponseBody(response.body)}`,
        )
      }) as Cypress.Chainable<Cypress.Response<TResponse>>

  return attemptRequest(1)
}
