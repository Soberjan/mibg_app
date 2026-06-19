import { state } from "../state.js";

export function initChatSelector() {
    const chatSelector = document.getElementById("chatSelector");

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

        const chatSelectorButton = document.createElement("button");
        chatSelectorButton.id = `player${player.id}ChatSelector`;
        chatSelectorButton.textContent = `${player.name}`;
        chatSelectorButton.onclick = () => openChat(player.id);;
        chatSelector.appendChild(chatSelectorButton);
    }
}

export function openChat(playerId) {
    state.chatterId = playerId;
    const chatCanvas = document.getElementById("chatCanvas");
    chatCanvas.replaceChildren();
     const messages = Object.values(state.messages)
        .filter(msg =>
            (msg.sentTo === playerId && msg.sentFrom === state.localPlayerId) ||
            (msg.sentFrom === playerId && msg.sentTo === state.localPlayerId)
        )
        .sort((a, b) => a.sentAt - b.sentAt);

    for (const msg of messages)
        addMessage(msg);
}

export function addMessage(msg) {
    const chatCanvas = document.getElementById("chatCanvas");
    const msgDiv = document.createElement('div');
    msgDiv.classList.add("message");

    if (msg.sentFrom === state.localPlayerId) {
        msgDiv.classList.add('messageOutgoing'); // наше сообщение
    } else {
        msgDiv.classList.add('messageIncoming'); // сообщение собеседника
    }

    const textDiv = document.createElement('div');
    textDiv.classList.add('messageText');
    textDiv.textContent = msg.text;

    const timeDiv = document.createElement('div');
    timeDiv.classList.add('messageTime');

    const sentAt = new Date(msg.sentAt);

    timeDiv.textContent =
        sentAt.getHours().toString().padStart(2, '0') +
        ':' +
        sentAt.getMinutes().toString().padStart(2, '0');

    msgDiv.appendChild(textDiv);
    msgDiv.appendChild(timeDiv);

    chatCanvas.appendChild(msgDiv);
    chatCanvas.scrollTop = chatCanvas.scrollHeight;
}
