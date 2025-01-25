import Part from './Part.js';

class Printer {
    constructor(name, maxSize, speed, cost) {
        this.name = name; // Name of the printer
        this.maxSize = maxSize; // Maximum part size the printer can handle
        this.speed = speed; // Printing speed (mass per second)
        this.filamentRoll = null; // Assigned filament roll
        this.part = null; // Assigned part to print
        this.isPrinting = false; // Indicates if the printer is actively printing
        this.printInterval = null; // Interval ID for the printing process
        this.lastPart = null; // Last part printed
        this.cost = cost; // Cost of the printer
    }

    /**
     * Starts the printing process.
     */
    startPrint() {
        if (!this.filamentRoll || !this.part) {
            console.warn('Cannot start printing: Missing filament roll or part.');
            return;
        }

        if (this.part.currentMass >= this.part.size) {
            console.warn('The part is already complete.');
            return;
        }

        this.isPrinting = true;

        this.printInterval = setInterval(() => {
            const massToAdd = this.speed; // Mass added per second
            const availableFilament = this.filamentRoll.currentMass; // Available filament

            if (availableFilament <= 0 || this.part.currentMass >= this.part.size) {
                this.stopPrint(); // Stop printing if filament runs out or part is complete
                return;
            }

            const actualMassToAdd = Math.min(massToAdd, availableFilament, this.part.size - this.part.currentMass);

            // Update part mass and filament size
            this.part.currentMass += actualMassToAdd;
            this.filamentRoll.currentMass -= actualMassToAdd;

            if (this.part.currentMass >= this.part.size) {
                console.log(`Printing complete: ${this.part.model.name} is finished.`);
                this.stopPrint();
            }
        }, 100); // Update every second
    }

    /**
     * Stops the printing process.
     */
    stopPrint() {
        this.isPrinting = false;

        if (this.printInterval) {
            clearInterval(this.printInterval);
            this.printInterval = null;
        }

        console.log(`Stopped printing on ${this.name}.`);
    }

    resumePrint() {
        if (this.isPrinting) {
            console.warn('Cannot resume printing: Printer is already printing.');
            return;
        }

        this.startPrint();
    }

    clearBed() {
        this.lastPart = this.part;
        this.part = null;
    }

    reprintLastPart() {
        if (this.lastPart && this.filamentRoll) {
            this.part = new Part(this.lastPart.model, this.filamentRoll.color, this.lastPart.value);
            this.startPrint();
        }
    }
}

export default Printer;
