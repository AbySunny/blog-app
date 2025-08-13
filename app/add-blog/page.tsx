import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TipTapDemo from "./TipTapDemo"; // client component

export default async function AddBlogPage() {
  const cookieStore =await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token) {
    redirect("/signin");
  }

  return <TipTapDemo />;
}
