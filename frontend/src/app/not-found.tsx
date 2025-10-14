// app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl text-foreground font-semibold mb-6">Oops! Page not found.</h2>
      <p className="text-foreground mb-6">
        The page you are looking for might have been removed or does not exist.
      </p>
      <Link href="/">
        <Button className="text-foreground bg-primary hover:bg-background hover:text-primary border-2 border-primary">Go Back Home</Button>
      </Link>
    </div>
  );
}
