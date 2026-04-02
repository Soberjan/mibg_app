export function addVotingOption(player) {
    const container = document.getElementById("votingOptions");

    const option = document.createElement("option");
    option.value = player.id;
    option.textContent = player.name;

    container.appendChild(option);
}
