import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { getServerSession } from "next-auth";

const strapiUrl =
  process.env.NEXT_PUBLIC_STRAPI_API_URL || "http://localhost:1337";

export const authOptions: NextAuthOptions = {
  debug: false, // Disable debug logging
  logger: {
    error: () => {}, // Disable error logging
    warn: () => {}, // Disable warning logging
    debug: () => {}, // Disable debug logging
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        try {
          // Authentication request to Strapi
          const response = await fetch(`${strapiUrl}/api/auth/local`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error?.message || "Invalid credentials");
          }

          if (!data.jwt || !data.user) {
            throw new Error("Invalid response from authentication server");
          }

          // Return the user object
          return {
            id: data.user.id.toString(),
            email: data.user.email,
            name: data.user.username || data.user.email,
            role: "USER",
            status: data.user.status || "Free",
            jwt: data.jwt,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.status = user.status;
        token.jwt = user.jwt;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as "ADMIN" | "USER";
        session.user.status = token.status as "Premium" | "Free";
        session.jwt = token.jwt as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

export async function getSession() {
  return await getServerSession(authOptions);
}
