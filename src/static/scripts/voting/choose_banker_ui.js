import { choose_banker_and_start_game } from "./choose_banker_and_start_game.js";
import { state } from "../state.js";

export async function choose_banker_ui() {
    const choose_banker_overlay = document.getElementById("choose_banker_overlay");
    if (choose_banker_overlay.classList.contains("hidden")) {
        choose_banker_overlay.classList.remove("hidden");
    }

    const banker_text_span = document.createElement("span");
    banker_text_span.id = `banker_choosing_text`;
    
    console.log(state.players[state.local_player_id].role);
    if (state.players[state.local_player_id].role != 'politician') {
        banker_text_span.textContent = "Дождитесь, пока политик выберет банкира";
        choose_banker_overlay.appendChild(banker_text_span);
        return;
    }
    banker_text_span.innerHTML = "Выберите банкира";

    const bankerOptionsSelect = document.createElement("select");
    bankerOptionsSelect.id = "banker_options";
    for (const player of Object.values(state.players)) {
        if (player.id === state.local_player_id)
            continue;
        const option = document.createElement("option");
        option.value = player.id;
        option.textContent = player.name;

        bankerOptionsSelect.appendChild(option);
    }


    const chooseBankerButton = document.createElement("button");
    chooseBankerButton.id = `choose_banker_button`;
    chooseBankerButton.textContent = "Выбрать банкира";
    chooseBankerButton.onclick = choose_banker_and_start_game;

    choose_banker_overlay.appendChild(banker_text_span);
    choose_banker_overlay.appendChild(bankerOptionsSelect);
    choose_banker_overlay.appendChild(chooseBankerButton);
}
