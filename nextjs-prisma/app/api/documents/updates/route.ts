import { NextRequest , NextResponse } from "next/server";
import { getCurrentUser , getDocumentPermission } from "@/lib/auth/permission";
import { UpdateHandler } from "@/lib/yjs/update_handler";
import type { ApplyUpdateRequest } from "@/types/yjs";

export async function POST(
    request : NextRequest, 
    {params} : {params : Promise<{id : string}>}
){
    try {
        const userId = await getCurrentUser()
        const {id : docId} = await params

        const permission = await getDocumentPermission(docId)
        if(permission !== "editor" && permission !== "owner"){
            return NextResponse.json(
                {error : "You do not have permission to edit this"},
                {status : 403}
            )
        }

        const body = await request.json() as ApplyUpdateRequest

        if(!body.update || !body.clientVersion){
            return NextResponse.json(
                {error : "Missing update or clientVersion"},
                {status : 400}
            )
        }

        const updateBuffer = Buffer.from(body.update , "base64")
        if(!UpdateHandler.validateUpdate(updateBuffer , body.clientVersion)){
            return NextResponse.json(
                {error : "Invalid update"},
                {status : 400}
            )
        }

        const result = await UpdateHandler.applyClientUpdate(
            docId,
            updateBuffer,
            body.clientVersion,
            userId
        )

        if(!result.success){
            return NextResponse.json(
                {error : result.error},
                {status : 500}
            )
        }

        console.log(`API Update applied to ${docId} by ${userId}`);
        
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to apply update"
        console.log( "API Error : POST documents/[id]/updates",message);
        return NextResponse.json({error : message} , {status : 500})
    }

}

export async function GET(
    request : NextRequest,
    {params} : {params : Promise<{id : string}>}
){
   try {
     const userId = await getCurrentUser()
     console.log(userId);
    const {id : docId} = await params
    const permission = await getDocumentPermission(docId)
    if(permission === "none"){
        return NextResponse.json({error : "Access denied"} , {status : 403})
    }
    const stateVectorB64 = request.nextUrl.searchParams.get("stateVector")
    if(!stateVectorB64){
        return NextResponse.json({
            error : "Missing statevector quesry parameter"
        }, 
    {status : 400})
    }

    const stateVector = Buffer.from(stateVectorB64 , "base64")

    const updates = await UpdateHandler.getSyncUpdates(docId , stateVector)
    const updateBase64 = Buffer.from(updates).toString("base64")
    
    return NextResponse.json({
        docId , 
        updates : updateBase64,
        message : "Incremental updates"
    }
    )
    
   } catch (error) {
    const message = error instanceof Error ? error.message : "Failed tp get updates!!"
    console.log("API Error : GET documents/[id]/updates");
    return NextResponse.json({error : message} , {status : 500})
   }
}