import {NextRequest , NextResponse} from "next/server"
import  {prisma} from "@/lib/prisma"
import { getCurrentUser , getDocumentPermission } from "@/lib/auth/permission"
import type { SyncOperation } from "@/types/sync"

export async function POST(request : NextRequest){
    try {
        const userId = await getCurrentUser()
        const body = await request.json() as SyncOperation

        if(!body.docId || !body.operation){
            return NextResponse.json(
                {error : "Missing docId or operation"},
                {status : 400}
            )
        }

        const permission = await getDocumentPermission(body.docId)
        if(permission === "none"){
            return NextResponse.json(
                {error : "Access denied to this document"},
                {status : 403}
            )
        }

        if(permission === "viewer" && body.operation !== "CREATE"){
            return NextResponse.json(
                {error : "Viewers cannot edit documents"},
                {status : 403}
            )
        }

        const syncOp = await prisma.syncQueue.create({
            data:{
                userId,
                docId:body.docId,
                operation : body.operation,
                payload : body.payload,
                status : "PENDING"
            }
        })

       console.log(`[API] Sync operation queued!! ${body.operation} for doc ${body.docId}`)

       return NextResponse.json(
        {
            success : true,
            id : syncOp.id,
            message : "Operation queud for sync",
        },
        {status : 202}
       )
    } catch (error) {
        console.log("API Error" , error);
        return NextResponse.json(
            {error : "API sync Error"},
            {status : 500}
        )
    }
}