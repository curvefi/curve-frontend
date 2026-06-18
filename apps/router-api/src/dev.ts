import { startDevServer } from '@curvefi/api-server'
import { createRouterApiServer } from './server'

void startDevServer({
  createServer: createRouterApiServer,
  defaultPort: 3010,
  readyMessage: 'Router API server ready',
  failureMessage: 'Failed to start Router API server.',
})
