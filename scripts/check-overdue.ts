import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { addDays, isBefore } from "date-fns";

// This file is meant to be run by a separate worker or cron job
// e.g. "node scripts/check-overdue.js"
// For the sake of this plan, we are providing the logic.

async function checkOverdue() {
    const cutoffDate = addDays(new Date(), -1); // Tasks more than 24h overdue

    const tasks = await db.task.findMany({
        where: {
            status: { not: "DONE" },
            dueDate: { lt: new Date() },
            assigneeId: { not: null },
            lastNotificationSentAt: {
                // Either never sent, or sent more than 24h ago
                // Prisma filtering for "more than 24h ago" is tricky directly in one query without raw SQL or post-processing
                // So we'll fetch all overdue and filter in JS for simpler logic in this MVP
            }
        },
        include: { assignee: true }
    });

    for (const task of tasks) {
        if (!task.assignee?.email) continue;

        // Check if we already notified recently
        if (task.lastNotificationSentAt && !isBefore(task.lastNotificationSentAt, cutoffDate)) {
            continue;
        }

        console.log(`Sending overdue notification for task ${task.id} to ${task.assignee.email}`);

        await sendEmail({
            to: task.assignee.email,
            subject: `Overdue Task: ${task.title}`,
            html: `
            <h1>Task Overdue</h1>
            <p>The task "<strong>${task.title}</strong>" was due on ${task.dueDate?.toLocaleDateString()}.</p>
            <p>Please address it as soon as possible.</p>
        `
        });

        await db.task.update({
            where: { id: task.id },
            data: { lastNotificationSentAt: new Date() }
        });
    }
}

// If running standalone
if (require.main === module) {
    checkOverdue()
        .then(() => process.exit(0))
        .catch(e => {
            console.error(e);
            process.exit(1);
        });
}
