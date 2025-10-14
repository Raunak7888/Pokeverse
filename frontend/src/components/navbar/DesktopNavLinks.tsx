import Link from "next/link";
import { ThemeToggle } from "./themeToggle";
import AuthMenu from "./AuthMenu";
import { User } from "../utils/types";

export default function DesktopNavLinks({ user }: { user: User|null }) {
  return (
    <div className="hidden md:flex items-center font-aclonica gap-6 text-white font-medium">
      <Link href="/">Home</Link>
      <Link href="/quiz">PokeQuiz</Link>
      <Link href="/about">About</Link>
      <ThemeToggle />
      <AuthMenu user={user} isMobile={false} />
    </div>
  );
}
