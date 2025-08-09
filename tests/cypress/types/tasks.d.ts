/// <reference types="cypress" />

import type {
  CreateVirtualTestnetOptions,
  CreateVirtualTestnetResponse,
  DeleteVirtualTestnetsOptions,
} from 'support/helpers/tenderly'

/** Doesn't work properly, because arg is still inferred as `any`. Not sure if this is solvable, leaving it here for now */
declare global {
  namespace Cypress {
    interface Chainable {
      task(event: 'createVirtualTestnet', arg: CreateVirtualTestnetOptions): Chainable<CreateVirtualTestnetResponse>
      task(event: 'deleteVirtualTestnets', arg: DeleteVirtualTestnetsOptions): Chainable<any>
    }
  }
}
