import React from "react";
import { Platform, type AppStateStatus } from "react-native";
import Constants from "expo-constants";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";

import { type AppRouter } from "@acme/api";
import { HEADER_SESSION_ID_IDENTIFIER } from "@acme/validator";

import { useAppState } from "../hooks/useAppState";
import { useOnlineManager } from "../hooks/useOnlineManager";

/**
 * A set of typesafe hooks for consuming your API.
 */
export const api = createTRPCReact<AppRouter>();
export { type RouterInputs, type RouterOutputs } from "@acme/api";

/**
 * Extend this function when going to production by
 * setting the baseUrl to your production API URL.
 */
export const getBaseUrl = (): string => {
  /**
   * Gets the IP address of your host-machine. If it cannot automatically find it,
   * you'll have to manually set it. NOTE: Port 3000 should work for most but confirm
   * you don't have anything else running on it, or you'd have to change it.
   *
   * **NOTE**: This is only for development. In production, you'll want to set the
   * baseUrl to your production API URL.
   */

  // const localhost = Constants.manifest?.debuggerHost?.split(":")[0];
  // if (!localhost) {
  //   return "https://api-ping-rents.pingstash.com";
  // }

  // return `http://${localhost}:4000`;

  // const debuggerHost = Constants.manifest?.debuggerHost?.split(":")[0]; // this is only available in mobile dev mode

  // if (debuggerHost) {
  //   return `http://${debuggerHost}:4000`;
  // }

  if (Constants.expoConfig?.extra?.PUBLIC_API_URL) {
    return Constants.expoConfig?.extra?.PUBLIC_API_URL as string;
  }

  return "https://pingrents-api.pingstash.com";
};

export const PingRentsStaticLinks = {
  trpcEndpoint: `${getBaseUrl()}/trpc`,
  termsAndConditions: `${getBaseUrl()}/public/terms-and-conditions?hideHeader=true`,
  privacyPolicy: `${getBaseUrl()}/public/privacy-policy?hideHeader=true`,
  eula: `${getBaseUrl()}/public/eula?hideHeader=true`,
  deleteAccountPolicy: `${getBaseUrl()}/public/delete-account?hideHeader=true`,
} as const;

/**
 * Use this to manage the online-status of your app in tanstack-query.
 */
function onAppStateChange(status: AppStateStatus) {
  // React Query already supports in web browser refetch on window focus by default
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

/**
 * A wrapper for your app that provides the TRPC context.
 * Use only in _app.tsx
 */
export const TRPCProvider: React.FC<{
  children: React.ReactNode;
  sessionId: string | null;
  accessToken: string | null;
}> = ({ children, sessionId, accessToken }) => {
  const [queryClient] = React.useState(() => new QueryClient());
  const [trpcClient] = React.useState(() =>
    api.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: PingRentsStaticLinks.trpcEndpoint,
          headers: () => ({
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            ...(sessionId
              ? { [HEADER_SESSION_ID_IDENTIFIER.toLowerCase()]: `${sessionId}` }
              : {}),
          }),
        }),
      ],
    }),
  );

  useOnlineManager();

  useAppState(onAppStateChange);
  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
};
