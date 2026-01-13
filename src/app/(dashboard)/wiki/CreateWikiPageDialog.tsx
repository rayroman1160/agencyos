"use client";

import { useActionState, useState } from "react";
import { createWikiPage } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const initialState = {
    error: "",
    success: false
};

export function CreateWikiPageDialog() {
    const [open, setOpen] = useState(false);
    const [state, action, isPending] = useActionState(async (prev: any, formData: FormData) => {
        const result = await createWikiPage(prev, formData);
        if (result?.success) {
            setOpen(false);
        }
        return result;
    }, initialState);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" variant="outline">+</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>New Page</DialogTitle></DialogHeader>
                <form action={action} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input name="title" required />
                    </div>
                    {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Creating..." : "Create"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
