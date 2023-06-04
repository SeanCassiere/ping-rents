import { makeExpressServer } from "./server";
import { ENV_VARS } from "./vars";

async function main() {
  const app = await makeExpressServer();

  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, async () => {
      process.exit(0);
    });
  });

  if (ENV_VARS.IS_PRODUCTION) {
    app.listen(Number(ENV_VARS.PORT), ENV_VARS.SERVER_HOST, () => {
      console.log("🚀 Server available at:", `${ENV_VARS.SERVER_HOST}`);
    });
  } else {
    app.listen(Number(ENV_VARS.PORT), () => {
      console.log(
        "🚀 Server available at:",
        `http://localhost:${ENV_VARS.PORT}`,
      );
    });
  }
}

void main().catch((err) => {
  console.error("💥 Server crashed with an error: ", err);
  process.exit(1);
});
