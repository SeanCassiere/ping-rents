import { makeFastifyServer } from "./server";
import { ENV_VARS } from "./vars";

async function main() {
  const fastify = await makeFastifyServer();

  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, async () => {
      process.exit(0);
    });
  });

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
