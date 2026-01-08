import type {NextAuthConfig} from "next-auth"
import "next-auth/jwt"

export interface AuthUSer {
    id : string
    email : string | null
    name : string | null
}

export interface SignUpInput {
    email : string
    password: string
    name? : string
}

export interface SignInInput {
    email : string
    password : string
}

declare module "next-auth"{
    interface User {
        id: string
    }
}

interface Session {
    user : {
        id: string
        email: string| null
        name : string | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id : string
    }
}