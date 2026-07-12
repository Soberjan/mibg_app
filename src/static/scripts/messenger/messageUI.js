import { state } from "../state.js";
import { markChatAsRead } from "./notification.js";

export function initChatSelector() {
    const chatSelect = document.getElementById("chatSelect");

    //  state.messages[0] = {to: -1, from: -2, text: 'some text', sentAt: new Date('2026-06-19T10:00:00')};
    // state.messages[1] = {to: -1, from: -2, text: 'some text', sentAt: new Date('2026-06-19T10:01:00')};
    // state.messages[2] = {to: -1, from: -2, text: 'some text', sentAt: new Date('2026-06-19T10:02:00')};
    // state.messages[3] = {to: -1, from: -2, text: 'some text', sentAt: new Date('2026-06-19T10:03:00')};
    // state.messages[4] = {to: -1, from: -3, text: 'some text', sentAt: new Date('2026-06-19T10:04:00')};
    // state.messages[5] = {to: -1, from: -3, text: 'some text', sentAt: new Date('2026-06-19T10:05:00')};
    // state.messages[6] = {to: -1, from: -3, text: 'some text', sentAt: new Date('2026-06-19T10:06:00')};
    // state.messages[7] = {to: -1, from: -3, text: 'some text', sentAt: new Date('2026-06-19T10:07:00')};

    for (const player of Object.values(state.players)) {
        if (player.id === state.localPlayerId)
            continue;
        const option = document.createElement("option");
        option.id = `player${player.id}ChatOption`;
        option.value = player.id;
        option.textContent = player.name;

        chatSelect.appendChild(option);
    }

    chatSelect.addEventListener("change", () => {
        const playerId = Number(chatSelect.value);

        openChat(playerId);
    });
}

export function openChat(playerId) {
    console.log("opened chat niger");
    state.chatterId = playerId;
    console.log(playerId);
    const chatCanvas = document.getElementById("chatCanvas");
    chatCanvas.replaceChildren();
    console.log(state.messages);
    const messages = Object.values(state.messages)
        .filter(msg =>
            (msg.sentTo === playerId && msg.sentFrom === state.localPlayerId) ||
            (msg.sentFrom === playerId && msg.sentTo === state.localPlayerId)
        )
        .sort((a, b) => a.sentAt - b.sentAt);
    console.log(messages);

    for (const msg of messages)
        addMessage(msg);

    markChatAsRead(playerId);
}

export function addMessage(msg) {
    const chatCanvas = document.getElementById("chatCanvas");

    const message = document.createElement("div");
    message.classList.add("message");

    if (msg.sentFrom === state.localPlayerId) {
        message.classList.add("messageOutgoing"); // наше сообщение
    } else {
        message.classList.add("messageIncoming"); // сообщение собеседника
    }

    const messageText = document.createElement("div");
    messageText.classList.add("messageText");
    messageText.textContent = msg.text;

    const messageTime = document.createElement("div");
    messageTime.classList.add("messageTime");

    const sentAt = new Date(msg.sentAt);

    messageTime.textContent =
        sentAt.getHours().toString().padStart(2, "0") +
        ":" +
        sentAt.getMinutes().toString().padStart(2, "0");

    message.appendChild(messageText);
    message.appendChild(messageTime);

    chatCanvas.appendChild(message);
    chatCanvas.scrollTop = chatCanvas.scrollHeight;
}

export function updateMessageCounter() {
    const currentLength = messageInput.value.length;
    const maxLength = messageInput.maxLength;

    messageCounter.textContent = `${currentLength}/${maxLength}`;
}

export function addMessageCount() {
    const messageInput = document.getElementById("messageInput");
    const messageCounter = document.getElementById("messageCounter");


    messageInput.addEventListener("input", updateMessageCounter);

    updateMessageCounter();
}
