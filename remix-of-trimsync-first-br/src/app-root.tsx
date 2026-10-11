import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

/**
 * Providers shared by the browser entry and the prerender entry, so both render
 * the tree under identical context. A QueryClient is created per call rather
 * than as a module singleton — the prerender process renders many routes in one
 * Node process, and they must not share a cache.
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // A weak mobile connection drops requests that succeed on a second try,
        // so give each one a couple of spaced-out attempts before showing an error.
        retry: 2,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
      },
    },
  });

export const AppProviders = ({
  client,
  children,
}: {
  client: QueryClient;
  children: ReactNode;
}) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
