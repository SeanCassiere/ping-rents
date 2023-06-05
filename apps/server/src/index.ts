import { makeFastifyServer } from "./server";
import { ENV_VARS } from "./vars";

async function main() {
  // const express = await makeExpressServer();

  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, async () => {
      process.exit(0);
    });
  });

  // if (ENV_VARS.IS_PRODUCTION) {
  //   express.listen(Number(ENV_VARS.PORT), ENV_VARS.SERVER_HOST, () => {
  //     console.log("🚀 Server available at:", `${ENV_VARS.SERVER_HOST}`);
  //   });
  // } else {
  //   express.listen(Number(ENV_VARS.PORT), () => {
  //     console.log(
  //       "🚀 Server available at:",
  //       `http://localhost:${ENV_VARS.PORT}`,
  //     );
  //   });
  // }

  const fastify = await makeFastifyServer();

  try {
    await fastify.listen({
      port: Number(ENV_VARS.PORT),
      host: ENV_VARS.IS_PRODUCTION ? "0.0.0.0" : undefined,
    });
    console.log(
      "🚀 Server available at:",
      `${ENV_VARS.SERVER_HOST}:${ENV_VARS.PORT}`,
    );
  } catch (error) {
    throw error;
  }
}

void main().catch((err) => {
  console.error("💥 Server crashed with an error: ", err);
  process.exit(1);
});
