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
        await signIn("credentials", { ...data, redirectTo: "/admin" });
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

    console.log(`[saveMatchComment] Match ID: "${matchId}"`);
    console.log(`[saveMatchComment] Comment: "${comment}"`);
    console.log(`[saveMatchComment] Comment length: ${comment?.length || 0}`);

    if (!matchId) {
        console.error('❌ [saveMatchComment] Missing Match ID!');
        return { message: "Invalid Match ID" };
    }

    try {
        console.log('[saveMatchComment] Preparing SQL statement...');
        // MySQL upsert equivalent (requires match_id to be PRIMARY KEY)
        const stmt = db.prepare(`
            INSERT INTO match_comments (match_id, comment, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE comment = VALUES(comment), updated_at = CURRENT_TIMESTAMP
        `);
        
        console.log('[saveMatchComment] Executing INSERT/UPDATE...');
        const result = await stmt.run(matchId, comment);
        
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
