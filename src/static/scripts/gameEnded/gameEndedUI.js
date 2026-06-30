import { state } from "../state.js";

export function showGameEndedUI() {
    const assetsMenu = document.getElementById("assets");
    const obligationsMenu = document.getElementById("obligations");
    const messagesMenu = document.getElementById("messenger");
    const financesMenu = document.getElementById("finances");
    const managmentMenu = document.getElementById("managment");
    assetsMenu.classList.add("hidden");
    obligationsMenu.classList.add("hidden");
    messagesMenu.classList.add("hidden");
    financesMenu.classList.add("hidden");
    managmentMenu.classList.add("hidden");

    const gameEndedOverlay = document.getElementById("gameEndedOverlay");

    const playerPointsDict = {};

    for (const player of Object.values(state.players)) {
        const personalBalance = Object.values(state.balances).find(balance =>
            balance.type === "personal" && balance.ownerId === player.id
        );

        if (!personalBalance) continue;

        let money = Number(personalBalance.money) || 0;
        let propertiesNumber = 0;
        let companiesNumber = 0;
        let propertyPoints = 0;

        for (const property of Object.values(state.properties)) {
            if (property.ownerId !== personalBalance.id) continue;

            const level = Number(property.level);

            propertyPoints += 200 * level;

            if (level === 1)
                propertiesNumber += 1;

            if (level === 2)
                companiesNumber += 1;
        }

        const influence = Number(player.influence) || 0;

        const playerPoints = money + propertyPoints + influence * 100;

        playerPointsDict[player.id] = {
            playerId: player.id,
            name: player.name,
            points: playerPoints,
            money: money,
            influence: influence,
            propertiesNumber: propertiesNumber,
            companiesNumber: companiesNumber,
        };
    }

    gameEndedOverlay.replaceChildren();

    const title = document.createElement("h1");
    title.textContent = "Игра окончена! Итоговые очки:";
    gameEndedOverlay.appendChild(title);

    const sortedPlayers = Object.entries(playerPointsDict)
        .sort((a, b) => b[1].points - a[1].points);

    const resultsList = document.createElement("div");
    resultsList.classList.add("gameEndedResults");

    for (const [playerId, stats] of sortedPlayers) {
        const row = document.createElement("div");
        row.classList.add("gameEndedRow");

        row.textContent =
            `${stats.name} • ` +
            `Очки: ${stats.points} • ` +
            `Деньги: ${stats.money} • ` +
            `Очки влияния: ${stats.influence} • ` +
            `Владений в собственности: ${stats.propertiesNumber} • ` +
            `Компаний в собственности: ${stats.companiesNumber}`;

        resultsList.appendChild(row);
    }

    gameEndedOverlay.appendChild(resultsList);
    gameEndedOverlay.classList.remove("hidden");
}
