"use server";

import { db } from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Role } from "@prisma/client";

const createTemplateSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
});

const createTaskInTemplateSchema = z.object({
    templateId: z.string().uuid(),
    title: z.string().min(1),
    description: z.string().optional(),
    relativeDueDays: z.coerce.number().int().min(0),
    defaultRole: z.nativeEnum(Role).optional(),
});

export async function createServiceTemplate(prevState: any, formData: FormData) {
    const { user } = await validateRequest();
    if (!user || user.role !== "ADMIN") return { error: "Unauthorized" };

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    const result = createTemplateSchema.safeParse({ name, description });

    if (!result.success) return { error: "Invalid input" };

    await db.serviceTemplate.create({
        data: {
            name: result.data.name,
            description: result.data.description
        }
    });

    revalidatePath("/templates");
    return { success: true };
}

export async function addTaskToTemplate(prevState: any, formData: FormData) {
    const { user } = await validateRequest();
    if (!user || user.role !== "ADMIN") return { error: "Unauthorized" };

    const templateId = formData.get("templateId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const relativeDueDays = formData.get("relativeDueDays") as string;
    const defaultRole = formData.get("defaultRole") as string;

    const result = createTaskInTemplateSchema.safeParse({
        templateId,
        title,
        description,
        relativeDueDays,
        defaultRole: defaultRole || undefined
    });

    if (!result.success) return { error: "Invalid input" };

    await db.templateTask.create({
        data: {
            serviceTemplateId: result.data.templateId,
            title: result.data.title,
            description: result.data.description,
            relativeDueDays: result.data.relativeDueDays,
            defaultRole: result.data.defaultRole
        }
    });

    revalidatePath(`/templates/${templateId}`); // Ideally revalidate the specific page
    revalidatePath("/templates");
    return { success: true };
}
