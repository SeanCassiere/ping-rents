import express from "express";

import { AuthService } from "@acme/auth";
import {
  COOKIE_SESSION_ID_IDENTIFIER,
  HEADER_SESSION_ID_IDENTIFIER,
} from "@acme/validator/src/auth";

const router = express.Router();

router.get("/refresh", async (req, res) => {
  let sessionId: string | null = null;

  if (
    req.cookies &&
    (req.cookies[COOKIE_SESSION_ID_IDENTIFIER] ||
      req.cookies[COOKIE_SESSION_ID_IDENTIFIER.toLowerCase()])
  ) {
    const cookieSessionId =
      req.cookies[COOKIE_SESSION_ID_IDENTIFIER] ??
      req.cookies[COOKIE_SESSION_ID_IDENTIFIER.toLowerCase()];
    if (typeof cookieSessionId === "string") {
      sessionId = cookieSessionId;
    }
  }
  if (
    req.headers[HEADER_SESSION_ID_IDENTIFIER] ||
    req.headers[HEADER_SESSION_ID_IDENTIFIER.toLowerCase()]
  ) {
    const headerSessionId =
      req.headers[HEADER_SESSION_ID_IDENTIFIER] ??
      req.headers[HEADER_SESSION_ID_IDENTIFIER.toLowerCase()];
    if (headerSessionId instanceof Array) {
      sessionId = headerSessionId[0] ?? null;
    } else if (headerSessionId) {
      sessionId = headerSessionId;
    }
  }

  if (!sessionId) {
    res.json({ success: false, data: null });
    return;
  }

  const result = await AuthService.refreshAccessTokenWithSessionId(sessionId);

  res.cookie(COOKIE_SESSION_ID_IDENTIFIER, result.sessionId, {
    httpOnly: true,
  });

  res.json({ success: true, data: result });
});

export default router;
