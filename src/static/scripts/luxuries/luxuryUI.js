import { state } from "../state.js";

export function addLuxuryAsset(luxuryId) {
    const luxuryList = document.getElementById("luxuryList");
    const luxury = state.luxuries[luxuryId];
    const luxurySpan = document.createElement("div");
    // подумать, как сделать добавление нескольких одинаковых роскошей
    luxurySpan.id = `luxury${luxuryId}`;
    luxurySpan.textContent = luxury.name + " " + luxury.influence;

    luxuryList.appendChild(luxurySpan);
}

export function initLuxuryUI(playerLuxuryIds) {
    for (const luxuryId of playerLuxuryIds)
        addLuxuryAsset(luxuryId);

    const container = document.getElementById("luxurySelector");
    for (const luxury of Object.values(state.luxuries)) {
        const option = document.createElement("option");
        option.id = `luxury${luxury.id}Option`;
        option.value = luxury.id;
        option.textContent = luxury.name + " " + luxury.price + " " + luxury.influence;
        container.appendChild(option);
    }

}
