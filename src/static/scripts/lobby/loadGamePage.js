import { state } from "../state.js";

export function loadGamePage() {
    const assetsButton = document.getElementById("assetsButton");
    const messagesButton = document.getElementById("messagesButton");
    const obligationsButton = document.getElementById("obligationsButton");
    const financesButton = document.getElementById("financesButton");
    const managmentButton = document.getElementById("managmentButton");

    const assetsMenu = document.getElementById("assets");
    const obligationsMenu = document.getElementById("obligations");
    const messagesMenu = document.getElementById("messenger");
    const financesMenu = document.getElementById("finances");
    const managmentMenu = document.getElementById("managment");
    assetsMenu.classList.remove("hidden");
    obligationsMenu.classList.add("hidden");
    messagesMenu.classList.add("hidden");
    financesMenu.classList.add("hidden");
    managmentMenu.classList.add("hidden");

    obligationsButton.classList.add("hidden");
    financesButton.classList.add("hidden");
    managmentButton.classList.add("hidden");

    if (state.players[state.localPlayerId].role === "politician")
        managmentButton.classList.remove("hidden");
    if (state.players[state.localPlayerId].role === "banker")
        financesButton.classList.remove("hidden");
    if (state.players[state.localPlayerId].role === "marketer" || state.players[state.localPlayerId].role === "jobless" || state.players[state.localPlayerId].role === "worker")
        obligationsButton.classList.remove("hidden");

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
    financesButton.onclick = function () {
        open_menu(financesMenu);
    };
    managmentButton.onclick = function () {
        open_menu(managmentMenu);
    };
}
