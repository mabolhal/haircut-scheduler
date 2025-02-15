import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const barber = await prisma.barber.findUnique({
          where: { email: credentials.email }
        });

        if (!barber) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          barber.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: barber.id.toString(),
          email: barber.email,
          name: barber.name,
        };
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: { signIn: '/auth/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
}; 