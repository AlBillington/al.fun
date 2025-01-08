const divisionRequirement = 5

let globalWaterRate = 0;
let globalEnergyRate = 0;

class NeuralNetwork {
    constructor(inputSize, hiddenSize, outputSize) {
        this.weights1 = new Array(hiddenSize).fill(0).map(() => new Array(inputSize).fill().map(() => Math.random() * 2 - 1));
        this.weights2 = new Array(outputSize).fill(0).map(() => new Array(hiddenSize).fill().map(() => Math.random() * 2 - 1));
    }

    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    feedForward(inputs) {
        let hidden = this.weights1.map(row => row.reduce((sum, w, i) => sum + w * inputs[i], 0));
        hidden = hidden.map(this.sigmoid);
        let output = this.weights2.map(row => row.reduce((sum, w, i) => sum + w * hidden[i], 0));
        return output.map(this.sigmoid);
    }

    mutate(rate = 0.1) {
        this.weights1 = this.weights1.map(row => row.map(w => Math.random() < rate ? w + Math.random() * 0.2 - 0.1 : w));
        this.weights2 = this.weights2.map(row => row.map(w => Math.random() < rate ? w + Math.random() * 0.2 - 0.1 : w));
    }

    copy() {
        const copy = new NeuralNetwork(this.weights1[0].length, this.weights1.length, this.weights2.length);
        copy.weights1 = this.weights1.map(row => [...row]);
        copy.weights2 = this.weights2.map(row => [...row]);
        return copy;
    }
}

class Cell {
    constructor(x, y, brain = null) {
        this.x = x;
        this.y = y;
        this.water = 0;
        this.energy = 0;
        this.size = 10;
        this.waterRate = 0.2;
        this.energyRate = 0.2;
        this.brain = brain || new NeuralNetwork(6, 6, 7);
    }

    can_divide() {  
        return this.water >= divisionRequirement && this.energy >= divisionRequirement;
    }

    calculateSurfaceArea(environment) {
        let exposedFaces = 6;
        const directions = ['N', 'NE', 'SE', 'S', 'SW', 'NW'];
        const offsets = {
            'N': [0, -1],
            'NE': [1, -1],
            'SE': [1, 0],
            'S': [0, 1],
            'SW': [-1, 1],
            'NW': [-1, 0]
        };

        for (const dir of directions) {
            const [dx, dy] = offsets[dir];
            const neighbor = { x: this.x + dx, y: this.y + dy };
            if (environment.isCellAt(neighbor)) {
                exposedFaces--;
            }
        }
        return exposedFaces / 6;
    }

    chooseAction(environment) {
        const inputs = [
            this.water,
            this.energy,
            this.calculateSurfaceArea(environment),
            this.y,
            environment.waterRate,
            environment.energyRate
        ];
        const outputs = this.brain.feedForward(inputs);

        const actions = ['divide', 'to_root', 'to_leaf', 'none'];
        const directions = ['N', 'NE', 'NW'];

        const actionIndex = outputs.slice(0, 4).indexOf(Math.max(...outputs.slice(0, 4)));
        const directionIndex = outputs.slice(4, 7).indexOf(Math.max(...outputs.slice(4, 7)));
        return { action: actions[actionIndex], direction: directions[directionIndex] };
    }

    to_root() {
        if (this.energyRate > 0) {
            this.waterRate = 1;
            this.energyRate = 0;
        }
    }

    to_leaf() {
        if (this.energyRate > 0) {
            this.waterRate = 0 ;
            this.energyRate = 1;
        }
    }

    update(environment) {
        this.water += environment.waterRate * this.waterRate;
        this.energy += environment.energyRate * this.energyRate;
        const { action, direction } = this.chooseAction(environment);
        if (action === 'to_root') {
            this.to_root();
        } else if (action === 'to_leaf') {
            this.to_leaf();
        } else if (action === 'divide') {
            const offsets = { 'N': [0, -1], 'NE': [1, -1], 'NW': [-1, -1] };
            const [dx, dy] = offsets[direction];
            const newCell = new Cell(this.x + dx, this.y + dy, this.brain);
            if (environment.canPlaceCell(newCell) && this.can_divide() ) {
                environment.addCell(newCell);
                this.water -= divisionRequirement;
                this.energy -= divisionRequirement;
            }
        }
    }
}

class Environment {
    constructor(groundLevel) {
        this.cells = [];
        this.groundLevel = groundLevel;
        this.waterRate = 1;
        this.energyRate = 1;
    }

    addCell(cell) {
        this.cells.push(cell);
    }

    canPlaceCell(cell) {
        return !this.isCellAt(cell);
    }

    isCellAt(cell) {
        return this.cells.some(c => c.x === cell.x && c.y === cell.y);
    }

    update() {
        const cellCount = this.cells.length;
        for (const cell of this.cells) {
            cell.update(this);
            globalWaterRate += cell.waterRate;
            globalEnergyRate += cell.energyRate;
        }
        globalWaterRate = globalWaterRate / cellCount;
        globalEnergyRate = globalEnergyRate / cellCount;
    }

    draw(ctx) {
        for (const cell of this.cells) {
            const size = cell.size;
            const px = canvas.width / 2 + cell.x * size * 1.5;
            const py = canvas.height / 2 - cell.y * size * Math.sqrt(3);
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                const x = px + Math.cos(angle) * size;
                const y = py + Math.sin(angle) * size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();

            // choose a colorbetween green and brown based on the water and energy rate
            const color = `rgb(${Math.floor(255 * cell.waterRate)}, ${Math.floor(255 * cell.energyRate)}, 0)`;
            ctx.fillStyle = color;
            ctx.fill();
            ctx.stroke();
        }
    }
}

const canvas = document.getElementById('plantCanvas');
const ctx = canvas.getContext('2d');

function runTrials(generations, variations, steps) {
    let bestBrain = null;
    let bestResult = 0;
    let bestEnv = null;

    for (let gen = 0; gen < generations; gen++) {
        let results = [];
        let brains = [];
        let envs = [];

        for (let i = 0; i < variations; i++) {
            const brain = bestBrain ? bestBrain.copy() : new NeuralNetwork(6, 6, 7);
            if (bestBrain) brain.mutate(0.1);
            const env = new Environment(0);
            const cell = new Cell(0, 0, brain);
            env.addCell(cell);
            for (let j = 0; j < steps; j++) {
                env.update();
            }
            results.push(env.cells.length);
            brains.push(brain);
            envs.push(env);
        }

        const bestIndex = results.indexOf(Math.max(...results));
        bestBrain = brains[bestIndex];
        bestResult = results[bestIndex];
        bestEnv = envs[bestIndex];

        console.log(`Generation ${gen + 1}: Best Result = ${bestResult}`);
        bestEnv.draw(ctx);

    }

}

runTrials(100, 20, 100);
