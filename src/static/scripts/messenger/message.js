import { state } from "../state.js";
import { updateMessageCounter } from "../messenger/messageUI.js";

export async function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const text = messageInput.value;

    messageInput.value = "";
    updateMessageCounter();

    if (text.length > 100) {
        console.log("слишком длинное сообщение");
        return;
    }

    var response = await fetch(
        `/lobby/${state.lobbyId}/send_message?sent_from=${state.localPlayerId}&sent_to=${state.chatterId}&text=${text}`,
        {
            method: "POST"
        }
    );

    var res = await response.json();
}
