"use client";

import { useActionState, useState } from "react";
import { createCustomField } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialState = {
    error: "",
    success: false
};

export function AddCustomFieldForm() {
    // We don't necessarily need to close a modal here, but clearing form would be nice.
    // For simplicity, we just use useActionState to handle the submission.
    const [state, action, isPending] = useActionState(createCustomField, initialState);

    return (
        <form action={action} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Entity Type</Label>
                    <Select name="entityType" required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select entity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CLIENT">Client</SelectItem>
                            <SelectItem value="LEAD">Lead/Deal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Field Type</Label>
                    <Select name="type" required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="TEXT">Text</SelectItem>
                            <SelectItem value="CURRENCY">Currency</SelectItem>
                            <SelectItem value="SELECT">Select</SelectItem>
                            <SelectItem value="MULTI_SELECT">Multi Select</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Display Name</Label>
                <Input name="name" placeholder="e.g. Budget Range" required />
            </div>

            <div className="space-y-2">
                <Label>Database Key (snake_case)</Label>
                <Input name="key" placeholder="e.g. budget_range" pattern="^[a-z_]+$" required />
            </div>

            <div className="space-y-2">
                <Label>Options (for Select types, comma separated)</Label>
                <Input name="options" placeholder="Option A, Option B" />
            </div>

            {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
            <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Field"}
            </Button>
        </form>
    );
}
