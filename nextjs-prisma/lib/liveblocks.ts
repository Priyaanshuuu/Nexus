import {Liveblocks} from "@liveblocks/node"
import { auth } from "@/auth"

export const liveblocks = new Liveblocks({
    secret : process.env.LIVEBLOCKS_SECRET_KEY || "",
})

export async function generateLiveblockToken() : Promise<string>{
    const session = await auth()
    if(!session?.user?.id){
        throw new Error("Unauthorized")
    }

    const token = await liveblocks.identifyUser(
        {
            userId : session.user.id,
            groupIds : []
        },
        {
            userInfo :{
                name : session.user.name || "Anonymous",
                email : session.user.email || ""
            }
        }
    )

    return token.toString()
}

export async function getUserPresence(
    docId : string,
    userId : string
) : Promise<unknown>{
    try {
        return null
    } catch (error) {
        console.log(error);
        return null
    }
}

export async function updatePresence(
    docId : string,
    userId : string,
    presence : unknown
) : Promise<void>{
    try {
        console.log(
            `[Liveblocks] Presence updated : ${userId} in ${docId}`, presence
        );
    } catch (error) {
        console.log(error);
    }

}