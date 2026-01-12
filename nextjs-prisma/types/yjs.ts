export interface YjsState{
    state : Uint8Array
    version : number
    lastModified : Date
}

export interface YjsUpdate{
    update:Uint8Array | string
    version : number
    timestamp : Date
    userId : string
}

export interface ApplyUpdateRequest{
    update:string
    clientVersion : number
    timestamp : Date
}

export interface StateSnapshot {
    docId : string
    state: string
    version : number
    content : string
    createdAt : Date 
}

export interface VersionHistoryEntry{
    version : number
    timestamp : Date
    userId : string
    summary : string
}