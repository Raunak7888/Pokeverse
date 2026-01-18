import { InlineMath } from "react-katex";

export const SmartText = ({ text }: { text: string }) => {
    if (!text) return null;

    const parts: (string | { math: string })[] = [];
    let currentIndex = 0;

    while (currentIndex < text.length) {
        const startTag = "EQUATION(";
        const startIndex = text.indexOf(startTag, currentIndex);

        if (startIndex === -1) {
            // No more equations, push the rest of the text
            parts.push(text.slice(currentIndex));
            break;
        }

        // Push text before the equation
        if (startIndex > currentIndex) {
            parts.push(text.slice(currentIndex, startIndex));
        }

        // Find the balanced closing parenthesis
        let parenCount = 1;
        let searchIndex = startIndex + startTag.length;
        let foundClosing = false;

        while (searchIndex < text.length && parenCount > 0) {
            if (text[searchIndex] === "(") parenCount++;
            if (text[searchIndex] === ")") parenCount--;
            
            if (parenCount === 0) {
                const mathContent = text.slice(startIndex + startTag.length, searchIndex);
                parts.push({ math: mathContent });
                currentIndex = searchIndex + 1;
                foundClosing = true;
                break;
            }
            searchIndex++;
        }

        // Fallback: If no closing parenthesis was found, treat as plain text
        if (!foundClosing) {
            parts.push(text.slice(startIndex, startIndex + startTag.length));
            currentIndex = startIndex + startTag.length;
        }
    }

    return (
        <span className=" items-center gap-1 justify-center lg:justify-start">
            {parts.map((part, i) => {
                if (typeof part === "object") {
                    return (
                        <span
                            key={i}
                            className=""
                        >
                            {/* {part.math} */}
                            <InlineMath math={part.math} />
                        </span>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </span>
    );
};

export const getDifficultyStyles = (level?: string | null | undefined) => {
    const normalized = level?.toLowerCase();
    if (normalized === "easy")
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400";
    if (normalized === "medium")
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400";
    if (normalized === "hard")
        return "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400";
    return "bg-zinc-100 text-zinc-700 border-zinc-200";
};

export const optionLetters = ["A", "B", "C", "D"];
