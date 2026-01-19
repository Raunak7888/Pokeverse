"use client";
import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useCallback,
} from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { BACKEND_URL } from "./backendUrl";

interface WebSocketContextType {
    client: Client | null;
    connected: boolean;
    subscribe: (topic: string, callback: (msg: IMessage) => void) => () => void;
    send: (destination: string, body: unknown) => boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{
    token: string;
    children: React.ReactNode;
}> = ({ token, children }) => {
    const clientRef = useRef<Client | null>(null);
    const [connected, setConnected] = React.useState(false);
    const subscriptionsRef = useRef<Map<string, Set<(msg: IMessage) => void>>>(
        new Map()
    );
    const activeStompSubsRef = useRef<Map<string, { unsubscribe: () => void }>>(
        new Map()
    );

    useEffect(() => {
        if (!token) {
            console.warn("⚠️ No token provided to WebSocketProvider");
            return;
        }

        const wsUrl = BACKEND_URL + "/ws";

        console.log("🔌 Initializing WebSocket connection...");

        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,

            onConnect: () => {
                console.log("✅ WebSocket connected");
                setConnected(true);

                // Resubscribe to all topics after reconnection
                subscriptionsRef.current.forEach((callbacks, topic) => {
                    if (callbacks.size > 0) {
                        subscribeToTopic(topic);
                    }
                });
            },

            onStompError: (frame) => {
                console.error("❌ STOMP error:", frame.headers["message"]);
                console.error("Details:", frame.body);
            },

            onWebSocketError: (event) => {
                console.error("❌ WebSocket error:", event);
            },

            onDisconnect: () => {
                console.log("🔌 WebSocket disconnected");
                setConnected(false);
                activeStompSubsRef.current.clear();
            },
        });

        clientRef.current = client;
        client.activate();

        // Internal function to subscribe to a topic with STOMP
        const subscribeToTopic = (topic: string) => {
            if (!client.connected) return;

            // Don't resubscribe if already subscribed
            if (activeStompSubsRef.current.has(topic)) return;

            const stompSub = client.subscribe(topic, (message) => {
                const callbacks = subscriptionsRef.current.get(topic);
                if (callbacks) {
                    callbacks.forEach((callback) => {
                        try {
                            callback(message);
                        } catch (err) {
                            console.error(
                                `❌ Error in callback for ${topic}:`,
                                err
                            );
                        }
                    });
                }
            });

            activeStompSubsRef.current.set(topic, stompSub);
            console.log(
                `✅ Subscribed to ${topic} (${
                    subscriptionsRef.current.get(topic)?.size || 0
                } listeners)`
            );
        };

        return () => {
            console.log("🔌 Cleaning up WebSocket connection");
            // eslint-disable-next-line react-hooks/exhaustive-deps
            activeStompSubsRef.current.clear();
            // eslint-disable-next-line react-hooks/exhaustive-deps
            subscriptionsRef.current.clear();
            client.deactivate();
            clientRef.current = null;
        };
    }, [token]);

    // Subscribe function - returns unsubscribe function
    const subscribe = useCallback(
        (topic: string, callback: (msg: IMessage) => void) => {
            // Add callback to subscribers map
            if (!subscriptionsRef.current.has(topic)) {
                subscriptionsRef.current.set(topic, new Set());
            }
            subscriptionsRef.current.get(topic)!.add(callback);

            // Subscribe to topic if connected and not already subscribed
            if (
                clientRef.current?.connected &&
                !activeStompSubsRef.current.has(topic)
            ) {
                const stompSub = clientRef.current.subscribe(
                    topic,
                    (message) => {
                        const callbacks = subscriptionsRef.current.get(topic);
                        if (callbacks) {
                            callbacks.forEach((cb) => {
                                try {
                                    cb(message);
                                } catch (err) {
                                    console.error(
                                        `❌ Error in callback for ${topic}:`,
                                        err
                                    );
                                }
                            });
                        }
                    }
                );
                activeStompSubsRef.current.set(topic, stompSub);
                console.log(`✅ Subscribed to ${topic}`);
            }

            // Return unsubscribe function
            return () => {
                const callbacks = subscriptionsRef.current.get(topic);
                if (callbacks) {
                    callbacks.delete(callback);

                    // If no more callbacks for this topic, unsubscribe from STOMP
                    if (callbacks.size === 0) {
                        const stompSub = activeStompSubsRef.current.get(topic);
                        if (stompSub) {
                            stompSub.unsubscribe();
                            activeStompSubsRef.current.delete(topic);
                            subscriptionsRef.current.delete(topic);
                            console.log(`🔕 Unsubscribed from ${topic}`);
                        }
                    }
                }
            };
        },
        []
    );

    // Send message function
    const send = useCallback((destination: string, body: unknown): boolean => {
        if (!clientRef.current?.connected) {
            console.error("❌ Cannot send: WebSocket not connected");
            return false;
        }

        try {
            clientRef.current.publish({
                destination,
                body: JSON.stringify(body),
            });
            console.log(`📤 Sent to ${destination}:`, body);
            return true;
        } catch (err) {
            console.error(`❌ Failed to send to ${destination}:`, err);
            return false;
        }
    }, []);

    return (
        <WebSocketContext.Provider
            value={{
                client: clientRef.current,
                connected,
                subscribe,
                send,
            }}
        >
            {children}
        </WebSocketContext.Provider>
    );
};

// Custom hook to use WebSocket
export const useWebSocket = () => {
    const ctx = useContext(WebSocketContext);
    if (!ctx) {
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    }
    return ctx;
};
