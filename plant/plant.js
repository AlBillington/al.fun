let globalResources = { water: 20, energy: 20 };

let globalWaterRate = 0;
let globalEnergyRate = 0;

let divisionRequirement = 2

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 10;
        this.waterRate = 0;
        this.energyRate = 0;
        this.water = 0;
        this.energy = 0;
    }

    can_divide() {  
        return this.water >= divisionRequirement && this.energy >= divisionRequirement;
    }

    update() {
        this.water += globalWaterRate;
        this.energy += globalEnergyRate;
    }

    draw(ctx, color) {
        const size = this.size;
        const px = canvas.width / 2 + this.x * size * 1.5;
        const py = canvas.height * (2 / 3) - this.y * size * Math.sqrt(3);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = px + Math.cos(angle) * size;
            const y = py + Math.sin(angle) * size;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.stroke();
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
}

class RootCell extends Cell {
    constructor(x, y) {
        super(x, y);
        this.color = 'brown';
    }

    update(environment) {
        super.update();
        const surfaceArea = this.calculateSurfaceArea(environment);
        if (this.y < environment.groundLevel) {
            this.waterRate = surfaceArea;
        }
        if (super.can_divide()) {
            const newCell = new RootCell(this.x, this.y - 1);
            if (environment.canPlaceCell(newCell)) {
                environment.addCell(newCell);
                this.water -= divisionRequirement;
                this.energy -= divisionRequirement;
            }
        }
    }
}

class StemCell extends Cell {
    constructor(x, y) {
        super(x, y);
        this.color = 'lightgreen';
        this.waterRate = 0;
        this.energyRate = .5;
    }

    update(environment) {
        super.update();
        if (super.can_divide()) {
            const directions = ['N', 'NE', 'NW'];
            const offsets = {
                'N': [0, 1],
                'NE': [1, 1],
                'NW': [-1, 1]
            };
            for (const dir of directions) {
                const [dx, dy] = offsets[dir];
                const newCell = new StemCell(this.x + dx, this.y + dy);
                if (environment.canPlaceCell(newCell)) {
                    environment.addCell(newCell);
                    this.water -= divisionRequirement;
                    this.energy -= divisionRequirement;
                    break;
                }
            }
            // Grow root below only if at ground level
            if (this.y === environment.groundLevel) {
                const rootCell = new RootCell(this.x, this.y - 1);
                if (environment.canPlaceCell(rootCell)) {
                    environment.addCell(rootCell);
                }
            }
        }
    }
}

class LeafCell extends Cell {
    constructor(x, y) {
        super(x, y);
        this.color = 'green';
        this.waterRate = 0;
        this.energyRate = 1;
    }

    update(environment) {
        super.update();
        if (super.can_divide()) {
            const directions = ['N', 'NE', 'NW'];
            const offsets = {
                'N': [0, -1],
                'NE': [1, -1],
                'NW': [-1, -1]
            };
            for (const dir of directions) {
                const [dx, dy] = offsets[dir];
                const newCell = new LeafCell(this.x + dx, this.y + dy);
                if (environment.canPlaceCell(newCell)) {
                    environment.addCell(newCell);
                    this.water -= divisionRequirement;
                    this.energy -= divisionRequirement;
                    break;
                }
            }
        }
    }
}

class Environment {
    constructor(groundLevel) {
        this.cells = [];
        this.groundLevel = groundLevel;
        this.waterRate = 0;
        this.energyRate = 0;
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
        ctx.fillStyle = 'lightbrown';
        ctx.fillRect(0, canvas.height * (2 / 3), canvas.width, canvas.height / 3);

        for (const cell of this.cells) {
            cell.draw(ctx, cell.color);
        }
    }
}

const env = new Environment(0);
const stem = new StemCell(0, 0);
env.addCell(stem);
const root = new RootCell(0, -1);
env.addCell(root);

const canvas = document.getElementById('plantCanvas');
const ctx = canvas.getContext('2d');

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    env.update();
    env.draw(ctx);   
    document.getElementById('water-rate').textContent = Math.round(globalWaterRate * 10) / 10;
    document.getElementById('energy-rate').textContent = Math.round(globalEnergyRate * 10) / 10;
    setTimeout(gameLoop, 1000); // Ensure only one execution per second
}


gameLoop();
