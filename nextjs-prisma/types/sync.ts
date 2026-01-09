export interface SyncOperationInput {
  userId: string
  docId: string
  operation: "CREATE" | "UPDATE" | "DELETE"
  payload: SyncPayLoad
}

export interface SyncOperation extends SyncOperationInput {
  id?: string
  status: "PENDING" | "SYNCED" | "FAILED"
  retries?: number
  error?: string
  createdAt?: Date
  syncedAt?: Date
}

export interface SyncPayLoad {
    content?: string
    yjsUpdate?: string
    yjsState?: string
    title?: string
  [key: string]: string | undefined
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