import { redirect as routerRedirect } from '@tanstack/router-core'

export const redirectTo = <T extends string>(to: T) => routerRedirect({ to, throw: true, replace: true })