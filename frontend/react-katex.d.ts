declare module "react-katex" {
    import * as React from "react";

    export interface InlineMathProps {
        math: string;
        errorColor?: string;
        renderError?: (error: Error) => React.ReactNode;
    }

    export type BlockMathProps = InlineMathProps

    export const InlineMath: React.FC<InlineMathProps>;
    export const BlockMath: React.FC<BlockMathProps>;
}
