import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  HEADER_SESSION_ID_IDENTIFIER,
  VerifyRefreshTokenPayloadSchema,
} from "@acme/validator/src/auth";

import { getBaseUrl } from "../utils/api";

type AuthContextState = {
  isAuthed: boolean;
  accessToken: string | null;
  sessionId: string | null;
  logout: () => void;
  setLoginInfo: (info: { accessToken: string; sessionId: string }) => void;
};

type AuthState = {
  isLoggedIn: boolean;
  accessToken: string | null;
  sessionId: string | null;
};

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    accessToken: null,
    sessionId: null,
  });

  const handleLogout = useCallback(() => {
    setAuthState((prev) => ({
      ...prev,
      isLoggedIn: false,
      accessToken: null,
      sessionId: null,
    }));
  }, []);

  const handleLogin: AuthContextState["setLoginInfo"] = useCallback((info) => {
    setAuthState((prev) => ({
      ...prev,
      isLoggedIn: true,
      accessToken: info.accessToken,
      sessionId: info.sessionId,
    }));
  }, []);

  const bag: AuthContextState = {
    isAuthed: authState.isLoggedIn,
    accessToken: authState.accessToken,
    sessionId: authState.sessionId,
    logout: handleLogout,
    setLoginInfo: handleLogin,
  };

  const sessionId = useMemo(() => authState.sessionId, [authState.sessionId]);

  // useEffect(() => {
  //   if (sessionId) {
  //     fetch(`${getBaseUrl()}/api/v1/auth/refresh`, {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         ...(sessionId ? { [HEADER_SESSION_ID_IDENTIFIER]: sessionId } : {}),
  //       },
  //     })
  //       .then((res) => res.json())
  //       .then((res) => {
  //         const parsed = VerifyRefreshTokenPayloadSchema.parse(res);
  //         if (parsed && parsed.data) {
  //           const nowData = parsed.data;
  //           setAuthState((prev) => ({
  //             ...prev,
  //             isLoggedIn: true,
  //             accessToken: nowData.accessToken,
  //             sessionId: nowData.sessionId,
  //           }));
  //         }
  //       })
  //       .catch((err) => {
  //         console.log("AuthProvider.Refresh.Error", err);
  //       });
  //   }
  // }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    setAuthState((prev) => ({
      ...prev,
      sessionId: null,
    }));
  }, [sessionId]);

  return <AuthContext.Provider value={bag}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within a AuthProvider");
  }
  return context;
}
