export const ENV_VARS = {
  PORT: process.env.PORT ?? "4500",
  SERVER_HOST: process.env.SERVER_HOST ?? "http://localhost",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
};
