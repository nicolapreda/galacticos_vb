import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';

// Default admin creds for simplicity - in production use ENV vars
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || process.env.ADMIN_PASSWORD || "admin123";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;

                    if (email === ADMIN_USER && password === ADMIN_PASS) {
                        return {
                            id: "1",
                            name: "Admin",
                            email: ADMIN_USER,
                        };
                    }
                }
                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
