import { NextRequest , NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"
import { getCurrentUser , getDocumentPermission } from "@/lib/auth/permission";

export async function GET(
    request : NextRequest,
    {params} : {params : Promise<{docId : string}>}
){
    try {
        const userId = await getCurrentUser()
        const {docId} = await params

        const permission = await getDocumentPermission(docId)
        if(permission === "none"){
            return NextResponse.json(
                {error : "Access denied"},
                {status : 403}
            )
        }

        const operations = await prisma.syncQueue.findMany({
            where : {
                docId , 
                userId
            },
            orderBy : { createdAt : "asc"}
        })

        const pendingCount = operations.filter(
            (op) => op.status === "PENDING"
        ).length

        const syncedCount = operations.filter(
            (op) => op.status === "SYNCED"
        ).length

        const failedCount = operations.filter(
            (op) => op.status === "FAILED"
        ).length

        return NextResponse.json(
            {
                docId,
                pendingCount,
                syncedCount,
                failedCount,
                operations
            }
        )
        
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {error : "Failed to get the sync status"},
            {status : 500}
        )
    }

}