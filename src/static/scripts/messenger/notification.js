import { state } from "../state.js";

const messageNotificationSound = new Audio(
    "/static/audio/message-notification.wav"
);


function playMessageNotificationSound() {
    messageNotificationSound.currentTime = 0;

    messageNotificationSound.play().catch(error => {
        console.log("Не удалось проиграть звук уведомления:", error);
    });
}


function findChatOption(playerId) {
    const chatSelect = document.getElementById("chatSelect");

    for (const option of chatSelect.options) {
        if (Number(option.value) === Number(playerId))
            return option;
    }

    return null;
}


function updateMessagesNotification() {
    const chatSelect = document.getElementById("chatSelect");
    const messagesNotification = document.getElementById(
        "messagesNotification"
    );

    let hasUnreadMessages = false;

    for (const option of chatSelect.options) {
        if (option.textContent.endsWith(" !")) {
            hasUnreadMessages = true;
            break;
        }
    }

    if (hasUnreadMessages)
        messagesNotification.classList.remove("hidden");
    else
        messagesNotification.classList.add("hidden");
}


export function receiveNotification(msg) {
    /*
     * На собственные отправленные сообщения уведомление не создаём.
     */
    if (Number(msg.sentTo) !== Number(state.localPlayerId))
        return;

    const messenger = document.getElementById("messenger");

    const messengerIsOpen =
        !messenger.classList.contains("hidden");

    const senderChatIsOpen =
        Number(state.chatterId) === Number(msg.sentFrom);

    /*
     * Меню сообщений открыто и открыт чат с отправителем.
     */
    if (messengerIsOpen && senderChatIsOpen)
        return;

    const senderOption = findChatOption(msg.sentFrom);

    if (!senderOption)
        return;

    senderOption.textContent =
        `${state.players[msg.sentFrom].name} !`;

    document
        .getElementById("messagesNotification")
        .classList.remove("hidden");

    playMessageNotificationSound();
}


export function markChatAsRead(playerId) {
    const option = findChatOption(playerId);

    if (!option)
        return;

    option.textContent = state.players[playerId].name;

    updateMessagesNotification();
}
