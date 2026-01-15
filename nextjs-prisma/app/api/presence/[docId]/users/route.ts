import { NextResponse , NextRequest } from "next/server";
import {prisma} from "@/lib/prisma"
import { getCurrentUser , getDocumentPermission } from "@/lib/auth/permission";

export async function GET(
    request : NextRequest,
    {params} : { params : Promise<{ docId : string}>}
){
    try {
        const userId = await getCurrentUser()
        const {docId} = await params

        const permission = await getDocumentPermission(docId)
        if(permission === 'none'){
            return NextResponse.json(
                {error : "Access Denied"} , {status : 403}
            )
        }

        const document = await prisma.document.findUnique({
            where : {id : docId},
            select : {
                id : true,
                ownerId : true,
                collaborators:{
                    select : {
                        userId : true,
                        role : true,
                        user : {
                            select :{
                                id : true,
                                name : true,
                                email : true
                            }
                        }
                    },
                    orderBy : {addedAt : "asc"}
                }
            }
        })

        if(!document){
            return NextResponse.json(
                {error : "Document Not Found!"},
                {status : 404}
            )
        }

        const owner = await prisma.user.findUnique({
            where : {id : document.ownerId},
            select : {
                id : true,
                name : true,
                email : true,
            }
        })

        const colors = [
      "#FF6B6B", // Red - Owner
      "#4ECDC4", // Teal
      "#45B7D1", // Blue
      "#FFA07A", // Light Salmon
      "#98D8C8", // Mint
      "#F7DC6F", // Yellow
    ]

    // Build active users with assigned colors
    const activeUsers = [
      {
        userId: owner!.id,
        name: owner!.name || "Unknown",
        email: owner!.email || "unknown@example.com",
       // image: owner!.image,
        role: "OWNER",
        color: colors[0], // Red for owner
        isCurrentUser: owner!.id === userId,
      },
      ...document.collaborators.map((collab: { userId: string; role: string; user: { id: string; name: string | null; email: string | null } }, index: number) => ({
        userId: collab.userId,
        name: collab.user.name || "Unknown",
        email: collab.user.email || "unknown@example.com",
       // image: collab.user.image,
        role: collab.role,
        color: colors[(index + 1) % colors.length],
        isCurrentUser: collab.userId === userId,
      })),
    ]

    return NextResponse.json(
        {
            docId,
            users : activeUsers,
            count : activeUsers.length
        }
    )

    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to get users!!"
        console.log("API Error" , message);
        return NextResponse.json({error : message} , {status : 500})
        
        
    }

}