import { QueryClient } from '@tanstack/react-query';

/**
 * Shared query client for portal/public data.
 * refetchOnWindowFocus off by default — focus storms were burning free-tier Rest.
 * Mutations and realtime should invalidate/patch instead.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 45_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const queryKeys = {
  calendar: (audience: string, isAdmin: boolean) => ['calendar', audience, isAdmin] as const,
  events: (scope: string) => ['events', scope] as const,
  devotionals: ['devotionals'] as const,
  newsletters: ['newsletters'] as const,
  notifications: (userId: string) => ['notifications', userId] as const,
  teamMembers: (scope: string) => ['team_members', scope] as const,
  prayerRequests: (scope: string) => ['prayer_requests', scope] as const,
  emailQuota: ['email_quota'] as const,
};
