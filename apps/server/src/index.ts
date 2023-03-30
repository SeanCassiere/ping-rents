import { makeExpressServer } from "./server";

async function main() {
  const app = await makeExpressServer();

  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, async () => {
      process.exit(0);
    });
  });

  app.listen(4000, () => {
    console.log("Server started on http://localhost:4000");
  });
}

void main().catch((err) => {
  console.error("Server crashed with error: ", err);
});
