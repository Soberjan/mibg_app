import { state } from "../state.js";

export async function chooseBankerUI() {
    console.log("entered choosing banker UI");
    console.log(state);
    const chooseBankerOverlay = document.getElementById("chooseBankerOverlay");
    const bankerTextSpan = document.getElementById("bankerChoosingText");
    const bankerOptionsSelect = document.getElementById("bankerOptions");
    const chooseBankerButton = document.getElementById("chooseBankerButton");

    if (chooseBankerOverlay.classList.contains("hidden"))
        chooseBankerOverlay.classList.remove("hidden");
    
    if (state.players[state.localPlayerId].role != 'politician') {
        console.log("not a politician");
        bankerTextSpan.textContent = "Дождитесь, пока политик выберет банкира";
        bankerOptionsSelect.classList.add("hidden");
        chooseBankerButton.classList.add("hidden");
        return;
    }
    bankerTextSpan.innerHTML = "Выберите банкира";
    bankerOptionsSelect.classList.remove("hidden");
    chooseBankerButton.classList.remove("hidden");

    bankerOptionsSelect.options.length = 0;

    for (const player of Object.values(state.players)) {
        if (player.id === state.localPlayerId)
            continue;
        const option = document.createElement("option");
        option.value = player.id;
        option.textContent = player.name;

        bankerOptionsSelect.appendChild(option);
    }

    chooseBankerButton.textContent = "Выбрать банкира";
}
