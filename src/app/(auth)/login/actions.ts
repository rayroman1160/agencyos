"use server";

import { verifyPassword } from "@/lib/password";
import { db } from "@/lib/db";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export async function login(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
        return {
            error: "Invalid input"
        };
    }

    const user = await db.user.findUnique({
        where: { email: result.data.email }
    });

    if (!user) {
        return {
            error: "Incorrect username or password"
        };
    }

    const validPassword = await verifyPassword(user.passwordHash, result.data.password);

    if (!validPassword) {
        return {
            error: "Incorrect username or password"
        };
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    const cookieStore = await cookies();
    cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    return redirect("/");
}
