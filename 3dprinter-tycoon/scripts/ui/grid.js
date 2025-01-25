import PrintBay from '../models/PrintBay.js';
import { gameState } from '../state.js';
import Printer from '../models/Printer.js';
import FilamentRoll from '../models/FilamentRoll.js';
import { updateManagementPane } from './management.js';

const printBayGrid = [];
const gameContainer = document.getElementById('game-container');

export function initializePrintBayGrid() {
    updatePrintBayGrid();
    if (printBayGrid.length > 0) {
        printBayGrid[0].printer = new Printer('Ender 3', 10, 1, 400);
        printBayGrid[0].printer.filamentRoll = new FilamentRoll(1, 'Red', 'PLA');
    }
}

export function updatePrintBayGrid() {
    // Clear previous bays if any
    while (printBayGrid.length > gameState.bays) {
        const removedBay = printBayGrid.pop();
        gameContainer.removeChild(removedBay.canvas);
    }

    // Update existing bays or add new ones as needed
    for (let i = 0; i < gameState.bays; i++) {
        if (i >= printBayGrid.length) {
            const printBay = new PrintBay();
            printBayGrid.push(printBay);
            gameContainer.appendChild(printBay.canvas);
            printBay.canvas.addEventListener('click', () => {
                selectBay(printBay);
            });
        }
    }
}

function selectBay(printBay) {
    printBayGrid.forEach(bay => (bay.canvas.style.border = bay === printBay ? '2px solid blue' : '1px solid black'));
    updateManagementPane(printBay);
    gameState.selectedBay = printBay;
}

export function updatePrintBays() {
    printBayGrid.forEach(printBay => printBay.updateAppearance());
}
