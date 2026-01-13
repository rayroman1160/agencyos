"use server";

import { db } from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { FieldType, EntityType } from "@prisma/client";

const createFieldSchema = z.object({
    name: z.string().min(1),
    key: z.string().min(1).regex(/^[a-z_]+$/, "Key must be lowercase snake_case"),
    type: z.nativeEnum(FieldType),
    entityType: z.nativeEnum(EntityType),
    options: z.string().optional(), // Comma separated for now
});

export async function createCustomField(prevState: any, formData: FormData) {
    const { user } = await validateRequest();
    if (!user || user.role !== "ADMIN") {
        return { error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const key = formData.get("key") as string;
    const type = formData.get("type") as FieldType;
    const entityType = formData.get("entityType") as EntityType;
    const optionsRaw = formData.get("options") as string;

    const result = createFieldSchema.safeParse({ name, key, type, entityType, options: optionsRaw });

    if (!result.success) {
        return { error: "Invalid input" };
    }

    const options = result.data.options ? result.data.options.split(",").map(s => s.trim()) : [];

    try {
        await db.customFieldDefinition.create({
            data: {
                name: result.data.name,
                key: result.data.key,
                type: result.data.type,
                entityType: result.data.entityType,
                options: options
            }
        });
    } catch (e) {
        console.error(e);
        return { error: "Failed to create field (Key might be duplicate)" };
    }

    revalidatePath("/settings");
    return { success: true };
}

export async function deleteCustomField(id: string) {
    const { user } = await validateRequest();
    if (!user || user.role !== "ADMIN") {
        return { error: "Unauthorized" };
    }

    await db.customFieldDefinition.delete({
        where: { id }
    });
    revalidatePath("/settings");
}
