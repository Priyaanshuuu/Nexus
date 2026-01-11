export interface UserPresence{
    userId : string, 
    userEmail : string | null,
    userName : string | null,
    cursor?: {
        x: number,
        y: number
    }
    selection?: {
        start : number
        end : number
    }
    color : string
    lastSeen : Date
    isOnline : boolean
}

export interface PresenceUpdate{
    cursor ? :{
        x : number
        end: number
    }
    status?: "editing" | "idle" | "away"
}

export interface ActionUserResponse{
    userId : string
    name : string | null
    email : string | null
    color : string
    lastSeen : Date
    cursor? : {
        x : number
        y : number
    }
    selection ? :{
        start : number
        end : number
    }
}

export interface LiveblocksAuthToken {
    token : string
    expiresAt : number
}