"use server";

import { hashPassword } from "@/lib/password";
import { db } from "@/lib/db";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1),
});

export async function signup(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    const result = signupSchema.safeParse({ email, password, name });

    if (!result.success) {
        return {
            error: "Invalid input"
        };
    }

    const passwordHash = await hashPassword(result.data.password);

    // Create user
    try {
        const user = await db.user.create({
            data: {
                email: result.data.email,
                passwordHash,
                name: result.data.name,
                role: "ADMIN" // Default to ADMIN for the first user for now
            }
        });

        const session = await lucia.createSession(user.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        const cookieStore = await cookies();
        cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
            return {
                error: "Email already in use"
            };
        }
        return {
            error: "An error occurred"
        };
    }

    return redirect("/");
}
