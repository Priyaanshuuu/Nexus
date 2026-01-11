import { NextRequest , NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"
import { getCurrentUser , getDocumentPermission } from "@/lib/auth/permission";
import { updatePresence } from "@/lib/liveblocks";
import type { PresenceUpdate } from "@/types/presence";
import { error } from "node:console";

export async function POST(
    request : NextRequest,
    {params} : {params : {docId : string}}
){
    try {
        const userId = getCurrentUser()
        const docId = params.docId

        const permission = await getDocumentPermission(docId)
        if(permission === "none"){
            return NextResponse.json(
                {error : "Access denied"},
                {status : 403}
            )
        }

        const body = await request.json() as PresenceUpdate
        await updatePresence(docId , userId , body)

        const devicesync = await prisma.deviceSync.findUnique({
            where : {
                userId : userId,
            },
        })
        if(devicesync){
            await prisma.deviceSync.update({
                where :{
                    userId : userId
                },
                data :{
                    lastSeenOnline : new Date(),
                    isOnline : true,
                }
            })
        }

        return NextResponse.json({
            success : true,
            message : "presence updated"
        }
        )

    } catch (error) {
        const message = error instanceof Error ? error.message : "Presence update failed!"
        console.log("API Error: Presence API error" , message);
        return NextResponse.json({error : message} , {status : 500})
    }

}

export async function GET(
    request : NextRequest,
    {params} : {params : {docId: string}}
){
    try{
        const userId = getCurrentUser()
        const docId = params.docId

        const permission = await getDocumentPermission(docId)
        if( permission === "none"){
            return NextResponse.json(
                {error : "Access denied!" , status : 403}
            )
        }

        const document = await prisma.document.findUnique({
            where : {id : docId},
            select : {
                ownerId : true,
                collaborators: {
                    select :{
                        userId : true,
                        name : true,
                        email : true,
                    }
                }
            }
        })

        if(!document){
            return NextResponse.json(
                {error : "Document not found!"},
                {status : 404}
            )
        }

        const owner = await prisma.user.findUnique({
            where : { id : document.ownerId},
            select: {
                id : true,
                name: true,
                email :true,
            }
        })

        const activeUsers = [
      {
        userId: owner!.id,
        name: owner!.name,
        email: owner!.email,
       // image: owner!.image,
        color: "#FF6B6B", // Red for owner
        lastSeen: new Date(),
      },
      ...document.collaborators.map((collab, index) => ({
        userId: collab.userId,
        name: collab.user.name,
        email: collab.user.email,
        image: collab.user.image,
        color: [
          "#4ECDC4", // Teal
          "#45B7D1", // Blue
          "#FFA07A", // Light Salmon
          "#98D8C8", // Mint
          "#F7DC6F", // Yellow
        ][index % 5],
        lastSeen: new Date(),
      })),
    ]

    }
    catch{
        const message = error instanceof Error ? error.message : "Failed to get presence"
        console.log("API Error: Presence" , message);

        

    }

}