export interface SyncOperation {
    id? : string
    userId : string
    docId : string
    operation : "CREATE" | "UPDATE" | "DELETE"
    payload : SyncPayLoad
    status : "PENDING" | "SYNCED" | "FAILED"
    retries?: number
    error? : string
    createdAt?: Date
    syncedAt?: Date
}

export interface SyncPayLoad {
    property1: string
    property2 : number
}
export interface SyncQueueResponse {
  id: string
  docId: string
  operation: "CREATE" | "UPDATE" | "DELETE"
  payload: SyncPayLoad
  status: "PENDING" | "SYNCED" | "FAILED"
  retries: number
  error: string | null
  createdAt: Date
  syncedAt: Date | null
}

export interface SyncStatusResponse {
  docId: string
  pendingCount: number
  operations: SyncQueueResponse[]
}

export interface BatchSyncRequest {
    operations : SyncOperation[]
}

export interface ConflictResolution{
    serverVersion : number
    clientVersion : number
    mergerd: boolean
    resolvedContent : string
}