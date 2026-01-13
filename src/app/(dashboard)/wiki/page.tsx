import { db } from "@/lib/db";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createWikiPage } from "./actions";
import { WikiEditor } from "./WikiEditor";
import { Card } from "@/components/ui/card";
import { CreateWikiPageDialog } from "./CreateWikiPageDialog";
import Link from "next/link";
import { FolderIcon, FileTextIcon } from "lucide-react";

export default async function WikiPage({
    searchParams
}: {
    searchParams?: Promise<{ pageId?: string }>
}) {
    const { user } = await validateRequest();
    if (!user) return redirect("/login");

    const params = await searchParams;
    const currentPageId = params?.pageId;

    // Fetch hierarchy
    const pages = await db.wikiPage.findMany({
        where: { parentId: null }, // Top level for now, would need recursive fetch or flat list + client tree for full nav
        include: { children: true }
    });

    let activePage = null;
    if (currentPageId) {
        activePage = await db.wikiPage.findUnique({ where: { id: currentPageId } });
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6">
            {/* Sidebar Navigation */}
            <Card className="w-64 flex flex-col p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold">Knowledge Base</h2>
                    <CreateWikiPageDialog />
                </div>

                <nav className="flex-1 overflow-y-auto space-y-1">
                    {pages.map(page => (
                        <div key={page.id} className="space-y-1">
                            <Link href={`/wiki?pageId=${page.id}`} className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-gray-100 ${page.id === currentPageId ? 'bg-blue-50 text-blue-700' : ''}`}>
                                <FolderIcon className="w-4 h-4 text-gray-400" />
                                {page.title}
                            </Link>
                            {page.children.length > 0 && (
                                <div className="pl-4 border-l ml-3 space-y-1">
                                    {page.children.map(child => (
                                        <Link key={child.id} href={`/wiki?pageId=${child.id}`} className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-gray-100 ${child.id === currentPageId ? 'bg-blue-50 text-blue-700' : ''}`}>
                                            <FileTextIcon className="w-4 h-4 text-gray-400" />
                                            {child.title}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    {pages.length === 0 && <p className="text-xs text-center text-gray-400 py-4">No pages yet</p>}
                </nav>
            </Card>

            {/* Content Area */}
            <Card className="flex-1 p-8 overflow-y-auto">
                {activePage ? (
                    <WikiEditor page={activePage} />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <FileTextIcon className="w-16 h-16 mb-4 opacity-20" />
                        <p>Select a page to view content</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
