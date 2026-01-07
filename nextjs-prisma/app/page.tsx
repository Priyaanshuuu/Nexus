import { signIn, signOut, auth } from "@/app/lib/auth";
import { register } from "@/app/actions/register";

export default async function Home() {
 const session = await auth();

return (
  <div className="bg">
    landing page
  </div>
)
}