import { describe, expect, it } from 'vitest'
import { createApiServer } from '../src/index'

describe('health endpoint', () => {
  it('responds with service metadata', async () => {
    const server = createApiServer({
      serviceName: 'test-api',
      env: {
        LOG_LEVEL: 'silent',
        NODE_ENV: 'test',
        npm_package_version: '1.2.3',
      },
    })

    try {
      const response = await server.inject({ method: 'GET', url: '/health' })
      expect(response.statusCode).toBe(200)

      const payload = response.json<{
        status: string
        service: string
        environment: string
        version: string
        timestamp: string
        uptime: number
      }>()
      expect(payload).toMatchObject({
        status: 'ok',
        service: 'test-api',
        environment: 'test',
        version: '1.2.3',
      })
      expect(typeof payload.timestamp).toBe('string')
      expect(typeof payload.uptime).toBe('number')
      expect(payload.timestamp).not.toHaveLength(0)
      expect(payload.uptime).toBeGreaterThanOrEqual(0)
    } finally {
      await server.close()
    }
  })

  it('allows the environment to override the service name', async () => {
    const server = createApiServer({
      serviceName: 'test-api',
      env: {
        LOG_LEVEL: 'silent',
        NODE_ENV: 'test',
        SERVICE_NAME: 'custom-api',
      },
    })

    try {
      const response = await server.inject({ method: 'GET', url: '/health' })
      expect(response.statusCode).toBe(200)
      expect(response.json<{ service: string }>().service).toBe('custom-api')
    } finally {
      await server.close()
    }
  })
})
