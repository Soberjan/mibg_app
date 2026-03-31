import { state } from "../state.js";

export function load_game_page() {
    const assetsButton = document.getElementById("assets_button");
    const messagesButton = document.getElementById("messages_button");
    const obligationsButton = document.getElementById("obligations_button");
    const finances_button = document.getElementById("finances_button");
    const managment_button = document.getElementById("managment_button");

    const assetsMenu = document.getElementById("assets");
    const obligationsMenu = document.getElementById("obligations");
    const messagesMenu = document.getElementById("messages");
    const financesMenu = document.getElementById("finances");
    const managmentMenu = document.getElementById("managment");
    obligationsMenu.classList.add("hidden");
    messagesMenu.classList.add("hidden");
    financesMenu.classList.add("hidden");
    managmentMenu.classList.add("hidden");

    if (state.players[state.local_player_id].role === "politician")
        managment_button.classList.remove("hidden");
    if (state.players[state.local_player_id].role === "banker")
        finances_button.classList.remove("hidden");
    if (state.players[state.local_player_id].role === "worker" || state.players[state.local_player_id].role === "jobless")
        obligations_button.classList.remove("hidden");

    function open_menu(menuToShow) {
        assetsMenu.classList.add("hidden");
        messagesMenu.classList.add("hidden");
        obligationsMenu.classList.add("hidden");
        financesMenu.classList.add("hidden");
        managmentMenu.classList.add("hidden");

        menuToShow.classList.remove("hidden");
    }

    assetsButton.onclick = function () {
        open_menu(assetsMenu);
    };

    obligationsButton.onclick = function () {
        open_menu(obligationsMenu);
    };

    messagesButton.onclick = function () {
        open_menu(messagesMenu);
    };
    finances_button.onclick = function () {
        open_menu(financesMenu);
    };
    managment_button.onclick = function () {
        open_menu(managmentMenu);
    };
}
