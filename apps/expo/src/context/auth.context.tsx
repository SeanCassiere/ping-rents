import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "expo-router";

type AuthContextState = {
  isAuthed: boolean;
  accessToken: string | null;
  sessionId: string | null;
};

type AuthState = {
  isLoggedIn: boolean;
  accessToken: string | null;
  sessionId: string | null;
};

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setIsAuthed] = useState<AuthState>({
    isLoggedIn: false,
    accessToken: null,
    sessionId: null,
  });

  const bag: AuthContextState = {
    isAuthed: authState.isLoggedIn,
    accessToken: authState.accessToken,
    sessionId: authState.sessionId,
  };

  return <AuthContext.Provider value={bag}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within a AuthProvider");
  }
  return context;
}
