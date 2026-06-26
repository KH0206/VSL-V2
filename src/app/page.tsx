import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-16">
      <h1 className="text-3xl font-semibold">Webapp</h1>
      <p className="text-muted-foreground">React + Next.js + Supabase starter</p>
      <div className="flex gap-4">
        <Button render={<Link href="/login">Log in</Link>} nativeButton={false} />
        <Button render={<Link href="/signup">Sign up</Link>} variant="outline" nativeButton={false} />
      </div>
    </div>
  );
}
