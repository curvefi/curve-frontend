const LOAN_EXISTS_SELECTOR = '0xa21adb9e'
const USER_STATE_SELECTOR = '0xec74d0a8'

const toWord = (value: bigint) => value.toString(16).padStart(64, '0')
const encodeUint256 = (...values: bigint[]) => `0x${values.map(toWord).join('')}`

export type MockUserState = {
  collateral: bigint
  borrowed: bigint
  debt: bigint
  n?: bigint
}

export function mockLoanExistsAndUserState({
  hasLoan = true,
  userState = {
    collateral: BigInt('1000000000000000000'), // 1e18
    borrowed: BigInt(0),
    debt: BigInt('100000000000000000000'), // 100e18
    n: BigInt(10),
  },
}: {
  hasLoan?: boolean
  userState?: MockUserState
} = {}) {
  const loanExistsResult = encodeUint256(hasLoan ? BigInt(1) : BigInt(0))
  const userStateResult = encodeUint256(
    userState.collateral,
    userState.borrowed,
    userState.debt,
    userState.n ?? BigInt(0),
  )

  cy.intercept('POST', /eth\.drpc\.org/, (req) => {
    const body = req.body
    if (!body || body.method !== 'eth_call') {
      req.continue()
      return
    }

    const data = body.params?.[0]?.data?.toLowerCase()
    if (!data) {
      req.continue()
      return
    }

    if (data.startsWith(LOAN_EXISTS_SELECTOR)) {
      req.reply({ body: { jsonrpc: '2.0', id: body.id, result: loanExistsResult } })
      return
    }

    if (data.startsWith(USER_STATE_SELECTOR)) {
      req.reply({ body: { jsonrpc: '2.0', id: body.id, result: userStateResult } })
      return
    }

    req.continue()
  })
}
