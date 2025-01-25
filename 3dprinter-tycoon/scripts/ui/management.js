import Part from '../models/Part.js';
import { models } from '../definitions.js';
import Printer from '../models/Printer.js';
import { printers } from '../definitions.js';
import { gameState } from '../state.js';

export function updateManagementPane(printBay) {
    const managementContent = document.getElementById('management-content');
    managementContent.innerHTML = '';

    if (printBay?.printer) {
        const hasPart = printBay.printer.part !== null; // Check if printer has a part
        const isPartComplete = hasPart && printBay.printer.part.percentComplete >= 100; // Check if part is complete
        const isPrinting = printBay.printer.isPrinting; // Check if the printer is currently printing

        const startButtonText = !printBay?.printer?.filamentRoll
            ? 'Cannot start - Load Filament'
            : 'Start Model';

        managementContent.innerHTML = `
            <p><strong>Printer:</strong> ${printBay.printer.name}</p>
            <p><strong>Filament:</strong> ${
                printBay.printer.filamentRoll
                    ? `${printBay.printer.filamentRoll.color}`
                    : 'None'
            }</p>
            <label for="part-listbox">Available Models:</label>
            <select id="part-listbox" size="5" style="width: 100%; margin-bottom: 10px;">
                ${models
                    .map(
                        model =>
                            `<option value="${model.name}">${model.name}</option>`
                    )
                    .join('')}
            </select>
            <button id="start-part-btn" ${
                hasPart || !printBay?.printer?.filamentRoll || isPrinting
                    ? 'disabled'
                    : ''
            }>${startButtonText}</button>
            <button id="stop-print-btn" ${
                !hasPart || isPartComplete ? 'disabled' : ''
            }>Stop Print</button>
            <button id="resume-print-btn" ${
                !printBay?.printer?.isPrinting && hasPart ? '' : 'disabled'
            }>Resume Print</button>
            <button id="clear-bed-btn" ${
                !printBay?.printer?.isPrinting && hasPart ? '' : 'disabled'
            }>Clear Bed</button>
        `;

        const listbox = document.getElementById('part-listbox');

        // Add event listener for double-click on the listbox to start a print
        listbox.addEventListener('dblclick', () => {
            const modelName = listbox.value;
            const selectedModel = models.find(model => model.name === modelName);

            if (selectedModel && printBay.printer.filamentRoll && !isPrinting) {
                printBay.printer.part = new Part(
                    selectedModel,
                    printBay.printer.filamentRoll.color
                );
                printBay.printer.startPrint();
                updateManagementPane(printBay); // Update the pane to reflect changes
            } else if (!printBay.printer.filamentRoll) {
                console.error('No filament loaded.');
            } else if (isPrinting) {
                console.error('Cannot start a new part while a print is running.');
            }
        });

        // Event listeners for buttons
        document.getElementById('start-part-btn').addEventListener('click', () => {
            const modelName = listbox.value;
            const selectedModel = models.find(model => model.name === modelName);

            if (selectedModel && printBay.printer.filamentRoll && !isPrinting) {
                printBay.printer.part = new Part(
                    selectedModel,
                    printBay.printer.filamentRoll.color
                );
                printBay.printer.startPrint();
                updateManagementPane(printBay); // Update the pane to reflect changes
            } else if (!printBay.printer.filamentRoll) {
                console.error('No filament loaded.');
            } else if (isPrinting) {
                console.error('Cannot start a new part while a print is running.');
            }
        });

        document.getElementById('stop-print-btn').addEventListener('click', () => {
            printBay.printer.stopPrint();
            updateManagementPane(printBay); // Update the pane to reflect changes
        });

        document.getElementById('clear-bed-btn').addEventListener('click', () => {
            printBay.printer.clearBed();
            printBay.currentLayer = 0;
            updateManagementPane(printBay); // Update the pane to reflect changes
        });

        document.getElementById('resume-print-btn').addEventListener('click', () => {
            printBay.printer.resumePrint();
            updateManagementPane(printBay); // Update the pane to reflect changes
        });
    } else {
        // No printer available, show available printers to purchase
        managementContent.innerHTML = '<p>No printer available. Select a printer to purchase:</p>';
        const printerSelect = document.createElement('select');
        printers.forEach(printer => {
            const option = document.createElement('option');
            option.value = printer.name;
            option.textContent = `[$${printer.cost}] ${printer.name}`;
            printerSelect.appendChild(option);
        });
        const buyButton = document.createElement('button');
        buyButton.textContent = 'Buy Printer';

        // Initially disable the button if the first selected printer is unaffordable
        const selectedPrinter = printers.find(p => p.name === printerSelect.value);
        buyButton.disabled = gameState.money < selectedPrinter.cost;

        printerSelect.addEventListener('change', () => {
            // Check funds when the selected printer changes
            const selectedPrinter = printers.find(p => p.name === printerSelect.value);
            buyButton.disabled = gameState.money < selectedPrinter.cost;
        });

        buyButton.addEventListener('click', () => {
            if (gameState.money >= selectedPrinter.cost) {
                printBay.printer = new Printer(
                    selectedPrinter.name,
                    selectedPrinter.maxSize,
                    selectedPrinter.speed,
                    selectedPrinter.cost
                );
                gameState.money -= selectedPrinter.cost;
                updateManagementPane(printBay); // Refresh the management pane with the new printer
            } else {
                console.error('Not enough money or printer not found.');
            }
        });

        managementContent.appendChild(printerSelect);
        managementContent.appendChild(buyButton);
    }
}
