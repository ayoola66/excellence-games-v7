import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    isAdmin: boolean;
  }

  interface Session {
    user: User;
  }
}
