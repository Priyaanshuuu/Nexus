import * as Y from "yjs"
import pako from "pako"
import { prisma } from "@/lib/prisma"

export class StateSnapshot {
    static async createSnapshot(
        docId: string,
        ydoc: Y.Doc,
        version: number
    ): Promise<void> {
        try {
            const state = Y.encodeStateAsUpdate(ydoc)
            const compressed = pako.deflate(state)
            const buffer = Buffer.from(compressed)

            const ytext = ydoc.getText("content")
            const content = ytext.toString()

            await prisma.document.update({
                where: { id: docId },
                data: {
                    yjsState: buffer,
                    version,
                    content,
                }
            })

            console.log(`Snapshot created for doc ${docId} v${version}`)
        } catch (error) {
            console.log("Error creating snapshot:", error)
            throw error
        }
    }

    static async cleanupOldSnapshots(docId: string, keepVersions: number = 10): Promise<void> {
        try {
            const doc = await prisma.document.findUnique({
                where: { id: docId },
                select: { version: true },
            })

            if (!doc || doc.version <= keepVersions) {
                return
            }
            console.log(`Cleanup: keeping last ${keepVersions} versions`)
        } catch (error) {
            console.log("Error cleaning up:", error)
        }
    }
}

export async function loadSnapshot(docId : string): Promise<Y.Doc> {
    try {
        const doc = await prisma.document.findUnique({
            where : {id : docId},
            select : {yjsState : true},
        })

        if(!doc || !doc.yjsState){
            return new Y.Doc()
        }
        
        const decompressed = pako.inflate(doc.yjsState)
        const ydoc = new Y.Doc()
        Y.applyUpdate(ydoc, decompressed)

        return ydoc
    } catch (error) {
        console.log("[Snapshot] Error loading snapshot" , error)
        return new Y.Doc()
    }
}

export function getSnapshotSize(state: Uint8Array): number {
    return state.length
}

export async function cleanupOldSnapshots(docId: string, keepVersions: number = 10): Promise<void> {
    try {
        const doc = await prisma.document.findUnique({
            where: { id: docId },
            select: { version: true },
        })

        if (!doc || doc.version <= keepVersions) {
            return
        }
        console.log(`[Snapshot] Cleanup: keeping last ${keepVersions} versions`)
    } catch (error) {
        console.log("Error Cleaning up:", error)
    }
}
