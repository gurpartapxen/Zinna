import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/admin/login",
  },

  providers: [
    Credentials({
      name: "Admin credentials",

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
        const parsedCredentials =
          credentialsSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const adminEmail = process.env.ADMIN_EMAIL
          ?.trim()
          .toLowerCase();

        const passwordHash =
          process.env.ADMIN_PASSWORD_HASH?.trim();

        if (!adminEmail || !passwordHash) {
          console.error("Admin authentication variables are missing");
          return null;
        }

        const enteredEmail = parsedCredentials.data.email
          .trim()
          .toLowerCase();

        const emailMatches = enteredEmail === adminEmail;

        let passwordMatches = false;

        try {
          passwordMatches = await bcrypt.compare(
            parsedCredentials.data.password,
            passwordHash,
          );
        } catch {
          console.error("Admin password hash is invalid");
          return null;
        }

        if (!emailMatches || !passwordMatches) {
          return null;
        }

        return {
          id: "zinna-admin",
          name: "Zinna Admin",
          email: adminEmail,
        };
      },
    }),
  ],
});