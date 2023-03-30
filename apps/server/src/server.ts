import { createExpressMiddleware as createTrpcExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";

import { appRouter, createTRPCContext } from "@acme/api";

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

  // trpc adapter
  app.use(
    "/trpc",
    createTrpcExpressMiddleware({
      router: appRouter,
      createContext: createTRPCContext,
    }),
  );

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
