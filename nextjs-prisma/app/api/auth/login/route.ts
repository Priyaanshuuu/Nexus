// app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"

/**
 * POST /api/auth/login
 * Login endpoint for API/Postman testing (bypasses CSRF)
 * For production, use the NextAuth signIn method in the browser
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      )
    }

    // Use NextAuth's signIn with credentials provider
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    console.log(`[Auth] Login successful: ${email}`)

    return NextResponse.json({
      success: true,
      message: "Logged in successfully",
      user: {
        email,
      },
    })
  } catch (error) {
    // Handle NextAuth errors
    if (error instanceof AuthError) {
      console.error("[Auth Error]:", error.type, error.message)
      
      switch (error.type) {
        case "CredentialsSignin":
          return NextResponse.json(
            { error: "Invalid email or password" },
            { status: 401 }
          )
        default:
          return NextResponse.json(
            { error: "Authentication failed" },
            { status: 500 }
          )
      }
    }

    const message = error instanceof Error ? error.message : "Login failed"
    console.error("[Auth Error]:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}