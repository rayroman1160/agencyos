"use client";

import { useActionState, useState } from "react";
import { addTaskToTemplate } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// We need to define Role enum manually or import it if compatible with client
// Since importing from @prisma/client in client component might allow leaking backend code (though types are usually fine)
// We'll just hardcode options or pass them as props.
// Let's pass "roles" as strings to avoid enum issues for now or Use simple map.
const ROLES = ["ADMIN", "PARTNER", "VA"];

const initialState = {
    error: "",
    success: false
};

interface AddTaskDialogProps {
    templateId: string;
    templateName: string;
}

export function AddTaskDialog({ templateId, templateName }: AddTaskDialogProps) {
    const [open, setOpen] = useState(false);
    const [state, action, isPending] = useActionState(async (prev: any, formData: FormData) => {
        const result = await addTaskToTemplate(prev, formData);
        if (result?.success) {
            setOpen(false);
        }
        return result;
    }, initialState);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm" className="w-full">Add Task</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Add Task to {templateName}</DialogTitle></DialogHeader>
                <form action={action} className="space-y-4">
                    <input type="hidden" name="templateId" value={templateId} />
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
                                {ROLES.map(role => (
                                    <SelectItem key={role} value={role}>{role}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Adding..." : "Add Task"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
