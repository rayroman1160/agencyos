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
                <Dialog>
                    <DialogTrigger asChild><Button>New Template</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Create Service Template</DialogTitle></DialogHeader>
                        <form action={createServiceTemplate} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input name="name" placeholder="e.g. SEO Onboarding" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input name="description" placeholder="Standard process for new clients" />
                            </div>
                            <Button type="submit">Create</Button>
                        </form>
                    </DialogContent>
                </Dialog>
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

                            <Dialog>
                                <DialogTrigger asChild><Button variant="outline" size="sm" className="w-full">Add Task</Button></DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Add Task to {template.name}</DialogTitle></DialogHeader>
                                    <form action={addTaskToTemplate} className="space-y-4">
                                        <input type="hidden" name="templateId" value={template.id} />
                                        <div className="space-y-2">
                                            <Label>Task Title</Label>
                                            <Input name="title" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Due Day (Relative to Start)</Label>
                                            <Input name="relativeDueDays" type="number" min="0" defaultValue="0" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Default Role (Optional)</Label>
                                            <Select name="defaultRole">
                                                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                                                <SelectContent>
                                                    {Object.values(Role).map(role => (
                                                        <SelectItem key={role} value={role}>{role}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button type="submit">Add Task</Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
