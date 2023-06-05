import path from "path";
import fastifyCors from "@fastify/cors";
import { createExpressMiddleware as createTrpcExpressMiddleware } from "@trpc/server/adapters/express";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import fastify from "fastify";
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
  // app.use(
  //   "/trpc",
  //   createTrpcExpressMiddleware({
  //     router: appRouter,
  //     createContext: createTRPCContext,
  //   }),
  // );

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

  // public routes
  app.get("/public/privacy-policy", (_, res) =>
    res.sendFile(path.join(__dirname, "../public/privacy-policy.html"), {
      maxAge: 60 * 60 * 5, // 5 hours
    }),
  );

  app.get("/public/terms-and-conditions", (_, res) =>
    res.sendFile(path.join(__dirname, "../public/terms-and-conditions.html"), {
      maxAge: 60 * 60 * 5, // 5 hours
    }),
  );

  app.get("/public/delete-account", (_, res) =>
    res.sendFile(path.join(__dirname, "../public/delete-account.html"), {
      maxAge: 60 * 60 * 5, // 5 hours
    }),
  );

  app.get("/public/eula", (_, res) =>
    res.sendFile(path.join(__dirname, "../public/eula.html"), {
      maxAge: 60 * 60 * 5, // 5 hours
    }),
  );

  app.get("/public", (_, res) =>
    res.sendFile(path.join(__dirname, "../public/index.html")),
  );

  // hello world
  app.get("/", (_, res) => {
    res.send("Hello World from an Express server");
  });

  return app;
}

export async function makeFastifyServer() {
  const app = fastify({
    logger: true,
  });

  await app.register(fastifyCors);

  await app.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    useWss: false,
    trpcOptions: { router: appRouter, createContext: createTRPCContext },
  } as any);

  app.get("/trpc-panel", (_, reply) => {
    reply
      .code(200)
      .header("content-type", "text/html")
      .send(
        renderTrpcPanel(appRouter, {
          url: ENV_VARS.IS_PRODUCTION
            ? `/trpc`
            : `http://localhost:${ENV_VARS.PORT}/trpc`,
          transformer: "superjson",
        }),
      );
  });

  app.get("/health", (_, reply) => {
    reply.code(200).send({ status: "OK", uptime: process.uptime() ?? 0 });
  });

  app.get("/", async (_, reply) => {
    reply.code(200).send("Hello World from a Fastify server");
  });

  return app;
}
