import Model from './Model.js';
import { colorCodes } from '../definitions.js';

class Part {
    /**
     * @param {Model} model - The model object for the part.
     * @param {string} color - The color of the finished part.
     * @param {number} value - The monetary value of the part.
     */
    constructor(model, color) {
        if (!(model instanceof Model)) {
            throw new Error('model must be an instance of Model');
        }

        this.model = model; // The Model object associated with this Part
        this.color = color; // Color of the finished part
        this.colorCode = colorCodes[color]; // Color code for the finished part
        this.size = model.size; // Size comes from the Model
        this.width = model.width; // Width comes from the Model
        this.value = model.value; // Value (money earned upon completion)
        this.profile = model.profile; // Profile of the part
        this.currentMass = 0; // Current mass of the part being printed
        this.layerHeight = 2; // Height of each printed layer
    }

    /**
     * @returns {number} - The percentage of the part that is complete.
     */
    get percentComplete() {
        return (this.currentMass / this.size) * 100;
    }

    draw(ctx) {
        // Display the part being printed
        if (this?.model) {

            // Draw the part square being built
            const squareLeft = 0
            const squareTop = 0

            let currentLayer = Math.floor(this.size * this.percentComplete / 100);

            ctx.fillStyle = colorCodes[this.color];
            for (let i = 0; i < currentLayer; i++) {
                var width = this.width
                if (i < this.profile?.length) {
                    width = this.profile[i]
                }   
                ctx.fillRect(
                    squareLeft - width,
                    squareTop - i * this.layerHeight,
                    width * 2,
                    this.layerHeight
                );
            }
        }
    }
}

export default Part;
