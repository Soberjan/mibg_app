import { state } from "../state.js";
import { initPage } from "../lobbyMain.js";

const SOCKET_CHECK_MS = 5000;
const SOCKET_MAX_SILENCE_MS = 15000;
const SOCKET_RECONNECT_DELAY_MS = 1000;

let socketIntervalId = null;
let reconnectTimeoutId = null;
let lastServerMessageAt = 0;
let socketMessageHandler = null;

function getSocketUrl() {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";

    return `${wsProtocol}//${window.location.host}/lobby?lobby_id=${encodeURIComponent(state.lobbyId)}&player_id=${encodeURIComponent(state.localPlayerId)}`;
}

function sendSocketPing(ws) {
    if (ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify({
        type: "ping",
        sentAt: Date.now(),
    }));
}

function scheduleReconnect() {
    if (reconnectTimeoutId !== null) return;

    reconnectTimeoutId = setTimeout(() => {
        reconnectTimeoutId = null;
        reconnectSocket();
    }, SOCKET_RECONNECT_DELAY_MS);
}

export function connectSocket(onMessage) {
    socketMessageHandler = onMessage;

    if (
        state.ws &&
        (
            state.ws.readyState === WebSocket.OPEN ||
            state.ws.readyState === WebSocket.CONNECTING
        )
    ) {
        return state.ws;
    }

    const ws = new WebSocket(getSocketUrl());
    state.ws = ws;
    lastServerMessageAt = Date.now();

    ws.onopen = () => {
        console.log("WebSocket connected");
        lastServerMessageAt = Date.now();

        try {
            sendSocketPing(ws);
        } catch (err) {
            console.warn("WebSocket ping failed after open", err);
        }
    };

    ws.onmessage = async (event) => {
        lastServerMessageAt = Date.now();

        try {
            const res = JSON.parse(event.data);

            if (res.type === "pong") {
                return;
            }
        } catch {
            // Если вдруг прилетело не JSON-сообщение,
            // отдаем его обычному обработчику.
        }

        if (typeof socketMessageHandler === "function") {
            await socketMessageHandler(event);
        }
    };

    ws.onerror = (event) => {
        console.warn("WebSocket error", event);

        if (state.ws === ws) {
            try {
                ws.close();
            } catch {
                scheduleReconnect();
            }
        }
    };

    ws.onclose = (event) => {
        console.warn("WebSocket closed", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
        });

        if (state.ws === ws) {
            scheduleReconnect();
        }
    };

    return ws;
}

export function reconnectSocket() {
    const ws = state.ws;

    if (
        ws &&
        (
            ws.readyState === WebSocket.OPEN ||
            ws.readyState === WebSocket.CONNECTING
        )
    ) {
        return;
    }

    connectSocket(socketMessageHandler);
}

export function startSocketWatcher(onMessage) {
    socketMessageHandler = onMessage;

    connectSocket(onMessage);

    if (socketIntervalId !== null) return;

    socketIntervalId = setInterval(() => {
        const ws = state.ws;

        if (!ws) {
            scheduleReconnect();
            return;
        }

        if (ws.readyState === WebSocket.CONNECTING) {
            return;
        }

        if (
            ws.readyState === WebSocket.CLOSING ||
            ws.readyState === WebSocket.CLOSED
        ) {
            scheduleReconnect();
            return;
        }

        if (ws.readyState === WebSocket.OPEN) {
            const silenceMs = Date.now() - lastServerMessageAt;

            if (silenceMs > SOCKET_MAX_SILENCE_MS) {
                console.warn("WebSocket looks dead, reconnecting");

                try {
                    ws.close();
                } catch {
                    // если close тоже упал, просто переподключаемся ниже
                }

                scheduleReconnect();
                return;
            }

            try {
                sendSocketPing(ws);
            } catch (err) {
                console.warn("WebSocket ping failed", err);

                try {
                    ws.close();
                } catch {
                    // игнор
                }

                scheduleReconnect();
            }
        }
    }, SOCKET_CHECK_MS);

    window.addEventListener("online", scheduleReconnect);

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            scheduleReconnect();
        }
    });
}
