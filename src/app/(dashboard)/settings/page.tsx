import { db } from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createCustomField, deleteCustomField } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
    const { user } = await validateRequest();
    if (!user || user.role !== "ADMIN") return redirect("/");

    const fields = await db.customFieldDefinition.findMany({
        orderBy: { entityType: 'asc' }
    });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Add Custom Field</CardTitle>
                        <CardDescription>Define new fields for Clients and Deals</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={createCustomField} className="space-y-4">
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

                            <Button type="submit">Create Field</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Existing Fields</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field) => (
                                    <TableRow key={field.id}>
                                        <TableCell><Badge variant="outline">{field.entityType}</Badge></TableCell>
                                        <TableCell>
                                            <div className="font-medium">{field.name}</div>
                                            <div className="text-xs text-gray-500">{field.key}</div>
                                        </TableCell>
                                        <TableCell className="text-xs">{field.type}</TableCell>
                                        <TableCell>
                                            <form action={deleteCustomField.bind(null, field.id)}>
                                                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">Delete</Button>
                                            </form>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {fields.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-gray-500">No custom fields defined</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
