import {NextRequest , NextResponse} from "next/server"
import { SyncProcessor } from "@/lib/sync/sync_processor"

export async function POST(request : NextRequest){
    try {
        const authHeader = request.headers.get("authorization")
        if(authHeader !== `Bearer ${process.env.SYNC_PROCESS_SECRET}`){
            const host = request.headers.get("host")
            if(!host?.includes("localhost")){
                return NextResponse.json(
                    {error : "Unauthorized"},
                    {status : 401}
                )
            }
        }

        const syncedCount = await SyncProcessor.processPendingQueue()

        return NextResponse.json(
            {
                success : true,
                syncedCount,
                message : `${syncedCount} operations synced`
            }
        )
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {error: "Failed to process queue"},
            {status : 500}
        )
    }
}