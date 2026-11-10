import { createContext, type ReactElement, use, useState } from 'react'
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'

const StoryContext = createContext<ReactElement | null>(null)
const StoryRoute = () => use(StoryContext)

/**
 * Provides a stable router for a story across Controls updates. Recreating the router can leave the preview blank.
 * Context forwards the latest story element through TanStack's memoized routes without replacing the router.
 */
export const StoryRouter = ({ children }: { children: ReactElement }) => {
  const [router] = useState(() =>
    createRouter({
      routeTree: createRootRoute({ component: StoryRoute }),
      history: createMemoryHistory({ initialEntries: ['/'] }),
    }),
  )

  return (
    <StoryContext value={children}>
      <RouterProvider router={router} />
    </StoryContext>
  )
}
