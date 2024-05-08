import {getByTestId} from 'cyHelpers';

declare global {
    namespace Cypress {  
      interface Chainable {
        getByTestId: typeof getByTestId
      }
    }
  }