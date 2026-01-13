"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import ReactPlayer from "react-player";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { updateWikiPage } from "./actions";

// Custom renderer for ReactMarkdown to handle links as embeds if possible
const renderers = {
    a: (props: any) => {
        const { href, children } = props;
        if (ReactPlayer.canPlay(href)) {
            return (
                <div className="my-4 overflow-hidden rounded-lg border shadow-sm max-w-2xl">
                    <div className="relative pt-[56.25%] bg-black">
                        <ReactPlayer url={href} width="100%" height="100%" className="absolute top-0 left-0" controls />
                    </div>
                </div>
            );
        }
        return <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{children}</a>;
    }
};

interface WikiEditorProps {
    page: { id: string, title: string, content: string };
}

export function WikiEditor({ page }: WikiEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(page.title);
    const [content, setContent] = useState(page.content);

    if (isEditing) {
        return (
            <form action={async (formData) => {
                await updateWikiPage(null, formData);
                setIsEditing(false);
            }} className="space-y-4">
                <input type="hidden" name="pageId" value={page.id} />
                <Input name="title" value={title} onChange={e => setTitle(e.target.value)} className="text-2xl font-bold" />
                <Textarea name="content" value={content} onChange={e => setContent(e.target.value)} className="min-h-[400px] font-mono" placeholder="# Start writing..." />
                <div className="flex gap-2">
                    <Button type="submit">Save Changes</Button>
                    <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
            </form>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{title}</h1>
                <Button onClick={() => setIsEditing(true)} variant="outline">Edit Page</Button>
            </div>

            <div className="prose prose-blue max-w-none">
                <ReactMarkdown components={renderers}>
                    {content || "*No content yet. Click edit to start writing.*"}
                </ReactMarkdown>
            </div>
        </div>
    );
}
