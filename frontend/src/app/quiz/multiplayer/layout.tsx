"use client";

import { WebSocketProvider } from "@/components/utils/websocketprovider";
import { customToast } from "@/lib/toast";
import { useAuthStore } from "@/store/useAuthStore";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const token = useAuthStore().accessToken;

    if (!token) {
        customToast.error("Authentication Error");
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-red-500 font-semibold">
                    Authentication required
                </p>
            </div>
        );
    }

    return <WebSocketProvider token={token}>{children}</WebSocketProvider>;
}
