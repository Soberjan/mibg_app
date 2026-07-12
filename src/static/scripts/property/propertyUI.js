import { state } from "../state.js";
import { giveProperty, upgradeProperty } from "./property.js";
import { balanceOwnerName } from "../transactions/balance.js";

function getProperties() {
    return Object.values(state.properties ?? {})
        .sort((a, b) => a.tileNumber - b.tileNumber);
}

function fillCompanySelector() {
    const selector = document.getElementById("companyRegisterSelector");

    selector.replaceChildren();

    for (const property of getProperties()) {
        const option = document.createElement("option");

        option.value = property.id;
        option.textContent = `Владение ${property.tileNumber}`;

        selector.appendChild(option);
    }
}

export function fillOwnerSelector() {
    const selector = document.getElementById("selectedPropertyOwnerSelector");

    selector.replaceChildren();
    const selectedPropertyId = document.getElementById("giveSelectedPropertyButton").dataset.propertyId;
    const selectedProperty = state.properties[selectedPropertyId];

    for (const balance of Object.values(state.balances)) {
        if (balance.type === "bank" || balance.id === selectedProperty.ownerId)
            continue;

        const option = document.createElement("option");

        option.value = balance.id;
        option.textContent = balanceOwnerName(balance);

        selector.appendChild(option);
    }
}

function updateCompanyRegister(propertyId) {
    const property = state.properties[propertyId];

    if (!property)
        return;

    document.getElementById("selectedPropertyPrice").textContent = property.price;
    document.getElementById("selectedPropertyLevel").textContent = property.level;
    document.getElementById("selectedPropertyIncome").textContent = property.income;
    document.getElementById("selectedPropertyOwner").textContent = balanceOwnerName(state.balances[property.ownerId]);
    document.getElementById("selectedPropertyTile").textContent = property.tileNumber;

    const companySelector = document.getElementById("companyRegisterSelector");
    const ownerSelector = document.getElementById("selectedPropertyOwnerSelector");

    companySelector.value = property.id;
    ownerSelector.value = property.ownerId;

    document.getElementById("giveSelectedPropertyButton").dataset.propertyId = property.id;
    document.getElementById("upgradeSelectedPropertyButton").dataset.propertyId = property.id;

    fillOwnerSelector();
}

export function setupCompanyRegister() {
    const companySelector = document.getElementById("companyRegisterSelector");
    const giveButton = document.getElementById("giveSelectedPropertyButton");
    const upgradeButton = document.getElementById("upgradeSelectedPropertyButton");

    if (!companySelector || !giveButton || !upgradeButton)
        return;

    fillCompanySelector();

    companySelector.addEventListener("change", () => {
        updateCompanyRegister(companySelector.value);
    });

    giveButton.addEventListener("click", giveProperty);
    upgradeButton.addEventListener("click", upgradeProperty);

    const firstProperty = getProperties()[0];

    if (firstProperty)
        updateCompanyRegister(firstProperty.id);
}

export function addPropertyToAssets(property) {
    const propertyDiv = document.getElementById("property");
    const propertySpan = document.createElement("span");
    propertySpan.id = `property${property.id}Assets`;
    propertySpan.textContent = `Владение ${property.tileNumber} · Уровень ${property.level} · Доходность ${property.income}`;
    propertySpan.classList.add("propertyAssetCard");
    propertyDiv.appendChild(propertySpan);
}
