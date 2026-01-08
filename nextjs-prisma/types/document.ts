export interface DocumentCreateInput {
  title?: string
  isLocalOnly : boolean
}

export interface DocumentUpdateInput {
  title?: string
  content?: string
}

export interface DocumentResponse {
  id: string
  title: string
  content: string
  ownerId: string
  version: number
  isLocalOnly: boolean
  lastModifiedAt: Date
  createdAt: Date
  collaborators?: Array<{
    id: string
    userId: string
    role: "OWNER" | "EDITOR" | "VIEWER"
    user: {
      name: string | null
      email: string | null
      image: string | null
    }
  }>
}

export type DocumentPermission = "owner" | "editor" | "viewer" | "none"