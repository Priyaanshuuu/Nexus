import * as Y from "yjs"
import {prisma} from "@/lib/prisma"

export class YjsDocumentManager{
    static createYjsDoc(dbState: Buffer | null) : Y.Doc {
        const ydoc = new Y.Doc()

        if(dbState && dbState.length > 0){
            try {
                Y.applyUpdate(ydoc , dbState)
            } catch (error) {
                console.log("[Yjs] Error applying saved state: " ,error);
            }
        }

        return ydoc
    }

    static async getDocumentState(docId : string): Promise<Y.Doc>{
    try {
        const doc = await prisma.document.findUnique({
            where : {id:docId},
            select : {
                yjsState : true
            }
        })
        if(!doc){
            throw new Error("Document not found")
        }

        return this.createYjsDoc(doc.yjsState)
    } catch (error) {
        console.log("[Yjs] Error getting document state!!", error)
        throw error
    }
}

    static getTextContent(ydoc : Y.Doc) : string {
        const ytext = ydoc.getText("content")
        return ytext.toString()
    }

    static applyUpdate(ydoc : Y.Doc , update: Uint16Array) : void {
        try {
            Y.applyUpdate(ydoc , update)
        } catch (error) {
            console.log("[Yjs] Error applying update" , error);
            throw new Error("Failed to apply update")
        }
    }

    static encodeState(ydoc : Y.Doc): Uint16Array {
        return Y.encodeStateAsUpdate(ydoc)
    }

    static getDiff(ydoc : Y.Doc , stateVector : Uint8Array){
        return Y.encodeStateVector(ydoc)
    }

}
