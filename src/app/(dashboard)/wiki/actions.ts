"use server";

import { db } from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createPageSchema = z.object({
    title: z.string().min(1),
    content: z.string().optional(),
    parentId: z.string().uuid().optional(),
    clientId: z.string().uuid().optional(),
});

const updatePageSchema = z.object({
    pageId: z.string().uuid(),
    title: z.string().min(1),
    content: z.string().optional(),
});

export async function createWikiPage(prevState: any, formData: FormData) {
    const { user } = await validateRequest();
    if (!user) return { error: "Unauthorized" };

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const parentId = formData.get("parentId") as string;
    const clientId = formData.get("clientId") as string;

    const result = createPageSchema.safeParse({
        title,
        content,
        parentId: parentId || undefined,
        clientId: clientId || undefined
    });

    if (!result.success) return { error: "Invalid input" };

    await db.wikiPage.create({
        data: {
            title: result.data.title,
            content: result.data.content || "",
            parentId: result.data.parentId,
            clientId: result.data.clientId
        }
    });

    revalidatePath("/wiki");
    if (result.data.parentId) revalidatePath(`/wiki/${result.data.parentId}`);

    return { success: true };
}

export async function updateWikiPage(prevState: any, formData: FormData) {
    const { user } = await validateRequest();
    if (!user) return { error: "Unauthorized" };

    const pageId = formData.get("pageId") as string;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    const result = updatePageSchema.safeParse({ pageId, title, content });
    if (!result.success) return { error: "Invalid input" };

    await db.wikiPage.update({
        where: { id: result.data.pageId },
        data: {
            title: result.data.title,
            content: result.data.content
        }
    });

    revalidatePath(`/wiki/${result.data.pageId}`);
    return { success: true };
}
