import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { users } from "../db/schema.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
}

const jwtSecret: string = JWT_SECRET;

export async function registerUser(
    email: string,
    password: string
) {
    const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (existingUser.length > 0) {
        throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await db.insert(users).values({
        email,
        passwordHash,
    });

    return {
        id: Number(result[0].insertId),
        email,
    };
}

export async function loginUser(
    email: string,
    password: string
) {
    const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    const user = result[0];

    if (!user) {
        throw new Error("Invalid email or password");
    }

    const passwordValid = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!passwordValid) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email,
        },
        jwtSecret,
        {
            expiresIn: "1d",
        }
    );

    return {
        token,
        user: {
            id: user.id,
            email: user.email,
        },
    };
}