import { createExpressMiddleware as createTrpcExpressMiddleware } from "@trpc/server/adapters/express";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { renderTrpcPanel } from "trpc-panel";

import { appRouter, createTRPCContext } from "@acme/api";

import v1Router from "./routes/v1";
import { ENV_VARS } from "./vars";

export async function makeExpressServer() {
  const app = express();

  // middleware
  app.use(
    cors({
      origin: (origin, cb) => {
        if (origin) {
          cb(null, origin);
        } else {
          cb(null, true);
        }
      },
    }),
  );
  app.use(cookieParser());

  // trpc adapter
  app.use(
    "/trpc",
    createTrpcExpressMiddleware({
      router: appRouter,
      createContext: createTRPCContext,
    }),
  );

  app.use("/trpc-panel", (_, res) => {
    res.send(
      renderTrpcPanel(appRouter, {
        url: ENV_VARS.IS_PRODUCTION
          ? `${ENV_VARS.SERVER_HOST}/trpc`
          : `http://localhost:${ENV_VARS.PORT}/trpc`,
        transformer: "superjson",
      }),
    );
  });

  app.use("/api/v1", v1Router);

  // health check
  app.get("/health", (_, res) => {
    res.json({ status: "OK", uptime: process.uptime() ?? 0 });
  });

  // hello world
  app.get("/", (_, res) => {
    res.send("Hello World from server");
  });

  return app;
}
