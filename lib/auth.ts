import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Email and Password",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "vous@exemple.com" },
                password: { label: "Mot de passe", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Veuillez fournir un email et un mot de passe.");
                }

                // --- DEMO MODE FALLBACK (Pour tester sur Vercel sans DB) ---
                if (credentials.email === "demo@numtema.ai" && credentials.password === "gitavale2026") {
                    return {
                        id: "demo-user",
                        email: "demo@numtema.ai",
                        name: "Demo User (Foundry)",
                    };
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email }
                    });

                    if (!user || !user.password) {
                        throw new Error("Aucun utilisateur trouvé avec cet email.");
                    }

                    const isValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isValid) {
                        throw new Error("Mot de passe incorrect.");
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                    };
                } catch (dbError) {
                    console.error("Database error, please check connection:", dbError);
                    throw new Error("Erreur de connexion à la base de données. Utilisez le compte démo.");
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).id = token.sub;
            }
            return session;
        }
    }
};
