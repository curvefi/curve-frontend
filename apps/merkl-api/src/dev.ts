import { startDevServer } from '@curvefi/api-server'
import { createMerklServer } from './server'

void startDevServer({
  createServer: createMerklServer,
  defaultPort: 3011,
  readyMessage: 'Merkl API server ready',
  failureMessage: 'Failed to start Merkl API server.',
})
