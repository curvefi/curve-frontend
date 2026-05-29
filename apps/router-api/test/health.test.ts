import { describe, expect, it } from 'vitest'
import { createRouterApiServer } from '../src/server'

describe('health endpoint', () => {
  it('responds with service metadata', async () => {
    const server = createRouterApiServer()

    try {
      const response = await server.inject({ method: 'GET', url: '/health' })
      expect(response.statusCode).toBe(200)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Existing violation before enabling this rule.
      const payload = response.json()
      expect(payload).toMatchObject({
        status: 'ok',
        service: 'router-api',
        environment: 'test',
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Existing violation before enabling this rule.
        version: process.env.npm_package_version || '0.0.1',
      })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
      expect(typeof payload.timestamp).toBe('string')
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
      expect(typeof payload.uptime).toBe('number')
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
      expect(payload.timestamp).not.toHaveLength(0)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Existing violation before enabling this rule.
      expect(payload.uptime).toBeGreaterThanOrEqual(0)
    } finally {
      await server.close()
    }
  })
})
