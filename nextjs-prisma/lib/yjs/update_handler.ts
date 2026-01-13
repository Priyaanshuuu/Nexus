import * as Y from "yjs"
import { YjsDocumentManager } from "./document_manager"
import { StateSnapshot } from "./state_snapshot"

export class UpdateHandler {
    static async applyClientUpdate(
        docId: string,
        updateBuffer: Uint8Array,
        clientVersion: number,
        userId: string
    ): Promise<{
        success: boolean
        newVersion: number
        content: string
        error?: string
    }> {
        try {
            const ydoc = await YjsDocumentManager.getDocumentState(docId)

            const beforeContent = YjsDocumentManager.getTextContent(ydoc)
            console.log(beforeContent.length);
            

            Y.applyUpdate(ydoc , updateBuffer)

            const afterContent = YjsDocumentManager.getTextContent(ydoc)

            const newVersion = clientVersion + 1
            await StateSnapshot.createSnapshot(docId , ydoc , newVersion)
            console.log(`[UpdateHandler] Update applied to "${docId} by user ${userId}`);

            return {
                success : true,
                newVersion,
                content : afterContent
            }
            
            return {
                success: true,
                newVersion: clientVersion,
                content: "",
            }
        } catch (error) {
           console.log(error);
            return {
                success: false,
                newVersion: clientVersion,
                content: "",
                error: error instanceof Error ? error.message : String(error),
            }
        }
    }

    static async mergeConcurrentUpdated(
        docId : string,
        updates : Uint8Array

    ) : Promise<string> {
        try {
            const ydoc = await YjsDocumentManager.getDocumentState(docId)
            for(const update of updates){
                YjsDocumentManager.applyUpdate(ydoc , update)
            }

            return YjsDocumentManager.getTextContent(ydoc)
            
        } catch (error) {
            console.log("Error merging updates" , error);
            throw error
            
            
        }
    }
    static async getSyncUpdates(
     

    ) : Promise<Uint8Array> {
      
    }
}