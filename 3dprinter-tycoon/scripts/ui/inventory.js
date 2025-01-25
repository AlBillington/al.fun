import { gameState } from '../state.js';
import { updateManagementPane } from './management.js';
import { colorCodes } from '../definitions.js';

export function updateInventoryPane() {
    const inventoryList = document.getElementById('inventory-list');
    inventoryList.innerHTML = '';

    // Filament Rolls Section
    const filamentSection = document.createElement('div');
    filamentSection.style.marginBottom = '20px';

    const filamentHeader = document.createElement('h4');
    filamentHeader.textContent = 'Filament Rolls';
    filamentSection.appendChild(filamentHeader);

    gameState.filamentRolls.forEach(filament => {
        const canvas = document.createElement('canvas');
        canvas.width = 38;
        canvas.height = 38;
        canvas.style.marginBottom = '10px';
        const ctx = canvas.getContext('2d');

        // Use the draw method from FilamentRoll to render on the canvas
        filament.draw(ctx);

        // Add click event to load filament into selected printer
        canvas.addEventListener('click', () => {
            const selectedBay = gameState.selectedBay;
            if (selectedBay?.printer && !selectedBay.printer.filamentRoll) {
                selectedBay.printer.filamentRoll = filament;
                gameState.filamentRolls = gameState.filamentRolls.filter(f => f !== filament); // Remove from inventory
                updateInventoryPane(selectedBay); // Refresh inventory pane
                updateManagementPane(selectedBay); // Update the management pane
            } else if (!selectedBay?.printer) {
                alert('No printer selected.');
            } else if (selectedBay.printer.filamentRoll) {
                alert('Printer already has a filament roll.');
            }
        });

        filamentSection.appendChild(canvas);
    });

    inventoryList.appendChild(filamentSection);

// Parts Inventory Section
const partsSection = document.createElement('div');
const partsHeader = document.createElement('h4');
partsHeader.textContent = 'Parts Inventory';
partsSection.appendChild(partsHeader);

// Organize inventory by part name
const partsByName = {};
gameState.inventory.forEach(item => {
    if (!partsByName[item.name]) {
        partsByName[item.name] = [];
    }
    partsByName[item.name].push(item);
});

Object.keys(partsByName).forEach(partName => {
    const partNameHeader = document.createElement('h5');
    partNameHeader.textContent = partName;
    partNameHeader.style.marginTop = '10px';
    partNameHeader.style.marginBottom = '5px';
    partsSection.appendChild(partNameHeader);

    // Row for color blocks
    const colorRow = document.createElement('div');
    colorRow.style.display = 'flex';
    colorRow.style.marginBottom = '10px';

    partsByName[partName].forEach(part => {
        const canvas = document.createElement('canvas');
        canvas.width = 60; // Adjusted size for display
        canvas.height = 60;
        canvas.style.marginRight = '10px';

        const ctx = canvas.getContext('2d');

        // Use the draw method from Part to render on the canvas
        if (part.partObject?.draw) {
            ctx.translate(30, 30); // Move to the center of the part square
            part.partObject.draw(ctx);
            ctx.translate(-30, -30); // Reset the translation
        } else {
            console.error('Part object does not have a draw method:', part);
        }

        // Add the quantity as a number inside the part
        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(part.quantity, 19, 24);

        // Append canvas to the color row
        colorRow.appendChild(canvas);
    });

    partsSection.appendChild(colorRow);
});

inventoryList.appendChild(partsSection);
}
