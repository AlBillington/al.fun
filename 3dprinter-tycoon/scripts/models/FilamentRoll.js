import { colorCodes } from '../definitions.js';

class FilamentRoll {
    constructor(size, color, material, cost = 20) {
        this.size = size; // Size of the filament roll
        this.cost = cost
        this.color = color; // Name of the color
       // this.colorCode = colorCodes[color]; // Color of the filament
        this.material = material; // Material type (e.g., PLA, ABS)
        this.currentMass = 1000 * size; // Current mass of the filament being used
    }

    get percentLeft() {
        return this.currentMass / this.size / 10;
    }

    isEmpty() {
        return this.size <= 0;
    }

    draw(ctx, showStrand = false) {
        // Draw black circle as the outer boundary
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1; // Set the thickness of the outline
        ctx.beginPath();
        ctx.arc(17, 17, 15, 0, Math.PI * 2);
        ctx.stroke();

    
        // Fill based on filament's percentLeft property
        const percentLeft = this.percentLeft / 100; // Convert to 0-1 range

        ctx.fillStyle = colorCodes[this.color];
        ctx.beginPath();
        ctx.moveTo(17, 17);

        // get a radius based on the volume of filament left (percentLeft)
        if (percentLeft > 0) {
            var rad = 9 * ( percentLeft) + 6

            ctx.fillStyle = colorCodes[this.color];
            ctx.arc(17, 17, rad, 0, Math.PI * 2);
            ctx.fill();
        }

        // Cut out the inner circle to create the transparent area
        ctx.globalCompositeOperation = 'destination-out'; // Switch to cut-out mode
        ctx.beginPath();
        ctx.arc(17, 17, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over'; // Reset to normal drawing mode
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1; // Set the thickness of the outline
        ctx.stroke();
        
        if (showStrand) {
            // draw a line tangent to the colored edge going down 20 px
            ctx.beginPath();
            ctx.strokeStyle = colorCodes[this.color];;
            ctx.lineWidth = 1; // Set the thickness of the outline
            ctx.moveTo(16 + rad, 15);
            ctx.lineTo(16 + rad, 45);
            ctx.stroke();
            }
    

        // Display filament material and size
        // ctx.font = '12px Arial';
        // ctx.fillStyle = 'black';
        // ctx.fillText(`${this.material} (${this.percentLeft.toFixed(0)}%)`, 10, 40);
    }
}

export default FilamentRoll;
