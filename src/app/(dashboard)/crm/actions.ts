"use server";

import { db } from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createDealSchema = z.object({
    title: z.string().min(1),
    value: z.coerce.number().min(0),
    stageId: z.string().uuid(),
    clientId: z.string().optional(),
    // Custom values will be handled separately as record<string, any>
});

export async function createDeal(prevState: any, formData: FormData) {
    const { user } = await validateRequest();
    if (!user) return { error: "Unauthorized" };

    const title = formData.get("title") as string;
    const value = formData.get("value") as string;
    const stageId = formData.get("stageId") as string;
    const clientId = formData.get("clientId") as string; // Optional

    // Parse custom fields
    // We need to fetch definitions to know what to look for, but for simplicity in this Action, 
    // we might want to pass them or just iterate over formData keys that match a pattern? 
    // Better approach: Fetch definitions here.
    const definitions = await db.customFieldDefinition.findMany({
        where: { entityType: "LEAD" }
    });

    const customValues: Record<string, any> = {};
    for (const def of definitions) {
        const val = formData.get(def.key);
        if (val) {
            if (def.type === "CURRENCY") customValues[def.key] = parseFloat(val as string);
            else customValues[def.key] = val;
        }
    }

    const result = createDealSchema.safeParse({ title, value, stageId, clientId: clientId || undefined });

    if (!result.success) {
        return { error: "Invalid input", success: false };
    }

    await db.deal.create({
        data: {
            title: result.data.title,
            value: result.data.value,
            stageId: result.data.stageId,
            clientId: result.data.clientId,
            creatorId: user.id,
            customValues: customValues
        }
    });

    revalidatePath("/crm");
    return { success: true, error: "" };
}

export async function updateDealStage(dealId: string, newStageId: string) {
    const { user } = await validateRequest();
    if (!user) return { error: "Unauthorized" };

    await db.deal.update({
        where: { id: dealId },
        data: { stageId: newStageId }
    });
    revalidatePath("/crm");
}
