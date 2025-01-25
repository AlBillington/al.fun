import { gameState } from '../state.js';
import FilamentRoll from '../models/FilamentRoll.js';
import { updateManagementPane } from './management.js';
import { filaments } from '../definitions.js';
const toolbarContainer = document.getElementById('toolbar-container');
const toolbar = []; // Toolbar items

export function initializeToolbar() {
    toolbarContainer.innerHTML = '';
    toolbar.length = 0;

    const tools = [
        ...filaments.map(filament => ({ type: 'filament', data: filament }))
    ];

    tools.forEach(tool => {
        const toolElement = document.createElement('button');
        toolElement.className = 'toolbar-item';
        toolElement.textContent = `[$${tool.data.cost}] ${tool.data.color} Filament`;

        // Disable the button if the player can't afford the filament
        if (gameState.money < tool.data.cost) {
            toolElement.disabled = true;
        }

        toolElement.toolData = tool;

        toolElement.addEventListener('click', () => {
            const filamentPurchased = new FilamentRoll(
                tool.data.size,
                tool.data.color,
                tool.data.color,
                tool.data.material
            );
            gameState.filamentRolls.push(filamentPurchased);
            gameState.money -= tool.data.cost;
        
            updateManagementPane(gameState.selectedBay);
            initializeToolbar()
        });

        toolbar.push(toolElement);
        toolbarContainer.appendChild(toolElement);
    });
}
