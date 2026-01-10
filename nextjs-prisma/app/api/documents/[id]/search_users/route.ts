import {NextRequest , NextResponse} from "next/server"
import {prisma} from "@/lib/prisma"
import { getDocumentPermission } from "@/lib/auth/permission"

export async function GET(
    request : NextRequest,
    {params} : {params : {id : string}}
){
    try {
        const docId = params.id
        const query = request.nextUrl.searchParams.get("q")

        const permission = await getDocumentPermission(docId)
        if(permission !== "owner"){
            return NextResponse.json(
                {error : "Only document owner can search for users"},
                {status : 403}
            )
        }

        if(!query || query.trim().length < 2){
            return NextResponse.json(
                {status : "Search query must be at least 2 character"},
                {status : 400}
            )
        }

        const users = await prisma.user.findMany({
            where : {
                email: {
                    contains:query.toLowerCase(),
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