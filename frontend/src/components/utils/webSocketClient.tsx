import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { BACKEND_URL } from "./backendUrl";

interface Subscription {
    topic: string;
    callback: (message: IMessage) => void;
}

interface WebSocketConfig {
    token?: string;
    subscriptions: Subscription[];
    onConnected?: () => void;
    onError?: (error: unknown) => void;
    onDisconnected?: () => void;
}

// Global client instance and state
let stompClient: Client | null = null;
const activeSubscriptions: Map<string, StompSubscription> = new Map();
let isConnecting = false;
let connectionToken: string | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Connects to WebSocket and subscribes to topics
 * If already connected with the same token, reuses the connection
 */
export const connectWebSocket = (config: WebSocketConfig): Client | null => {
    const { token, subscriptions, onConnected, onError, onDisconnected } =
        config;

    // If already connected with the same token, just add new subscriptions
    if (stompClient?.connected && connectionToken === token) {
        console.log("♻️ Reusing existing WebSocket connection");
        subscribeToTopics(subscriptions);
        if (onConnected) onConnected();
        return stompClient;
    }

    // If connecting with a different token, disconnect first
    if (stompClient?.connected && connectionToken !== token) {
        console.log("🔄 Token changed, reconnecting...");
        disconnectWebSocket();
    }

    // Prevent multiple simultaneous connection attempts
    if (isConnecting) {
        console.log("⏳ Connection already in progress...");
        return null;
    }

    isConnecting = true;
    connectionToken = token || null;

    const wsUrl = BACKEND_URL + "/ws";

    stompClient = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        debug: (Str) => {
            //  Uncomment for detailed debugging
             console.log("🔍 STOMP:", Str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,

        onConnect: () => {
            console.log("✅ WebSocket connected successfully");
            isConnecting = false;
            reconnectAttempts = 0;

            // Subscribe to all topics
            subscribeToTopics(subscriptions);

            if (onConnected) onConnected();
        },

        onStompError: (frame) => {
            console.error("❌ STOMP error:", frame.headers["message"]);
            console.error("Details:", frame.body);
            isConnecting = false;

            if (onError) {
                onError({
                    message: frame.headers["message"],
                    body: frame.body,
                });
            }
        },

        onWebSocketError: (event) => {
            console.error("❌ WebSocket error:", event);
            isConnecting = false;

            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                reconnectAttempts++;
                console.log(
                    `🔄 Reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`
                );
            } else {
                console.error("❌ Max reconnection attempts reached");
            }

            if (onError) onError(event);
        },

        onDisconnect: () => {
            console.log("🔌 WebSocket disconnected");
            isConnecting = false;
            activeSubscriptions.clear();

            if (onDisconnected) onDisconnected();
        },
    });

    stompClient.activate();
    return stompClient;
};

/**
 * Subscribe to topics
 * Checks if already subscribed to prevent duplicates
 */
export const subscribeToTopics = (subscriptions: Subscription[]) => {
    if (!stompClient?.connected) {
        console.error("❌ Cannot subscribe: client not connected");
        return;
    }

    subscriptions.forEach(({ topic, callback }) => {
        // Unsubscribe if already subscribed to this topic
        if (activeSubscriptions.has(topic)) {
            console.log(`♻️ Re-subscribing to ${topic}`);
            activeSubscriptions.get(topic)?.unsubscribe();
        }

        // Subscribe to the topic
        const subscription = stompClient!.subscribe(topic, (message) => {
            try {
                callback(message);
            } catch (err) {
                console.error(
                    `❌ Error in subscription callback for ${topic}:`,
                    err
                );
            }
        });

        activeSubscriptions.set(topic, subscription);
        console.log(`✅ Subscribed to ${topic}`);
    });
};

/**
 * Unsubscribe from specific topics
 */
export const unsubscribeFromTopics = (topics: string[]) => {
    topics.forEach((topic) => {
        const subscription = activeSubscriptions.get(topic);
        if (subscription) {
            subscription.unsubscribe();
            activeSubscriptions.delete(topic);
            console.log(`🔕 Unsubscribed from ${topic}`);
        }
    });
};

/**
 * Send a message to a destination
 */
export const sendMessage = (destination: string, body: unknown) => {
    if (!stompClient?.connected) {
        console.error("❌ Cannot send message: client not connected");
        return false;
    }

    try {
        stompClient.publish({
            destination,
            body: JSON.stringify(body),
        });
        console.log(`📤 Message sent to ${destination}`, body);
        return true;
    } catch (err) {
        console.error(`❌ Error sending message to ${destination}:`, err);
        return false;
    }
};

/**
 * Disconnect WebSocket
 * Unsubscribes from all topics and deactivates the client
 */
export const disconnectWebSocket = () => {
    if (stompClient) {
        console.log("🔌 Disconnecting WebSocket...");

        // Unsubscribe from all active subscriptions
        activeSubscriptions.forEach((subscription, topic) => {
            subscription.unsubscribe();
            console.log(`🔕 Unsubscribed from ${topic}`);
        });

        activeSubscriptions.clear();

        // Deactivate the client
        stompClient.deactivate();
        stompClient = null;
        connectionToken = null;
        isConnecting = false;
        reconnectAttempts = 0;

        console.log("✅ WebSocket disconnected successfully");
    }
};

/**
 * Check if WebSocket is connected
 */
export const isConnected = (): boolean => {
    return stompClient?.connected || false;
};

/**
 * Get active subscriptions
 */
export const getActiveSubscriptions = (): string[] => {
    return Array.from(activeSubscriptions.keys());
};
