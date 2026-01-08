"use server"

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"
import type { SignUpInput, SignInInput } from "@/types/auth"
export async function signUpWithCredentials(input: SignUpInput) {
  try {
    if (!input.email || !input.password) {
      throw new Error("Email and password are required")
    }

    if (input.password.length < 8) {
      throw new Error("Password must be at least 8 characters")
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    })

    if (existingUser) {
      throw new Error("This email is already registered")
    }

    const hashedPassword = await bcrypt.hash(input.password, 12)

    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name || input.email.split("@")[0],
        password: hashedPassword,
      },
    })

    console.log(`[Auth] New user created: ${user.email}`)

    await nextAuthSignIn("credentials", {
      email: input.email,
      password: input.password,
      redirect: false,
    })

    return {
      success: true,
      userId: user.id,
      message: "Account created successfully",
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign up failed"
    console.error(`[Auth Error] Sign up: ${message}`)
    throw new Error(message)
  }
}

export async function signInWithCredentials(input: SignInInput) {
  try {
    if (!input.email || !input.password) {
      throw new Error("Email and password are required")
    }

    const result = await nextAuthSignIn("credentials", {
      email: input.email,
      password: input.password,
      redirect: false,
    })

    if (result?.error) {
      throw new Error(result.error)
    }

    console.log(`[Auth] User signed in: ${input.email}`)

    return {
      success: true,
      message: "Signed in successfully",
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign in failed"
    console.error(`[Auth Error] Sign in: ${message}`)
    throw new Error(message)
  }
}
export async function signInWithOAuth(provider: "google" | "github") {
  try {
    await nextAuthSignIn(provider, { redirectTo: "/dashboard" })
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/auth/error?error=${error.type}`)
    }
    throw error
  }
}

export async function signOut() {
  try {
    await nextAuthSignOut({ redirectTo: "/" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sign out failed"
    console.error(`[Auth Error] Sign out: ${message}`)
    throw new Error(message)
  }
}