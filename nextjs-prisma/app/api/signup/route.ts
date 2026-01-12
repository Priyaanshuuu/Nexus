import { NextRequest , NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request : NextRequest){
    try {
        const body = await request.json()
        const {email , password , name} = body
        
        if(!email || !password){
            return NextResponse.json(
                {error : "Email and Password are required"},
                {status : 400}
            )
        }

        if(password.length < 8){
            return NextResponse.json(
                {error: "Password must be of 8 characters"},
                {status : 400} 
            )
        }

        const existing = await prisma.user.findUnique({
            where : {email},
        })
        if(existing){
            return NextResponse.json(
                {error : "User already registered!"},
                {status : 409}
            )
        }

        const hashedPassword = await bcrypt.hash(password ,10)

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name:name || email.split("@")[0],
            },
            select: {
                id :true,
                email : true,
                name:true,
            }
        })

        console.log("User Registered!");

        return NextResponse.json(
            {
                success: true,
                message : "User registered successfully",
                user,
            },
            {
                status : 201
            }
        )
        
    } catch (error) {
        const message = error instanceof Error ? error.message : "Registration Error!"
        console.log("Registration API Error" , message);
        return NextResponse.json({error: message} , {status : 500})
        
        
    }
}