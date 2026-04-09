import { initPage } from "../lobbyMain.js";

async function chooseRole(role) {
    let response = await fetch(`/lobby/-1/is_free?role=${role}`, {method:"get"});
    let result = await response.json();

    if (!result.free) {
        console.log("Роль занята");
        return;
    }

    response = await fetch(`/lobby/-1/assign_client_key?role=${role}`, {method:"post"});
    result = await response.json();
    if (result.status != "ok")
        return;

    const testServerOverlay = document.getElementById("testServerOverlay");
    testServerOverlay.classList.add("hidden");
    await initPage();
}

export function chooseJobless() {
    chooseRole("jobless");
}
export function choosePolitician() {
    chooseRole("politician");
}
export function chooseBanker() {
    chooseRole("banker");
}
