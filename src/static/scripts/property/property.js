import { state } from "../state.js";
import { addPropertyToAssets, fillOwnerSelector } from "./propertyUI.js";
import { balanceOwnerName } from "../transactions/balance.js";

export async function giveProperty() {
    const ownerSelector = document.getElementById("selectedPropertyOwnerSelector");
    const newOwnerId = ownerSelector.value;

    const propertyId = document.getElementById("giveSelectedPropertyButton").dataset.propertyId;

    const ownerId = ownerSelector.value;
    if (state.properties[propertyId].ownerId === ownerId) {
        console.log("Уже является владельцем");
        return;
    }

    var response = await fetch(
        `/lobby/${state.lobbyId}/give_property?player_id=${state.localPlayerId}&new_owner_id=${ownerId}&property_id=${propertyId}`,
        {
            method: "POST"
        }
    );
}

export async function upgradeProperty() {
    const propertyId = document.getElementById("giveSelectedPropertyButton").dataset.propertyId;
    var response = await fetch(
        `/lobby/${state.lobbyId}/upgrade_property?player_id=${state.localPlayerId}&property_id=${propertyId}`,
        {
            method: "POST"
        }
    );
}

export function givePropertySocket(msg) {
    state.properties[msg.property.id].ownerId = msg.property.ownerId;
    let propertyOwnerName = balanceOwnerName(msg.property.ownerId);
    if (state.personalBalanceId === msg.oldOwnerId) {
        console.log("removing property");

        const propertyDiv = document.getElementById("property");
        const propertySpan = document.getElementById(`property${msg.property.id}Assets`);
        propertyDiv.removeChild(propertySpan);
        return
    }

    if (state.players[state.localPlayerId].role === "politician") {
        const selectedPropertyId = document.getElementById("giveSelectedPropertyButton").dataset.propertyId;
        if (Number(selectedPropertyId) === Number(msg.property.id)) {
            document.getElementById("selectedPropertyOwner").textContent = balanceOwnerName(state.balances[msg.property.ownerId]);
            fillOwnerSelector();
        }
    }

    if (msg.property.ownerId === state.personalBalanceId) {
        addPropertyToAssets(msg.property);
    }
}

export function upgradePropertySocket(msg) {
    state.properties[msg.property.id] = msg.property;
    let propertyOwnerName = balanceOwnerName(msg.property.ownerId);

    if (state.players[state.localPlayerId].role === "politician") {
        const propertySpan = document.getElementById(`property${msg.property.id}Managment`);

        const selectedPropertyId = document.getElementById("giveSelectedPropertyButton").dataset.propertyId;
        if (Number(selectedPropertyId) === Number(msg.property.id)) {
            document.getElementById("selectedPropertyPrice").textContent = msg.property.price;
            document.getElementById("selectedPropertyLevel").textContent = msg.property.level;
            document.getElementById("selectedPropertyIncome").textContent = msg.property.income;
        }
    }
    if (msg.property.ownerId === state.personalBalanceId) {
        const propertySpan = document.getElementById(`property${msg.property.id}Assets`);
        propertySpan.textContent = `Владение ${msg.property.tileNumber} · Уровень ${msg.property.level} · Доходность ${msg.property.income}`;
    }
}
