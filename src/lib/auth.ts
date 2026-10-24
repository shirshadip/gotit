
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { credentialsSchema } from "@/lib/auth/validation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  useSecureCookies: process.env.NODE_ENV === "production",

  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) return null;

        try {
          const { email, password } = parsed.data;

          const { data: user, error } = await getSupabaseAdmin()
            .from("profiles")
            .select(
              "id, name, email, password_hash, account_status"
            )
            .eq("email", email)
            .maybeSingle();

          if (error || !user) return null;
          if (user.account_status !== "active") return null;
          if (!user.password_hash || !user.email) return null;

          const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
          );

          if (!passwordMatches) return null;

          return {
            id: String(user.id),
            name: user.name ?? "",
            email: user.email,
          };
        } catch (error) {
          console.error("Authentication service error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
};