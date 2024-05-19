import NextAuth, { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import authConfig from "./auth.config";
import { getUserById } from "@/data/user";
import { getTwoFactorConfirmationByUserId as getTwoFactorConfirmation } from "@/data/two-factor-confirmation";
import { getAccountByUserId as getAccountByUser } from "@/data/account";
import { NextApiRequest, NextApiResponse } from "next";

// Helper function to check two-factor confirmation
const getTwoFactorConfirmationByUserId = async (userId: string): Promise<boolean> => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { twoFactorConfirmation: true } 
  });
  return !!user?.twoFactorConfirmation;
};

// Helper function to get account by user ID
const getAccountByUserId = async (userId: string): Promise<{ id: string; name: string } | null> => {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true }
  });
  if (!user) {
    return null;
  }
  return { id: user.id, name: user.name as string };
};

const authOptions: AuthOptions = {
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
        }
      });
    }
  },
  callbacks: {
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider !== "credentials") {
        return true;
      }

      const existingUser = await getUserById(user.id);

      // Prevent sign in without email verification
      if (!existingUser?.emailVerified) {
        return false;
      }

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(user.id);

        if (!twoFactorConfirmation) {
          return false;
        }

        // Delete two-factor confirmation for next sign in
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id }
        });
      }

      return true;
    },

    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }

      if (session.user) {
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
        session.user.isOAuth = token.isOAuth as boolean;
      }

      return session;
    },

    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);

      // Custom token fields
      token.isOAuth = !!existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.image = existingUser.image;
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;

      return token;
    }
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" }, 
  ...authConfig,
};

// Assign the function to a variable before exporting as module default
const authHandler = (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, authOptions);
export default authHandler;
