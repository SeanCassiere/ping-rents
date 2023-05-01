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
import {
  deleteFromSecureStore,
  getValueFromSecureStore,
  saveToSecureStore,
} from "../utils/secureStore";

type AuthState =
  | {
      accessToken: null;
      sessionId: null;
      mode: "logged-out";
    }
  | { accessToken: string; sessionId: string; mode: "logged-in" }
  | { accessToken: null; sessionId: string; mode: "session-only-hold" };

type AuthContextState = {
  isAuthed: boolean;
  state: AuthState;
  logout: () => Promise<void>;
  login: (info: { accessToken: string; sessionId: string }) => Promise<void>;
  isInitialLoad: boolean;
};

const AuthContext = createContext<AuthContextState | undefined>(undefined);

const KEY_SESSION_ID = "session-id" as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [state, setState] = useState<AuthState>({
    accessToken: null,
    sessionId: null,
    mode: "logged-out",
  });

  const handleLogout = useCallback(async () => {
    await deleteFromSecureStore(KEY_SESSION_ID).then(() => {
      setState((prev) => ({
        ...prev,
        accessToken: null,
        sessionId: null,
        mode: "logged-out",
      }));
    });
  }, []);

  const handleLogin: AuthContextState["login"] = useCallback(async (info) => {
    await saveToSecureStore(KEY_SESSION_ID, info.sessionId);
    setState((prev) => ({
      ...prev,
      mode: "logged-in",
      accessToken: info.accessToken,
      sessionId: info.sessionId,
    }));
  }, []);

  const sessionId = useMemo(() => state.sessionId, [state.sessionId]);
  const authMode = useMemo(() => state.mode, [state.mode]);
  const firstLoad = useMemo(() => isInitialLoad, [isInitialLoad]);

  const contextAccessibleValues: AuthContextState = {
    isAuthed: state.mode === "logged-in",
    state,
    logout: handleLogout,
    login: handleLogin,
    isInitialLoad: firstLoad,
  };

  useEffect(() => {
    if (sessionId && authMode === "session-only-hold") {
      fetch(`${getBaseUrl()}/api/v1/auth/refresh`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(sessionId ? { [HEADER_SESSION_ID_IDENTIFIER]: sessionId } : {}),
        },
      })
        .then((res) => res.json())
        .then(async (res) => {
          const parsed = VerifyRefreshTokenPayloadSchema.parse(res);
          if (!parsed || !parsed.data) {
            throw new Error("Parsing refresh token payload has failed!");
          }

          const nowData = parsed.data;

          await saveToSecureStore(KEY_SESSION_ID, nowData.sessionId).then(
            () => {
              setState((prev) => ({
                ...prev,
                accessToken: nowData.accessToken,
                sessionId: nowData.sessionId,
                mode: "logged-in",
              }));
            },
          );
        })
        .catch((err) => {
          console.log("AuthProvider.Refresh.Error", err);
          deleteFromSecureStore(KEY_SESSION_ID).then(() => {
            setState((prev) => ({
              ...prev,
              accessToken: null,
              sessionId: null,
              mode: "logged-out",
            }));
          });
        })
        .finally(() => {
          setIsInitialLoad(false);
        });
    }
  }, [authMode, sessionId]);

  useEffect(() => {
    (async () => {
      const savedSessionId = await getValueFromSecureStore(KEY_SESSION_ID);
      if (!savedSessionId) {
        setIsInitialLoad(false);
        return;
      }

      setState((prev) => ({
        ...prev,
        accessToken: null,
        sessionId: savedSessionId,
        mode: "session-only-hold",
      }));
      setIsInitialLoad(true);
    })();
  }, []);

  return (
    <AuthContext.Provider value={contextAccessibleValues}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
