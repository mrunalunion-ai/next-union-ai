import Link from "next/link";
import { Button } from "@/components/ui/button";
import { APP_URL } from "@/constant/static";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">This page could not be found.</p>
      <Button asChild>
        <Link href={APP_URL.LINKS.HOME}>Go home</Link>
      </Button>
    </div>
  );
}
