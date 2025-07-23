import type { Context } from "koa";

export default async (ctx: Context) => {
  if (!ctx.state.user || !ctx.state.user.roles) {
    return false;
  }

  return ctx.state.user.roles.some((role: any) => role.name === "Admin");
};
