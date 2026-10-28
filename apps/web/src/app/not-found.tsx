import Link from "next/link";
import { CapsuleMark } from "@/components/ui/BrandMark";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <CapsuleMark className="mx-auto h-16 w-16" />
        <h1 className="mt-6 font-display text-4xl font-semibold">Page not found</h1>
        <p className="mt-3 text-lg text-ink-soft">The page you are looking for has moved or does not exist.</p>
        <Link href="/" className="btn-ink mt-8">
          Go to home page
        </Link>
      </div>
    </main>
  );
}
