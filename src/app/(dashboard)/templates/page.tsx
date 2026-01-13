import { db } from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createServiceTemplate, addTaskToTemplate } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Role } from "@prisma/client";
import { CreateTemplateDialog } from "./CreateTemplateDialog";
import { AddTaskDialog } from "./AddTaskDialog";

export default async function TemplatesPage() {
    const { user } = await validateRequest();
    if (!user || user.role !== "ADMIN") return redirect("/");

    const templates = await db.serviceTemplate.findMany({
        include: { templateTasks: { orderBy: { relativeDueDays: 'asc' } } }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Service Templates</h1>
                <CreateTemplateDialog />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <Card key={template.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{template.name}</CardTitle>
                            <p className="text-sm text-gray-500">{template.description}</p>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col space-y-4">
                            <div className="flex-1 space-y-2">
                                {template.templateTasks.map(task => (
                                    <div key={task.id} className="text-sm border p-2 rounded bg-gray-50">
                                        <div className="font-medium flex justify-between">
                                            <span>{task.title}</span>
                                            <span className="text-xs text-gray-500">Day {task.relativeDueDays}</span>
                                        </div>
                                        {task.defaultRole && <div className="text-xs text-blue-600">Assign to: {task.defaultRole}</div>}
                                    </div>
                                ))}
                                {template.templateTasks.length === 0 && <p className="text-sm text-gray-400 italic">No tasks defined</p>}
                            </div>

                            <AddTaskDialog templateId={template.id} templateName={template.name} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
