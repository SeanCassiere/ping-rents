import { registerRootComponent } from "expo";

import App from "./src/app/App";

// Must be exported or Fast Refresh won't update the context
export function AppWrapped() {
  return <App />;
}

registerRootComponent(AppWrapped);
