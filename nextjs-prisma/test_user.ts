import {prisma} from "./lib/prisma"
import bcrypt from "bcryptjs"

async function createTestUser() {
  try {
    // First, check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: "test@example.com" },
    })

    if (existing) {
      console.log("✅ User already exists!")
      console.log("Email: test@example.com")
      console.log("Password: TestPassword123")
      console.log("User ID:", existing.id)
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("TestPassword123", 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: "test@example.com",
        name: "Test User",
        password: hashedPassword,
      },
    })

    console.log("\n✅ USER CREATED SUCCESSFULLY!\n")
    console.log("Email: test@example.com")
    console.log("Password: TestPassword123")
    console.log("User ID:", user.id)
    console.log("\n📝 Save this User ID for later!\n")
  } catch (error) {
    console.error("❌ Error creating user:", error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()