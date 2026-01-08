import {prisma} from "./lib/prisma"
import bcrypt from "bcryptjs"

async function createFreshUser() {
  try {
    // Generate hashed password
    const hashedPassword = await bcrypt.hash("TestPassword123", 12)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: "newuser@example.com",
        name: "New Test User",
        password: hashedPassword,
      },
    })

    console.log("\n✅ NEW USER CREATED!\n")
    console.log("Email: newuser@example.com")
    console.log("Password: TestPassword123")
    console.log("User ID:", user.id)
    console.log("\nUse these credentials in Postman!\n")
  } catch (error) {
    console.error("❌ Error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

createFreshUser()