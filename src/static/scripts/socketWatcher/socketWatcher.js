import { state } from "../state.js";

const SOCKET_CHECK_MS = 5000;
const SOCKET_PONG_TIMEOUT_MS = 20000;
const SOCKET_RECONNECT_DELAY_MS = 1000;

let socketIntervalId = null;
let reconnectTimeoutId = null;
let socketMessageHandler = null;

let waitingForPong = false;
let lastPingAt = 0;

function getSocketUrl() {
    const wsProtocol =
        window.location.protocol === "https:" ? "wss:" : "ws:";

    return (
        `${wsProtocol}//${window.location.host}/lobby` +
        `?lobby_id=${encodeURIComponent(state.lobbyId)}` +
        `&player_id=${encodeURIComponent(state.localPlayerId)}`
    );
}

function socketIsBusy(ws) {
    return ws && (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING ||
        ws.readyState === WebSocket.CLOSING
    );
}

function sendSocketPing(ws) {
    if (ws.readyState !== WebSocket.OPEN) {
        return;
    }

    waitingForPong = true;
    lastPingAt = Date.now();

    ws.send(JSON.stringify({
        type: "ping",
        sentAt: lastPingAt,
    }));
}

function scheduleReconnect() {
    if (reconnectTimeoutId !== null) {
        return;
    }

    // Пока старый сокет открыт, подключается или закрывается,
    // новый сокет не создаём.
    if (socketIsBusy(state.ws)) {
        return;
    }

    reconnectTimeoutId = window.setTimeout(() => {
        reconnectTimeoutId = null;
        reconnectSocket();
    }, SOCKET_RECONNECT_DELAY_MS);
}

export function connectSocket(onMessage = socketMessageHandler) {
    socketMessageHandler = onMessage;

    if (socketIsBusy(state.ws)) {
        return state.ws;
    }

    const ws = new WebSocket(getSocketUrl());

    state.ws = ws;
    waitingForPong = false;
    lastPingAt = 0;

    console.log("Creating WebSocket");

    ws.onopen = () => {
        // Этот сокет уже мог быть заменён другим.
        if (state.ws !== ws) {
            ws.close();
            return;
        }

        console.log("WebSocket connected");

        waitingForPong = false;
        sendSocketPing(ws);
    };

    ws.onmessage = async event => {
        // Не обрабатываем сообщения от старого сокета.
        if (state.ws !== ws) {
            return;
        }

        // Любое сообщение от сервера означает,
        // что соединение живо.
        waitingForPong = false;

        try {
            const response = JSON.parse(event.data);

            if (response.type === "pong") {
                return;
            }
        } catch {
            // Не JSON — передаём обычному обработчику.
        }

        if (typeof socketMessageHandler === "function") {
            await socketMessageHandler(event);
        }
    };

    ws.onerror = event => {
        if (state.ws !== ws) {
            return;
        }

        console.warn("WebSocket error", event);

        // Здесь переподключение не запускаем.
        // Ждём onclose.
        if (
            ws.readyState !== WebSocket.CLOSING &&
            ws.readyState !== WebSocket.CLOSED
        ) {
            ws.close();
        }
    };

    ws.onclose = event => {
        console.warn("WebSocket closed", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
        });

        // Закрылся старый сокет, который уже был заменён новым.
        if (state.ws !== ws) {
            return;
        }

        state.ws = null;
        waitingForPong = false;
        lastPingAt = 0;

        // Переподключаемся только после фактического onclose.
        scheduleReconnect();
    };

    return ws;
}

export function reconnectSocket() {
    const ws = state.ws;

    // Включая CLOSING: ждём onclose старого сокета.
    if (socketIsBusy(ws)) {
        return;
    }

    if (ws?.readyState === WebSocket.CLOSED) {
        state.ws = null;
    }

    connectSocket(socketMessageHandler);
}

export function startSocketWatcher(onMessage) {
    socketMessageHandler = onMessage;

    // Не запускаем второй watcher и второй набор событий.
    if (socketIntervalId !== null) {
        return;
    }

    connectSocket(onMessage);

    socketIntervalId = window.setInterval(() => {
        const ws = state.ws;

        if (!ws || ws.readyState === WebSocket.CLOSED) {
            if (ws?.readyState === WebSocket.CLOSED) {
                state.ws = null;
            }

            scheduleReconnect();
            return;
        }

        if (
            ws.readyState === WebSocket.CONNECTING ||
            ws.readyState === WebSocket.CLOSING
        ) {
            return;
        }

        if (ws.readyState !== WebSocket.OPEN) {
            return;
        }

        if (waitingForPong) {
            const pongWaitingTime = Date.now() - lastPingAt;

            if (pongWaitingTime > SOCKET_PONG_TIMEOUT_MS) {
                console.warn("WebSocket pong timeout");

                // Новый сокет будет создан только после onclose.
                ws.close(4001, "Pong timeout");
            }

            return;
        }

        sendSocketPing(ws);
    }, SOCKET_CHECK_MS);

    window.addEventListener("online", () => {
        reconnectSocket();
    });

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            reconnectSocket();
        }
    });
}

export function stopSocketWatcher() {
    if (socketIntervalId !== null) {
        clearInterval(socketIntervalId);
        socketIntervalId = null;
    }

    if (reconnectTimeoutId !== null) {
        clearTimeout(reconnectTimeoutId);
        reconnectTimeoutId = null;
    }

    const ws = state.ws;
    state.ws = null;

    waitingForPong = false;
    lastPingAt = 0;

    if (
        ws &&
        ws.readyState !== WebSocket.CLOSED &&
        ws.readyState !== WebSocket.CLOSING
    ) {
        ws.close(1000, "Socket watcher stopped");
    }
}
