import { NextResponse , NextRequest } from "next/server";
import {prisma} from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request : NextRequest){
    try {
        const body = await request.json()
        const {email , password } = body

        if(!email || !password){
            return NextResponse.json(
                {error : "Email and password are required"},
                {status : 400}
            )
        }

        const user = await prisma.user.findUnique(
            {
                where : {
                    email : email,
                },
                select : {
                    id :true,
                    email : true,
                    name: true,
                    password:true,
                }
            }
        )
        if(!user){
            return NextResponse.json(
                {error : "User Not Found!"},
                {status : 401}
            )
        }

        if(!user.password){
            return NextResponse.json(
                {error: " Please use OAuth!"},
                {status : 400}
            )
        }

        const isPasswordValid = await bcrypt.compare(password , user.password)

        if(!isPasswordValid){
            return NextResponse.json(
                {error : "Incorrect Password"},
                {status : 401}
            )
        }

        console.log("User signedIn!!");

        return NextResponse.json({
            success : true,
            message : "SignedIn successfully",
            user: {
                id : user.id,
                email : user.email,
                name : user.name,
            }
        } , {
            status : 200
        })
        
    } catch (error) {
        const message = error instanceof Error ? error.message : "SignIn Failed"
        console.log("SignIn API error" , message);
        return NextResponse.json({error: message} , {status : 500})
         
        
    }
}