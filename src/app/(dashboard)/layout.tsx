import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth.actions";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = await validateRequest();

    if (!user) {
        return redirect("/login");
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r hidden md:flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        AgencyOS
                    </h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Dashboard</Link>
                    <Link href="/crm" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">CRM</Link>
                    <Link href="/tasks" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Tasks</Link>
                    <Link href="/templates" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Templates</Link>
                    <Link href="/wiki" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Wiki</Link>
                    {user.role === "ADMIN" && (
                        <Link href="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Settings</Link>
                    )}
                </nav>
                <div className="p-4 border-t">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            {user.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" className="rounded-full" /> : <span>{user.name?.charAt(0)}</span>}
                        </div>
                        <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>
                    </div>
                    <form action={logout}>
                        <Button variant="outline" className="w-full">Logout</Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
