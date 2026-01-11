import {NextRequest , NextResponse} from "next/server"
import { getCurrentUser } from "@/lib/auth/permission"
import { error } from "node:console"

export async function POST(request :NextRequest){
    try{
        const userId = await getCurrentUser()
        const body = await request.json()

        const {docId , cursor , selection , status} = body

        if(!docId) {
            return NextResponse.json(
                {error : "Missing docId"},
                {status : 400}
            )
        }
        console.log(`[Presence] Sync for user ${userId} in doc ${docId}` , {
            cursor , selection , status,
        })

        return NextResponse.json({
            success : true,
            message : "Awareness synced",
            userId,
            timestamp: new Date(),
        })
    }
    catch{
        const message = error instanceof Error ? error.message : "Sync failed!"
        console.log("API Error in POST/presence/sync" , message);

        if(message.includes("Unauthorized")){
            return NextResponse.json({error : "Unauthorized!"} , {status : 401})
        }

        return NextResponse.json({error : message} , {status : 500})
    }
}