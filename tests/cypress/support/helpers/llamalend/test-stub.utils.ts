export type TestStubArg = string | number | boolean | bigint | symbol | null | undefined | object

// define our own interface so we don't get errors from SinonStub
export type TestStub<TArgs extends readonly TestStubArg[], TResult> = ((...args: TArgs) => Promise<TResult>) & {
  calledWithExactly: (...args: TArgs) => boolean
  calledWithMatch: (...args: readonly TestStubArg[]) => boolean
  callCount: number
}

export const createStub = <TResult, TArgs extends readonly TestStubArg[] = readonly TestStubArg[]>(result: TResult) =>
  cy.stub().resolves(result) as TestStub<TArgs, TResult>

export const createSyncStub = <TResult, TArgs extends readonly TestStubArg[] = readonly TestStubArg[]>(
  result: TResult,
) => cy.stub().returns(result) as TestStub<TArgs, TResult>

/** Creates an isApproved stub that returns false until approveStub has been called, then returns true. */
export const createIsApprovedStub = (approveStub: TestStub<readonly [string], unknown>) =>
  // eslint-disable-next-line @typescript-eslint/require-await -- Existing violation before enabling this rule.
  cy.stub().callsFake(async () => approveStub.callCount > 0) as TestStub<readonly [string], boolean>
