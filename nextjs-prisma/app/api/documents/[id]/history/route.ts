import { NextRequest , NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"
import { getDocumentPermission } from "@/lib/auth/permission";

export async function GET(
    request : NextRequest,
    {params} : { params : Promise<{id : string}>}
){
    try {
        const {id : docId} = await params
        const permission = await getDocumentPermission(docId)
        if(permission === "none"){
            return NextResponse.json({error : "Access denied"} , {status : 403})
        }
        const doc = await prisma.document.findUnique({
            where : {id : docId},
            select : {
                id : true,
                title : true,
                version : true,
                createdAt : true,
                lastModifiedAt : true,
                ownerId : true,
                owner : {
                    select : {
                        name : true,
                        email : true,
                    }
                },
                collaborators : {
                    select :{
                        userId : true,
                        user : {
                            select : {name : true , email : true}
                        }
                    }
                }
            }
        })

        if(!doc) return NextResponse.json({error : "Document not found"} , {status : 404})

        const history = [
            {
                version : 0,
                timestamp : doc.createdAt,
                userId : doc.ownerId,
                userEmail : doc.owner.email,
                summary : "Document Created",
            },
        ]

        if(doc.version > 0){
            history.push({
                version : doc.version,
                timestamp : doc.lastModifiedAt,
                userId : "unknown",
                //username : "Unknown",
                userEmail : "unknown@gmail.com",
                summary : `Document updated to version ${doc.version}`
            })
        }

        return NextResponse.json({
            docId,
            title : doc.title,
            currentVersion : doc.version,
            history,
        })


        
    } catch (error) {
        const message = error instanceof Error ?error.message : "Failed to get history!"
        console.log("API Error-> GET: documents/[id]/history: " , message);
        return NextResponse.json({error : message} , {status : 500})
        
        
    }

}