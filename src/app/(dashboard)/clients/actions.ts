"use server";

import { db } from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addDays } from "date-fns";

const applyTemplateSchema = z.object({
    clientId: z.string().uuid(),
    templateId: z.string().uuid(),
    startDate: z.string().date(), // IOS 8601 YYYY-MM-DD
});

export async function applyTemplateToClient(prevState: any, formData: FormData) {
    const { user } = await validateRequest();
    if (!user) return { error: "Unauthorized" };

    const clientId = formData.get("clientId") as string;
    const templateId = formData.get("templateId") as string;
    const startDateStr = formData.get("startDate") as string;

    const result = applyTemplateSchema.safeParse({ clientId, templateId, startDate: startDateStr });
    if (!result.success) return { error: "Invalid input" };

    const startDate = new Date(result.data.startDate);

    // Fetch template tasks
    const template = await db.serviceTemplate.findUnique({
        where: { id: result.data.templateId },
        include: { templateTasks: true }
    });

    if (!template) return { error: "Template not found" };

    // Create tasks in transaction
    await db.$transaction(
        template.templateTasks.map(tTask => {
            const dueDate = addDays(startDate, tTask.relativeDueDays);

            return db.task.create({
                data: {
                    title: tTask.title,
                    description: tTask.description,
                    clientId: result.data.clientId,
                    dueDate: dueDate,
                    status: "TODO",
                    // We can attempt to auto-assign if there's logic, but for now we leave assigneeId null
                    // or maybe assign to the creator? Let's leave unassigned.
                }
            });
        })
    );

    revalidatePath(`/clients/${clientId}`);
    return { success: true };
}
