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
        <div className="min-h-screen flex flex-col bg-[#05060a] text-white">
            {children}
        </div>
    )

}