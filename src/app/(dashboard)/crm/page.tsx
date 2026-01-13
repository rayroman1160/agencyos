import { db } from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createDeal } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default async function CRMPage() {
    const { user } = await validateRequest();
    if (!user) return redirect("/login");

    const stages = await db.pipelineStage.findMany({
        orderBy: { order: 'asc' },
        include: { deals: true }
    });

    const customFields = await db.customFieldDefinition.findMany({
        where: { entityType: "LEAD" }
    });

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">CRM Pipeline</h1>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>New Deal</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Deal</DialogTitle>
                            <DialogDescription>Add a new lead to your pipeline.</DialogDescription>
                        </DialogHeader>
                        <form action={createDeal} className="space-y-4">
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

                            <Button type="submit" className="w-full">Create Deal</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex-1 overflow-x-auto">
                <div className="flex h-full gap-4 min-w-max pb-4">
                    {stages.map(stage => (
                        <div key={stage.id} className="w-80 flex-shrink-0 flex flex-col bg-gray-100 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-semibold text-gray-700">{stage.name}</h3>
                                <span className="text-xs bg-white px-2 py-1 rounded-full text-gray-500">{stage.deals.length}</span>
                            </div>

                            <div className="flex-1 space-y-3 overflow-y-auto">
                                {stage.deals.map(deal => (
                                    <Card key={deal.id} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                        <CardContent className="p-4">
                                            <h4 className="font-medium text-sm mb-1">{deal.title}</h4>
                                            <div className="flex justify-between items-end">
                                                <span className="text-xs text-gray-500">Value: ${deal.value}</span>
                                                {/* Render first relevant custom value if avail? Just checking obj structure */}
                                                {/* <span className="text-xs text-blue-500">{(deal.customValues as any)?.priority}</span> */}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                    {stages.length === 0 && (
                        <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg">
                            <p className="text-gray-500">No Pipeline Stages found. Please seed the database.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
