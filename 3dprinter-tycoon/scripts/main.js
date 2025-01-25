import { initializePrintBayGrid, updatePrintBays } from './ui/grid.js';
import { initializeToolbar } from './ui/toolbar.js';
import { updateHeader } from './utils/helpers.js';
import { updateInventoryPane } from './ui/inventory.js';
import { startOrderGeneration, checkAllOrders} from './ui/orders.js';
import { updateReputationBar } from './ui/reputationBar.js';

// Update all print bays periodically
function startPrintBayUpdates() {
    setInterval(() => {
        updatePrintBays();
    }, 50);
}

// Update all print bays periodically
function startOtherUiUpdates() {
    setInterval(() => {
        updateInventoryPane()
        updateHeader() 
        checkAllOrders()
        updateReputationBar();
    }, 500);
}


function initializeGame() {
    initializePrintBayGrid();
    initializeToolbar();
    updateHeader();
    startPrintBayUpdates();
    startOtherUiUpdates();
    startOrderGeneration(); // Start generating orders
}

window.onload = initializeGame;
