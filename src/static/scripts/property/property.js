import { state } from "../state.js";
import { addPropertyToAssets } from "./propertyUI.js";

export async function giveProperty(propertyId) {
    const ownerSelector = document.getElementById(`property${propertyId}OwnerSelector`);

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

export async function upgradeProperty(propertyId) {
    var response = await fetch(
        `/lobby/${state.lobbyId}/upgrade_property?player_id=${state.localPlayerId}&property_id=${propertyId}`,
        {
            method: "POST"
        }
    );
}

export function givePropertySocket(msg) {
    state.properties[msg.property.id].ownerId = msg.property.ownerId;
    let propertyOwnerName;
    if (state.balances[msg.property.ownerId].type === "gov")
        propertyOwnerName = "Государство";
    else if (state.balances[msg.property.ownerId].type === "personal")
        propertyOwnerName = state.players[state.balances[msg.property.ownerId].ownerId].name;
    if (state.personalBalanceId === msg.oldOwnerId) {
        console.log("removing property");
        const propertyDiv = document.getElementById("property");
        const propertySpan = document.getElementById(`property${msg.property.id}Assets`);
        propertyDiv.removeChild(propertySpan);
        return
    }
    if (state.players[state.localPlayerId].role === "politician") {
        const propertySpan = document.getElementById(`property${msg.property.id}Managment`);
        propertySpan.textContent = `Владение ${msg.property.tileNumber} Уровень ${msg.property.level} Доходность ${msg.property.income} Владелец ${propertyOwnerName}`;
    }

    if (msg.property.ownerId === state.personalBalanceId) {
        addPropertyToAssets(msg.property);
    }
}

export function upgradePropertySocket(msg) {
    state.properties[msg.property.id] = msg.property;
    let propertyOwnerName;
    if (state.balances[msg.property.ownerId].type === "gov")
        propertyOwnerName = "Государство";
    else if (state.balances[msg.property.ownerId].type === "personal")
        propertyOwnerName = state.players[state.balances[msg.property.ownerId].ownerId].name;
    if (state.players[state.localPlayerId].role === "politician") {
        const propertySpan = document.getElementById(`property${msg.property.id}Managment`);
        propertySpan.textContent = `Владение ${msg.property.tileNumber} Уровень ${msg.property.level} Доходность ${msg.property.income} Владелец ${propertyOwnerName}`;
    }
    if (msg.property.ownerId === state.personalBalanceId) {
        const propertySpan = document.getElementById(`property${msg.property.id}Assets`);
        propertySpan.textContent = `Владение ${msg.property.tileNumber} Уровень ${msg.property.level} Доходность ${msg.property.income}`;
    }
}
