import { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation"

export default async function EditorLayout({
    children,
}: {
    children: ReactNode
}) {
    const session = await auth()
    if(!session){
        redirect("/auth/signin")
    }

    return (
        <div className="h-screen flex flex-col bg-white">
            {children}
        </div>
    )

}