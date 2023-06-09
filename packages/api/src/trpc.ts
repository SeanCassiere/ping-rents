/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */
import { TRPCError, initTRPC } from "@trpc/server";
import { type CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import superjson from "superjson";
import { ZodError } from "zod";

import { AuthService } from "@acme/auth";
import { prisma } from "@acme/db";
import {
  COOKIE_SESSION_ID_IDENTIFIER,
  HEADER_SESSION_ID_IDENTIFIER,
} from "@acme/validator";

type AuthUser = ReturnType<(typeof AuthService)["verifyJWTToken"]>;
export type AuthMetaUser = NonNullable<AuthUser>;

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API
 *
 * These allow you to access things like the database, the session, etc, when
 * processing a request
 *
 */
type CreateContextOptions = {
  user: AuthUser | null;
  req: CreateFastifyContextOptions["req"];
  res: CreateFastifyContextOptions["res"];
  sessionId: string | null;
};

/**
 * This helper generates the "internals" for a tRPC context. If you need to use
 * it, you can export it from here
 *
 * Examples of things you may need it for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 * @see https://create.t3.gg/en/usage/trpc#-servertrpccontextts
 */
const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    user: opts.user,
    req: opts.req,
    res: opts.res,
    prisma,
    sessionId: opts.sessionId,
  };
};

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint
 * @link https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateFastifyContextOptions) => {
  const { req, res } = opts;

  let decodedUser: AuthUser | null = null;
  let sessionId: string | null = null;
  if (
    (req.headers?.authorization &&
      req.headers?.authorization.toLowerCase().startsWith("bearer ")) ||
    (req.headers?.Authorization &&
      typeof req.headers?.Authorization === "string" &&
      req.headers?.Authorization.toLowerCase().startsWith("bearer "))
  ) {
    const [_, token] =
      req.headers?.authorization?.split(" ") ??
      (typeof req.headers?.Authorization === "string"
        ? req.headers?.Authorization.split(" ")
        : []);

    if (token) {
      try {
        const data = AuthService.verifyJWTToken(token);
        if (data) {
          decodedUser = data;
        }
      } catch (error) {
        console.log(
          "createTRPCContext.req.headers.authorization error: ",
          error,
        );
      }
    }
  }

  // checking for the sessionId in the cookie or the header using X-SESSION-ID
  // const cookies = req.cookies
  // if (
  //   req.cookies &&
  //   (req.cookies?.[COOKIE_SESSION_ID_IDENTIFIER] ||
  //     req.cookies?.[COOKIE_SESSION_ID_IDENTIFIER.toLowerCase()])
  // ) {
  //   sessionId =
  //     req.cookies?.[COOKIE_SESSION_ID_IDENTIFIER] ??
  //     req.cookies?.[COOKIE_SESSION_ID_IDENTIFIER.toLowerCase()];
  // }

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

  return createInnerTRPCContext({
    user: decodedUser,
    req,
    res,
    sessionId,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure;

/**
 * Reusable middleware that enforces users are logged in before running the
 * procedure
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.sessionId) {
    // console.log({ user: ctx.user, sessionId: ctx.sessionId });
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      ...ctx,
      // infers the `user` & `session` as non-nullable
      user: { ...ctx.user },
      sessionId: ctx.sessionId,
    },
  });
});

/**
 * Protected (authed) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use
 * this. It verifies the session is valid and guarantees ctx.session.user is not
 * null
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
