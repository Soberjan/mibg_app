export function addVotingOption(player) {
    const container = document.getElementById("votingOptions");

    const option = document.createElement("option");
    option.id = `player${player.id}VotingOption`;
    option.value = player.id;
    option.textContent = player.name;

    container.appendChild(option);
}
