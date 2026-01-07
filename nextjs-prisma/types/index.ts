

export type UserRole = "OWNER" | "EDITOR" | "VIEWER"

export interface User {
  id: string
  email: string | null
  name: string | null
  image: string | null
  createdAt: Date
}

export interface Document {
  id: string
  title: string
  content: string
  ownerId: string
  version: number
  isLocalOnly: boolean
  lastModifiedAt: Date
  createdAt: Date
}

export interface Collaborator {
  id: string
  docId: string
  userId: string
  role: UserRole
  addedAt: Date
}

export interface SyncOperation {
  id: string
  userId: string
  docId: string
  operation: "CREATE" | "UPDATE" | "DELETE"
  payload: {
   prop1: string,
   prop2: number

  }
  status: "PENDING" | "SYNCED" | "FAILED"
  createdAt: Date
}