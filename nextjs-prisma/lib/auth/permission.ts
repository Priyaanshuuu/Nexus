import { auth } from "@/auth";
import {prisma} from "@/lib/prisma"
import type { DocumentPermission } from "@/types/document";

export async function getDocumentPermission(
    docId: string
): Promise<DocumentPermission>{
    
    const session = await auth()

    if(!session?.user?.id){
        return "none"
    }

    const doc = await prisma.document.findUnique({
        where : {id : docId},
        select : {
            ownerId : true,
            collaborators: {
                where : {userId : session.user.id},
                select : {role : true}
            }
        }
    })

    if(!doc) return "none"

    if(doc.ownerId === session.user.id) return "owner"

    if(doc.collaborators.length > 0){
        const role = doc.collaborators[0].role.toLowerCase()
        if(role === "editor") return "editor"
        if(role === "viewer") return "viewer"
    }

    return "none"
}

export async function requireDocumentPermission(
    docId : string,
    requiredLevel : DocumentPermission
) : Promise<void>{
    const permission = await getDocumentPermission(docId)
    const permissionLevel = {owner : 3 , editor : 2 , viewer:1 , none : 0}
    const userLevel = permissionLevel[permission]
    const requiredLevelValue = permissionLevel[requiredLevel]

    if (userLevel < requiredLevelValue) {
    throw new Error(`Access denied. Required: ${requiredLevel}, You have: ${permission}`)
  }
}

export async function getCurrentUser() : Promise<string>{
    const session = await auth()
    if(!session?.user?.id){
        throw new Error("Unauthorized: No active sessions")
    }

    return session.user.id
}