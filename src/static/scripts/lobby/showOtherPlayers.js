import { state } from "../state.js";
import { hideMenu } from "./hideMenu.js";

export function showOtherPlayers() {
    hideMenu();
    const otherPlayersOverlay = document.getElementById("otherPlayersOverlay");
    otherPlayersOverlay.classList.remove("hidden");
}

export function hideOtherPlayers() {
    const otherPlayersOverlay = document.getElementById("otherPlayersOverlay");
    otherPlayersOverlay.classList.add("hidden");

    const assetsMenu = document.getElementById("assets");
    assetsMenu.classList.remove("hidden");
}
