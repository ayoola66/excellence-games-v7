import { EnvFunction } from "../../../types/strapi";

export default ({ env }: { env: EnvFunction }) => ({
  connection: {
    client: "postgres",
    connection: {
      host: env("DATABASE_HOST", "127.0.0.1"),
      port: env("DATABASE_PORT", "5432"),
      database: env("DATABASE_NAME", "targeted"),
      user: env("DATABASE_USERNAME", "postgres"),
      password: env("DATABASE_PASSWORD", ""),
      ssl: env.bool("DATABASE_SSL", false),
    },
    debug: false,
  },
});
