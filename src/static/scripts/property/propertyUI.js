import { state } from "../state.js";
import { giveProperty, upgradeProperty } from "./property.js";

export function addPropertyToAssets(property) {
    const propertyDiv = document.getElementById("property");
    const propertySpan = document.createElement("span");
    propertySpan.id = `property${property.id}Assets`;
    propertySpan.textContent = `Владение ${property.tileNumber} Уровень ${property.level} Доходность ${property.income}`;
    propertyDiv.appendChild(propertySpan);
}

export function addPropertyToManagment(property) {
    let propertyOwnerName;
    if (state.balances[property.ownerId].type === "gov")
        propertyOwnerName = "Государство";
    else if (state.balances[property.ownerId].type === "personal")
        propertyOwnerName = state.players[state.balances[property.ownerId].ownerId].name;

    const propertyDiv = document.getElementById("companyRegister");
    const propertySpan = document.createElement("span");

    propertySpan.id = `property${property.id}Managment`;
    propertySpan.textContent = `Владение ${property.tileNumber} Уровень ${property.level} Доходность ${property.income} Владелец ${propertyOwnerName}`;

    const ownerSelector = document.createElement("select");
    ownerSelector.id = `property${property.id}OwnerSelector`;
    for (const balance of Object.values(state.balances)) {
        let ownerName;
        if (balance.type === "gov")
            ownerName = "Государство";
        else if (balance.type === "personal")
            ownerName = state.players[balance.ownerId].name;
        else
            continue;
        const option = document.createElement("option");
        option.id = `property${property.id}Owner${balance.id}Option`;
        option.value = balance.id;
        option.textContent = ownerName;
        ownerSelector.appendChild(option);
    }

    const givePropertyButton = document.createElement("button");
    givePropertyButton.id = `giveProperty${property.id}Button`;
    givePropertyButton.textContent = "Передать собственность";
    givePropertyButton.onclick = () => giveProperty(property.id);

    const upgradePropertyButton = document.createElement("button");
    upgradePropertyButton.id = `upgradeProperty${property.id}Button`;
    upgradePropertyButton.textContent = "Улучшить собственность";
    upgradePropertyButton.onclick = () => upgradeProperty(property.id);

    propertyDiv.appendChild(propertySpan);
    propertyDiv.appendChild(ownerSelector);
    propertyDiv.appendChild(givePropertyButton);
    propertyDiv.appendChild(upgradePropertyButton);
}
