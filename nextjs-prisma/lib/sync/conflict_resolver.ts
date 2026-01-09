import * as Y from "yjs"
import type { ConflictResolution } from "@/types/sync"

export class ConflictResolver {
    static mergeUpdates(
        serverContent : string,
        clientUpdates: Uint8Array
    ) : {mergedContent: string; resolved : boolean}{
        try {
            const serverDoc = new Y.Doc()
            const serverText = serverDoc.getText("content")
            serverText.insert(0 , serverContent)

            Y.applyUpdate(serverDoc , clientUpdates)

            const  mergedContent = serverText.toString()

            return {
                mergedContent,
                resolved : true
            }
            
        } catch (error) {
            console.log("ConflictResolver Merge failed!!" , error);
            return {
                mergedContent: serverContent,
                resolved : false
            }
            
            
        }
    }

    static compareVersions(
        serverVersion : number, 
        clientVersion : number
    ) : "server" | "client" | "same" {
        if(serverVersion > clientVersion) return "server"
        if(clientVersion > serverVersion) return "client"
        return "same"
    }

    static lastWriteWins(
        serverContent : string , 
        clientContent : string,
        serverTimeStamp : Date,
        clientTimeStamp : Date
    ) : string {
        return serverTimeStamp > clientTimeStamp ? serverContent : clientContent
    }

    static createSnapShot(content : string): Uint8Array {
        const doc = new Y.Doc()
        const ytext = doc.getText("content")
        ytext.insert(0 , content)
        return Y.encodeStateAsUpdate(doc)
    }

    static loadSnapShot(snapshot:Uint8Array | null) : string {
        if(!snapshot) return ""

        try {
            const doc = new Y.Doc()
            Y.applyUpdate(doc , snapshot)
            return doc.getText("content").toString()
        } catch (error) {
            console.log("Load snapshot failed", error);
            return ""
        }
    }
}