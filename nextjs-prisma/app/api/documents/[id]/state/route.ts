import { NextRequest , NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"
import { getCurrentUser , getDocumentPermission } from "@/lib/auth/permission";
import { YjsDocumentManager } from "@/lib/yjs/document_manager";
import * as Y from "yjs"

export async function GET(
    request : NextRequest,
    {params} : {params : Promise<{id : string}>}
){
    try {
        const userId = await getCurrentUser()
        console.log(userId);
        
        const {id: docId} = await params

        const permission = await getDocumentPermission(docId)
        if(permission === "none"){
            return NextResponse.json({error : "Access denied"} , {status : 403})
        }

        const doc = await prisma.document.findUnique({
            where : {id : docId},
            select : {
                id : true,
                title : true,
                content : true,
                yjsState : true,
                version : true,
                lastModifiedAt : true
            }
        })

        if(!doc) {
            return NextResponse.json({error : "Document not found"} , {status : 404})
        }

        let initialState: Buffer | null = null
        if(doc.yjsState){
            initialState = Buffer.from(doc.yjsState)
        }

        const ydoc = YjsDocumentManager.createYjsDoc(initialState)

        const state = Y.encodeStateAsUpdate(ydoc)
        const stateBase64 = Buffer.from(state).toString("base64")

        const stateVector = Y.encodeStateVector(ydoc)
        const stateVectorBase64 = Buffer.from(stateVector).toString("base64")

        return NextResponse.json({
            docId , 
            title : doc.title,
            content : doc.content,
            version : doc.version,
            state : stateBase64,
            stateVector : stateVectorBase64,
            lastModifiedAt : doc.lastModifiedAt,
        })
    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to get state"
        console.log("API Error GET-> documents/[id]/state" , message);
        return NextResponse.json({error : message} , {status : 500})
        
        
    }

}