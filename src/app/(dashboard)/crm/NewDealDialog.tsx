"use client";

import { useActionState, useState } from "react";
import { createDeal } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

// Define prop types based on what we're passing from the server page
interface NewDealDialogProps {
    stages: { id: string; name: string }[];
    customFields: { id: string; name: string; key: string; type: string; options: string[] }[];
}

const initialState = {
    error: "",
    success: false
};

export function NewDealDialog({ stages, customFields }: NewDealDialogProps) {
    const [open, setOpen] = useState(false);
    const [state, action, isPending] = useActionState(async (prev: any, formData: FormData) => {
        const result = await createDeal(prev, formData);
        if (result?.success) {
            setOpen(false);
        }
        return result;
    }, initialState);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>New Deal</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Deal</DialogTitle>
                    <DialogDescription>Add a new lead to your pipeline.</DialogDescription>
                </DialogHeader>
                <form action={action} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Deal Title</Label>
                        <Input name="title" required placeholder="Project Alpha" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Value</Label>
                            <Input name="value" type="number" defaultValue="0" min="0" />
                        </div>
                        <div className="space-y-2">
                            <Label>Stage</Label>
                            <Select name="stageId" required defaultValue={stages[0]?.id}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {stages.map(stage => (
                                        <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Custom Fields */}
                    {customFields.length > 0 && (
                        <div className="border-t pt-4 mt-4 space-y-4">
                            <p className="text-sm font-medium text-gray-500">Custom Fields</p>
                            {customFields.map(field => (
                                <div key={field.id} className="space-y-2">
                                    <Label>{field.name}</Label>
                                    {field.type === 'SELECT' ? (
                                        <Select name={field.key}>
                                            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                                            <SelectContent>
                                                {field.options.map(opt => (
                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input name={field.key} type={field.type === 'CURRENCY' ? 'number' : 'text'} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Creating..." : "Create Deal"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
