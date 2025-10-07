import { describe, expect, it } from 'vitest'
import { buildServer } from '../src/server'

describe('health endpoint', () => {
  it('responds with service metadata', async () => {
    const server = buildServer()

    try {
      const response = await server.inject({ method: 'GET', url: '/health' })
      expect(response.statusCode).toBe(200)

      const payload = response.json()
      expect(payload).toMatchObject({
        status: 'ok',
        service: 'router-api',
        environment: 'test',
        version: process.env.npm_package_version || '0.0.1',
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
