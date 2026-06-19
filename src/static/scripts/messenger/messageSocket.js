import { state } from "../state.js";
import { addMessage } from "./messageUI.js";

export function messageSentSocket(res) {
    if (res.msg.sent_to != state.localPlayerId && res.msg.sent_from != state.localPlayerId)
        return;

    let msg = {id: res.msg.id, sentFrom: res.msg.sent_from, sentTo: res.msg.sent_to, sentAt: res.msg.sent_at, text: res.msg.text};
    console.log(msg);
    state.messages[msg.id] = msg;
    if (msg.sentTo === state.chatterId || msg.sentFrom === state.chatterId)
        addMessage(msg);
}
