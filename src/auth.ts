import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';

// User interface matching DB schema
interface User {
    id: number;
    email: string;
    password: string;
    name: string;
}

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

                    // Fetch user from DB
                    // Using `any` cast because our simple db wrapper returns generic types
                    const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;

                    if (!user) return null;

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) {
                        return {
                            id: String(user.id),
                            name: user.name,
                            email: user.email,
                        };
                    }
                }
                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
