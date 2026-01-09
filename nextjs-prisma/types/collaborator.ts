export type CollaboratorRole = "OWNER" | "EDITOR" | "VIEWER"

export interface AddCollaboratorInput {
  email: string
  role: CollaboratorRole
}

export interface UpdateCollaboratorInput {
  role: CollaboratorRole
}

export interface CollaboratorResponse {
  id: string
  userId: string
  docId: string
  role: CollaboratorRole
  addedAt: Date
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
}

export interface UserSearchResult {
  id: string
  name: string | null
  email: string | null
  image: string | null
}