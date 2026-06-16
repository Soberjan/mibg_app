import { state } from "../state.js";
import { addLuxuryAsset } from "./luxuryUI.js";
import { updateInfluence } from "../influence/updateInfluence.js";

export async function buyLuxury() {
    const luxurySelector = document.getElementById("luxurySelector");

    const luxuryId = luxurySelector.value;
    if (state.luxuries[luxuryId].price > state.balances[state.personalBalanceId].money) {
        console.log("Не хватает денег на покупку роскоши");
        return;
    }

    var response = await fetch(
        `/lobby/${state.lobbyId}/buy_luxury?buyer_id=${state.personalBalanceId}&luxury_id=${luxuryId}`,
        {
            method: "POST"
        }
    );
    var res = await response.json();

    if (res.status === "ok") {
        addLuxuryAsset(luxuryId);
        updateInfluence(state.luxuries[luxuryId].influence);
    }
}
