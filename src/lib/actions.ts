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
        await signIn("credentials", formData);
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

// --- NEWS MANAGEMENT ---

export async function createNews(prevState: any, formData: FormData) {
    const title = formData.get("title") as string;
    const date = formData.get("date") as string;
    const category = formData.get("category") as string;
    const content = formData.get("content") as string;
    const imageFile = formData.get("image") as File;

    let imagePath = "";

    // Handle Image Upload
    if (imageFile && imageFile.size > 0) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const filename = Date.now() + "_" + imageFile.name.replaceAll(" ", "_");
        const uploadDir = path.join(process.cwd(), "public/uploads");

        try {
            await writeFile(path.join(uploadDir, filename), buffer);
            imagePath = `/uploads/${filename}`;
        } catch (e) {
            console.error("Upload failed", e);
            return { message: "Failed to upload image" };
        }
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO news (title, date, content, image)
            VALUES (?, ?, ?, ?)
        `);
        stmt.run(title, date, content, imagePath);
    } catch (e) {
        return { message: "Database Error: Failed to create news." };
    }

    revalidatePath("/news");
    revalidatePath("/admin/news");
    revalidatePath("/");
    redirect("/admin/news");
}

export async function deleteNews(id: number) {
    try {
        const stmt = db.prepare("DELETE FROM news WHERE id = ?");
        stmt.run(id);
        revalidatePath("/news");
        revalidatePath("/admin/news");
        revalidatePath("/");
    } catch (error) {
        console.error("Database Error: Failed to delete news.", error);
        throw new Error("Failed to delete news");
    }
}

export async function updateNews(id: number, prevState: any, formData: FormData) {
    const title = formData.get("title") as string;
    const date = formData.get("date") as string;
    const category = formData.get("category") as string;
    const content = formData.get("content") as string;
    const imageFile = formData.get("image") as File;

    let imagePath = null;

    // Handle Image Upload if new image provided
    if (imageFile && imageFile.size > 0) {
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const filename = Date.now() + "_" + imageFile.name.replaceAll(" ", "_");
        const uploadDir = path.join(process.cwd(), "public/uploads");

        try {
            await writeFile(path.join(uploadDir, filename), buffer);
            imagePath = `/uploads/${filename}`;
        } catch (e) {
            console.error("Upload failed", e);
            return { message: "Failed to upload image" };
        }
    }

    try {
        if (imagePath) {
            const stmt = db.prepare(`
                UPDATE news 
                SET title = ?, date = ?, category = ?, content = ?, image = ?
                WHERE id = ?
            `);
            stmt.run(title, date, category, content, imagePath, id);
        } else {
            const stmt = db.prepare(`
                UPDATE news 
                SET title = ?, date = ?, category = ?, content = ?
                WHERE id = ?
            `);
            stmt.run(title, date, category, content, id);
        }
    } catch (e) {
        return { message: "Database Error: Failed to update news." };
    }

    revalidatePath("/admin/news");
    revalidatePath("/");
    redirect("/admin/news");
}

// --- MATCH COMMENTS ---

export async function saveMatchComment(prevState: any, formData: FormData) {
    const matchId = formData.get("match_id") as string;
    const comment = formData.get("comment") as string;

    if (!matchId) return { message: "Invalid Match ID" };

    try {
        const stmt = db.prepare(`
            INSERT INTO match_comments (match_id, comment)
            VALUES (?, ?)
            ON CONFLICT(match_id) DO UPDATE SET
            comment = excluded.comment,
            updated_at = CURRENT_TIMESTAMP
        `);
        stmt.run(matchId, comment);
    } catch (e) {
        console.error("Failed to save match comment", e);
        return { message: "Database Error: Failed to save comment." };
    }

    revalidatePath("/");
    revalidatePath("/matches");
    revalidatePath("/admin/matches");
    return { message: "Comment saved successfully!" };
}
