/// <reference types="Cypress" />

import '@synthetixio/synpress/support/index'
import { getByTestId } from './cyHelpers'

Cypress.Commands.add('getByTestId', getByTestId)
