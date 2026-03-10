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
                console.log("NextAuth Authorize attempt for:", credentials?.email);

                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Veuillez fournir un email et un mot de passe.");
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email }
                    });

                    if (!user || !user.password) {
                        console.log("User not found or no password for:", credentials.email);
                        throw new Error("Aucun utilisateur trouvé avec cet email.");
                    }

                    const isValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isValid) {
                        console.log("Invalid password for:", credentials.email);
                        throw new Error("Mot de passe incorrect.");
                    }

                    console.log("User authorized successfully:", credentials.email);
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                    };
                } catch (dbError) {
                    console.error("CRITICAL: Auth DB Error during authorize:", dbError);
                    throw new Error("Erreur système lors de la connexion. Veuillez réessayer.");
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 jours
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
        error: "/login", // Rediriger les erreurs vers la page de login
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).id = token.id;
            }
            return session;
        }
    },
    // Activer le mode debug en production temporairement pour voir les logs Vercel
    debug: true,
};
