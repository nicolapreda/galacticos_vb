import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function saveFile(file: File): Promise<string> {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g, "");

    // Ensure directory exists
    const uploadDir = join(process.cwd(), "public", "assets", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const path = join(uploadDir, filename);
    await writeFile(path, buffer);

    return `/assets/uploads/${filename}`;
}
