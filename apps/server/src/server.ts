import fs from "fs";
import path from "path";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fastify from "fastify";
import { renderTrpcPanel } from "trpc-panel";

import { appRouter, createTRPCContext } from "@acme/api";
import { AuthService } from "@acme/auth";
import {
  COOKIE_SESSION_ID_IDENTIFIER,
  HEADER_SESSION_ID_IDENTIFIER,
} from "@acme/validator";

import { ENV_VARS } from "./vars";

export async function makeFastifyServer() {
  const app = fastify({
    logger: false,
    maxParamLength: 10000,
  });

  // static assets
  await app.register(fastifyStatic, {
    root: path.join(__dirname, "../public/assets"),
    prefix: "/public/assets/",
  });

  await app.register(fastifyCors);

  await app.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    useWss: false,
    trpcOptions: { router: appRouter, createContext: createTRPCContext },
  } as any);

  app.get("/api/v1/auth/refresh", async (req, reply) => {
    let sessionId: string | null = null;

    req.headers["cookie"]?.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      if (
        parts[0] &&
        parts[1] &&
        parts[0].trim() === COOKIE_SESSION_ID_IDENTIFIER
      ) {
        sessionId = parts[1].trim();
      } else if (parts[0] && parts[1] && parts[0].trim() === "cookie") {
        parts[1].split(";").forEach((cookie) => {
          const parts = cookie.split("=");
          if (
            parts[0] &&
            parts[1] &&
            parts[0].trim() === COOKIE_SESSION_ID_IDENTIFIER
          ) {
            sessionId = parts[1].trim();
          }
        });
      }
    });

    if (
      req.headers?.[HEADER_SESSION_ID_IDENTIFIER] ||
      req.headers?.[HEADER_SESSION_ID_IDENTIFIER.toLowerCase()]
    ) {
      const value =
        req.headers?.[HEADER_SESSION_ID_IDENTIFIER] ??
        req.headers?.[HEADER_SESSION_ID_IDENTIFIER.toLowerCase()];
      if (typeof value === "string") {
        sessionId = value;
      }
    }

    if (!sessionId) {
      reply
        .code(200)
        .header("content-type", "application/json")
        .send({ success: false, data: null });
      return;
    }

    try {
      const result = await AuthService.refreshAccessTokenWithSessionId(
        sessionId,
      );

      reply
        .code(200)
        .header(
          "set-cookie",
          `${COOKIE_SESSION_ID_IDENTIFIER}=${result.sessionId}; HttpOnly; Path=/; SameSite=Strict; Max-Age=31536000;`,
        )
        .header("content-type", "application/json")
        .send({ success: true, data: result });
    } catch (error) {
      reply
        .code(200)
        .header("content-type", "application/json")
        .send({ success: false, data: null });
    }
  });

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

  // public routes
  app.get("/public/privacy-policy", (_, reply) => {
    const stream = fs.createReadStream(
      path.join(__dirname, "../public/privacy-policy.html"),
    );
    reply.type("text/html").send(stream);
  });

  app.get("/public/terms-and-conditions", (_, reply) => {
    const stream = fs.createReadStream(
      path.join(__dirname, "../public/terms-and-conditions.html"),
    );
    reply.type("text/html").send(stream);
  });

  app.get("/public/delete-account", (_, reply) => {
    const stream = fs.createReadStream(
      path.join(__dirname, "../public/delete-account.html"),
    );
    reply.type("text/html").send(stream);
  });

  app.get("/public/eula", (_, reply) => {
    const stream = fs.createReadStream(
      path.join(__dirname, "../public/eula.html"),
    );
    reply.type("text/html").send(stream);
  });

  app.get("/public", (_, reply) => {
    const stream = fs.createReadStream(
      path.join(__dirname, "../public/index.html"),
    );
    reply.type("text/html").send(stream);
  });

  // health check
  app.get("/health", (_, reply) => {
    reply.code(200).send({ status: "OK", uptime: process.uptime() ?? 0 });
  });

  // hello world
  app.get("/", async (_, reply) => {
    reply.code(200).send("Hello World from a Fastify server");
  });

  return app;
}
