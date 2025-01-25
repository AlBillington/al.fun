import { gameState } from '../state.js';
import { colorCodes } from '../definitions.js';

class PrintBay {
    constructor() {
        this.printer = null; // Slot for a Printer
        this.printRunning = false; // Indicates if the print animation is running

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');

        // Set the display size and internal resolution for a sharper canvas
        this.canvas.style.width = '120px';
        this.canvas.style.height = '150px';
        this.canvas.width = 240; // Double resolution for sharpness
        this.canvas.height = 300;

        this.canvas.style.backgroundColor = '#e0e0e0'; // Lighter bay background
        this.canvas.style.border = '1px solid black';

        this.printHeadPosition = 50; // X position of the print head (starts near the center)
        this.printDirection = 1; // 1 for right, -1 for left
        this.currentLayer = 0; // Current layer being printed
        this.layerHeight = 2; // Height of each printed layer
        this.printSpeed = 15; // Speed of extruder movement (higher is faster)

        this.printerBoxWidth = 80; // Width of the printer box
        this.printerBoxHeight = 90; // Height of the printer box
        this.printerBoxLeft = 20; // Left position of the printer box
        this.printerBoxTop = 50; // Top position of the printer box
        this.partPadding = 20; // Padding for the part inside the printer box

        // Add click event listener to handle adding completed parts to inventory
        this.canvas.addEventListener('click', () => {
            //if the click is on the filament roll circe at the top
            if (this.printer?.filamentRoll && !this.printer.isPrinting && Math.abs(60 - event.offsetX) < 25 && Math.abs(20 - event.offsetY) < 25) {
                if (this.printer.filamentRoll.currentMass > 0) {
                    gameState.filamentRolls.push(this.printer.filamentRoll);
                }
                this.printer.filamentRoll = null;
            }

            else if (this.printer && this.printer.part && this.printer.part.percentComplete >= 99) {
                this.addToInventory(this.printer.part);
                this.printer.clearBed();
                this.updateAppearance();
            } else if (this.printer && !this.printer.part) {
                // start a new print of the same part if it is idle
                this.printer.reprintLastPart();
            }
        });

        this.updateAppearance();
        this.startPrintingAnimation();
    }


    addToInventory(part) {
        const existingPart = gameState.inventory.find(
            item => item.name === part.model.name && item.color === part.color
        );
    
        if (existingPart) {
            existingPart.quantity += 1; // Increment quantity if part already exists
        } else {
            gameState.inventory.push({
                name: part.model.name,
                color: part.color,
                quantity: 1,
                partObject: part,
            });
        }
        this.currentLayer = 0; // Reset the current layer
    }

    startPrintingAnimation() {
        setInterval(() => {
            if (this.printer && this.printer.part) {
                const part = this.printer.part;

                if (this.currentLayer < this.printer.part.model.size && this.currentLayer < part.percentComplete / 100 * this.printer.part.model.size) {
                    // Move the print head
                    this.printHeadPosition += this.printDirection * this.printSpeed;

                    // Reverse direction at square boundaries
                    const leftBoundary = this.printerBoxLeft + this.partPadding;
                    const rightBoundary = leftBoundary + this.printer.part.width - 10;
                    if (this.printHeadPosition <= leftBoundary || this.printHeadPosition >= rightBoundary) {
                        this.printDirection *= -1;
                        this.currentLayer += 1; // Move to the next layer after completing a line
                    } 
                    // Update appearance
                    this.updateAppearance();
                } 
            }
        }, 50); // Update every 50ms for faster animation
    }

    updateAppearance() {
        const ctx = this.ctx;

        // Reset the transform to prevent cumulative scaling
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Scale the context to match the resolution
        ctx.scale(2, 2);

        // Clear the canvas at the logical size
        ctx.clearRect(0, 0, 120, 150);

        if (this.printer) {
            // Draw printer box with a darker background
            ctx.fillStyle = '#b0b0b0'; // Darker printer background
            ctx.fillRect(this.printerBoxLeft, this.printerBoxTop, this.printerBoxWidth, this.printerBoxHeight + 3);

            ctx.strokeStyle = '#6c757d';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.printerBoxLeft, this.printerBoxTop, this.printerBoxWidth, this.printerBoxHeight + 6);

            // Display the filament roll at the top
            if (this.printer.filamentRoll) {
                ctx.translate(45, 5); // Move to the center of the filament circle
                this.printer.filamentRoll.draw(ctx, true);
                ctx.translate(-45, -5); // Reset the translation
            } else {
                ctx.font = '12px Arial';
                ctx.fillStyle = 'black';
                ctx.fillText('No Filament', 25, 20);
            }

            // Display the printer name
            ctx.font = '14px Arial';
            ctx.fillStyle = 'black';
            ctx.fillText(this.printer.name, 30, 70);

            // Display the part being printed
            if (this.printer.part?.model) {
                // Draw the part square being built
                ctx.save();
                const squareLeft = this.printerBoxLeft + this.printerBoxWidth / 2;
                const squareTop = this.printerBoxTop + this.printerBoxHeight;
                ctx.translate(squareLeft, squareTop); // Move to the center of the part square
                this.printer.part.draw(ctx);
                ctx.restore();
                
                // Draw the moving print head and nozzle
                const nozzleY = squareTop - this.currentLayer * this.layerHeight;
                ctx.fillStyle = 'grey';

                // Print head
                ctx.fillRect(this.printHeadPosition - 10, nozzleY - 15, 20, 10); // Rectangular head
                ctx.strokeStyle = 'black';
                ctx.strokeRect(this.printHeadPosition - 10, nozzleY - 15, 20, 10); // Border

                // Nozzle
                ctx.beginPath();
                ctx.moveTo(this.printHeadPosition, nozzleY); // Nozzle tip
                ctx.lineTo(this.printHeadPosition - 5, nozzleY - 5); // Left corner
                ctx.lineTo(this.printHeadPosition + 5, nozzleY - 5); // Right corner
                ctx.closePath();
                ctx.fillStyle = 'black';
                ctx.fill();
            } else {
                // No part being printed
                ctx.font = '14px Arial';
                ctx.fillStyle = 'black';
                ctx.fillText('Idle', 35, 115);
            }
        } else {
            // Empty bay
            ctx.font = '14px Arial';
            ctx.fillStyle = 'black';
            ctx.fillText('Empty Bay', 30, 75);
        }
    }
}

export default PrintBay;
