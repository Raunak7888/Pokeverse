import { useRouter } from "next/navigation";
import { ThemeToggle } from "./themeToggle";
import AuthMenu from "./AuthMenu";
import { User } from "../utils/types";

export default function DesktopNavLinks({
    user,
}: {
    user: User | null;
    setLoading?: (loading: boolean) => void;
}) {
    const router = useRouter();

    const handleNav = (path: string) => {
        router.push(path);
    };

    return (
        <div className="hidden md:flex items-center font-aclonica gap-6 text-white font-medium">
            <button onClick={() => handleNav("/")}>Home</button>
            <button onClick={() => handleNav("/quiz")}>PokeQuiz</button>
            <button onClick={() => handleNav("/about")}>About</button>
            <ThemeToggle />
            <AuthMenu user={user} isMobile={false} />
        </div>
    );
}
