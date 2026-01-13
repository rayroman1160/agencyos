import { hash, verify } from "@node-rs/argon2";

const options = {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
};

export async function hashPassword(password: string): Promise<string> {
    return hash(password, options);
}

export async function verifyPassword(hashedPassword: string, password: string): Promise<boolean> {
    return verify(hashedPassword, password, options);
}
