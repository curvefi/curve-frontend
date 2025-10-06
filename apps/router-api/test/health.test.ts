import { describe, expect, it } from 'vitest'
import { buildServer } from '../src/server'

const baseConfig = {
  serviceName: 'router-api',
  environment: 'test',
  version: '0.1.0-test',
}

describe('health endpoint', () => {
  it('responds with service metadata', async () => {
    const server = buildServer(baseConfig)

    try {
      const response = await server.inject({ method: 'GET', url: '/health' })
      expect(response.statusCode).toBe(200)

      const payload = response.json()
      expect(payload).toMatchObject({
        status: 'ok',
        service: baseConfig.serviceName,
        environment: baseConfig.environment,
        version: baseConfig.version,
      })
      expect(typeof payload.timestamp).toBe('string')
      expect(typeof payload.uptime).toBe('number')
      expect(payload.timestamp).not.toHaveLength(0)
      expect(payload.uptime).toBeGreaterThanOrEqual(0)
    } finally {
      await server.close()
    }
  })
})
