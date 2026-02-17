"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile } from "fs/promises";
import path from "path";

// --- AUTHENTICATION ---
export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const data = Object.fromEntries(formData);
        await signIn("credentials", { ...data, redirectTo: "/admin/matches" });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials.";
                default:
                    return "Something went wrong.";
            }
        }
        throw error;
    }
}

// --- MATCH COMMENTS ---


export async function saveMatchComment(prevState: any, formData: FormData) {
    console.log('\n========== SAVE MATCH COMMENT START ==========');

    const matchId = formData.get("match_id") as string;
    const comment = formData.get("comment") as string;
    const coverImage = formData.get("cover_image") as string;

    console.log(`[saveMatchComment] Match ID: "${matchId}"`);
    console.log(`[saveMatchComment] Comment length: ${comment?.length || 0}`);
    console.log(`[saveMatchComment] Cover Image: "${coverImage || 'N/A'}"`);

    if (!matchId) {
        console.error('❌ [saveMatchComment] Missing Match ID!');
        return { message: "Invalid Match ID" };
    }

    try {
        console.log('[saveMatchComment] Preparing SQL statement...');
        // MySQL upsert equivalent (requires match_id to be PRIMARY KEY)
        // cover_image is optional, convert empty string to null
        const coverImageVal = coverImage && coverImage.trim() !== "" ? coverImage.trim() : null;

        const stmt = db.prepare(`
            INSERT INTO match_comments (match_id, comment, cover_image, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE 
                comment = VALUES(comment), 
                cover_image = VALUES(cover_image),
                updated_at = CURRENT_TIMESTAMP
        `);

        console.log('[saveMatchComment] Executing INSERT/UPDATE...');
        const result = await stmt.run(matchId, comment, coverImageVal);

        console.log('[saveMatchComment] ✅ SUCCESS - Database operation completed');
        console.log('[saveMatchComment] Result:', result);

    } catch (e) {
        console.error("❌ [saveMatchComment] EXCEPTION:", e);
        console.error('[saveMatchComment] Error details:', {
            message: (e as Error).message,
            stack: (e as Error).stack
        });
        return { message: "Database Error: Failed to save comment." };
    }

    console.log('[saveMatchComment] Revalidating paths...');
    revalidatePath("/");
    revalidatePath("/matches");
    revalidatePath("/admin/matches");

    console.log('========== SAVE MATCH COMMENT END ✅ ==========\n');
    return { message: "Comment saved successfully!" };
}

// --- USER MANAGEMENT ---

export async function createUser(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    if (!email || !password) {
        return { message: "Email and Password are required." };
    }

    try {
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').run(email, hashedPassword, name);

        revalidatePath("/admin/users");
        return { message: "User created successfully!" };
    } catch (e) {
        console.error("Failed to create user:", e);
        return { message: "Failed to create user. Email might already exist." };
    }
}


export async function deleteUser(id: number) {
    try {
        // Prevent deleting the last admin or yourself if needed, but for now simple delete
        await db.prepare('DELETE FROM users WHERE id = ?').run(id);
        revalidatePath("/admin/users");
        return { message: "User deleted successfully" };
    } catch (e) {
        console.error("Failed to delete user:", e);
        return { message: "Failed to delete user" };
    }
}
