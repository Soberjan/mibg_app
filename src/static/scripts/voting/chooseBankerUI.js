import { chooseBankerAndStartGame } from "./chooseBankerAndStartGame.js";
import { state } from "../state.js";

export async function chooseBankerUI() {
    const chooseBankerOverlay = document.getElementById("chooseBankerOverlay");
    if (chooseBankerOverlay.classList.contains("hidden")) {
        chooseBankerOverlay.classList.remove("hidden");
    }

    const bankerTextSpan = document.createElement("span");
    bankerTextSpan.id = `bankerChoosingText`;
    
    console.log(state.players[state.localPlayerId].role);
    if (state.players[state.localPlayerId].role != 'politician') {
        bankerTextSpan.textContent = "Дождитесь, пока политик выберет банкира";
        chooseBankerOverlay.appendChild(bankerTextSpan);
        return;
    }
    bankerTextSpan.innerHTML = "Выберите банкира";

    const bankerOptionsSelect = document.createElement("select");
    bankerOptionsSelect.id = "banker_options";
    for (const player of Object.values(state.players)) {
        if (player.id === state.localPlayerId)
            continue;
        const option = document.createElement("option");
        option.value = player.id;
        option.textContent = player.name;

        bankerOptionsSelect.appendChild(option);
    }


    const chooseBankerButton = document.createElement("button");
    chooseBankerButton.id = `choose_banker_button`;
    chooseBankerButton.textContent = "Выбрать банкира";
    chooseBankerButton.onclick = chooseBankerAndStartGame;

    chooseBankerOverlay.appendChild(bankerTextSpan);
    chooseBankerOverlay.appendChild(bankerOptionsSelect);
    chooseBankerOverlay.appendChild(chooseBankerButton);
}
