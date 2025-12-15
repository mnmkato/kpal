import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-160px)] items-center justify-center px-4 py-20">
      <div className="mx-auto max-w-xl text-center">
        {/* 404 label */}
        <div className="mb-6 text-9xl font-medium leading-none text-zinc-300">
          404
        </div>

        {/* Description */}
        <p className="mx-auto mb-8 max-w-md text-lg text-zinc-400">
          Unfortunately, this is only a 404 page. You may have mistyped the
          address, or the page has been moved to another URL.
        </p>

        {/* Action */}
        <div className="flex justify-center">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Take me back to home page
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}