import { gameState } from '../state.js';
import { startOrderGeneration, stopOrderGeneration } from './orders.js';
import { updatePrintBayGrid } from './grid.js';

/**
 * Updates the reputation bar based on the current reputation points.
 */
export function updateReputationBar() {
    const reputationBarContainer = document.getElementById('reputation-bar-container');
    reputationBarContainer.innerHTML = ''; // Clear any existing content

    const currentReputation = gameState.reputation;
    const level = calculateLevel(currentReputation);
    const levelStart = levelStartReputation(level);
    const levelEnd = levelStart + level * 100;
    const progress = (currentReputation - levelStart) / (levelEnd - levelStart);

    // Create the reputation bar
    const bar = document.createElement('div');
    bar.style.width = '100%';
    bar.style.height = '20px';
    bar.style.backgroundColor = '#ddd';
    bar.style.border = '1px solid #aaa';
    bar.style.position = 'relative';

    // Create the filled part of the bar
    const progressBar = document.createElement('div');
    progressBar.style.width = `${Math.min(progress * 100, 100)}%`;
    progressBar.style.height = '100%';
    progressBar.style.backgroundColor = '#4caf50';
    bar.appendChild(progressBar);

    // Add the level text
    const levelText = document.createElement('div');
    levelText.textContent = `Level ${level}`;
    levelText.style.position = 'absolute';
    levelText.style.left = '50%';
    levelText.style.top = '50%';
    levelText.style.transform = 'translate(-50%, -50%)';
    levelText.style.color = 'black';
    levelText.style.fontWeight = 'bold';
    bar.appendChild(levelText);

    reputationBarContainer.appendChild(bar);
}

/**
 * Calculates the current level based on reputation points.
 * @param {number} reputation - Current reputation points.
 * @returns {number} - The current level.
 */
function calculateLevel(reputation) {
    let level = 1;
    let requiredReputation = 100;

    while (reputation >= requiredReputation) {
        reputation -= requiredReputation;
        level++;
        requiredReputation = level * 100;
    }

    return level;
}

/**
 * Calculates the starting reputation points for a given level.
 * @param {number} level - The level.
 * @returns {number} - The starting reputation points for the level.
 */
function levelStartReputation(level) {
    let total = 0;
    for (let i = 1; i < level; i++) {
        total += i * 100;
    }
    return total;
}

const upgrades = [
    { 
        name: 'Upgrade Bench', 
        description: 'Unlock a new Printer slot',
        applyUpgrade: function() {
            gameState.bays++;
            updatePrintBayGrid();
            // Modify game state or trigger effects related to the upgrade
        }
    },
    { 
        name: 'Marketing', 
        description: 'Increases order volume by 25%',
        applyUpgrade: function() {
            gameState.orderSpeed *= 1.25;
            // Modify game state or trigger effects related to the upgrade
        }
    },
    { 
        name: 'Customer Service', 
        description: '25% More time to complete orders',
        applyUpgrade: function() {
            gameState.orderTime *= 1.25;
            // Modify game state or trigger effects related to the upgrade
        }
    }
];


function unlockFeature(level) {
    stopOrderGeneration(); // Stop generating new orders while the modal is open

    // Create the modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.left = '0';
    modalOverlay.style.top = '0';
    modalOverlay.style.width = '100%';
    modalOverlay.style.height = '100%';
    modalOverlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.justifyContent = 'center';
    modalOverlay.style.alignItems = 'center';
    modalOverlay.style.zIndex = '1000';

    // Create the modal container
    const modalContainer = document.createElement('div');
    modalContainer.style.width = '600px'; // Adjusted to accommodate three columns
    modalContainer.style.backgroundColor = '#fff';
    modalContainer.style.padding = '20px';
    modalContainer.style.borderRadius = '10px';
    modalContainer.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    modalOverlay.appendChild(modalContainer);

    // Add a title to the modal
    const title = document.createElement('h3');
    title.textContent = `Choose an Upgrade for Level ${level}`;
    modalContainer.appendChild(title);

    // Create a container for upgrades
    const upgradesContainer = document.createElement('div');
    upgradesContainer.style.display = 'flex';
    upgradesContainer.style.justifyContent = 'space-between'; // Distributes space between columns

    // Add options for each upgrade
    upgrades.forEach(upgrade => {
        const upgradeElement = document.createElement('div');
        upgradeElement.style.flex = '1'; // Each upgrade takes equal space
        upgradeElement.style.margin = '10px'; // Adds some space between columns

        const button = document.createElement('button');
        button.textContent = upgrade.name;
        button.onclick = () => {
            applyUpgrade(upgrade);
            document.body.removeChild(modalOverlay);
        };
        upgradeElement.appendChild(button);

        const description = document.createElement('p');
        description.textContent = upgrade.description;
        upgradeElement.appendChild(description);

        upgradesContainer.appendChild(upgradeElement); // Add the upgrade element to the container
    });

    modalContainer.appendChild(upgradesContainer); // Add the upgrades container to the modal

    // Append the modal to the body
    document.body.appendChild(modalOverlay);
}

/**
 * Applies the selected upgrade to the game state.
 * @param {object} upgrade - The selected upgrade.
 */
function applyUpgrade(upgrade) {
    console.log(`Upgrade applied: ${upgrade.name}`);
    upgrade.applyUpgrade();
    startOrderGeneration() 
    // Here you would update the gameState with the specific effects of the chosen upgrade
}

export function addReputation(reputation) {
    const currentLevel = calculateLevel(gameState.reputation);
    const newLevel = calculateLevel(gameState.reputation + reputation);
    if (newLevel > currentLevel) {
        unlockFeature(newLevel);
    }
    gameState.reputation += reputation;
    updateReputationBar();
}

// Remaining functions (updateReputationBar, calculateLevel, levelStartReputation) remain unchanged.
