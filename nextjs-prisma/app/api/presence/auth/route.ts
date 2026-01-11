import { NextRequest , NextResponse } from "next/server";
import { generateLiveblockToken } from "@/lib/liveblocks";
import type { LiveblocksAuthToken } from "@/types/presence";

export async function POST(
    request : NextRequest
){
    try {
        const token = await generateLiveblockToken()
        console.log(request);
        

    const expiresAt = Date.now() + 24*60*60*1000

    const response: LiveblocksAuthToken = {
        token,
        expiresAt,
    }

    console.log("LiveBlocks token generated!!");
    return NextResponse.json(response)

    } catch (error) {
        const message = error instanceof Error ? error.message : "Token generaton failed!"
        console.log("API Error : Liveblocks token generation error" , message);

        if(message.includes("Unauthorized")){
            return NextResponse.json(
                {error : "Unauthorized"},
                {status : 401}
            )
        }

        return NextResponse.json({error : message} , {status : 500})
        
    }
    
    
}