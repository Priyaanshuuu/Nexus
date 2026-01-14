import {NextRequest , NextResponse} from "next/server"
import {prisma} from "@/lib/prisma"
import { getDocumentPermission } from "@/lib/auth/permission"

export async function GET(
    request : NextRequest,
    {params} : {params : Promise<{id : string}>}
){
    try {
        const {id : docId} = await params
        if (!docId) {
            return NextResponse.json(
                { error: "Document id is required" },
                { status: 400 }
            )
        }

        const queryRaw = request.nextUrl.searchParams.get("q")?.trim() ?? ""

        const permission = await getDocumentPermission(docId)
        if(permission !== "owner"){
            return NextResponse.json(
                {error : "Only document owner can search for users"},
                {status : 403}
            )
        }

        if(queryRaw.length < 2){
            return NextResponse.json(
                {error : "Search query must be at least 2 characters"},
                {status : 400}
            )
        }

        const query = queryRaw.toLowerCase()

        const users = await prisma.user.findMany({
            where : {
                email: {
                    contains: query,
                    mode : "insensitive"
                }
            },
            select : {
                id : true,
                name : true,
                email : true,
            },
            take : 10,
        })

        return NextResponse.json(users)

    } catch (error) {
        console.log(error);
        
        return NextResponse.json(
            {error : "Error in getting search users"},
            {status : 500}
        )
        
    }

}