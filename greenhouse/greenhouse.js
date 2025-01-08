const gridSize = 4;
const grid = [];
const toolbar = [];
let money = 5; // Start with $5
let selectedTool = 1; // Track the selected tool
let selectedSoil = null; // Track the selected soil type

let purchasedTools = ['cursor', 'normalSoil', 'tomatoSeed']; // Start with Tomato Seeds only


const gameContainer = document.getElementById('game-container');
const toolbarContainer = document.getElementById('toolbar-container');
const moneyDisplay = document.getElementById('money-display');

class Fruit {
    constructor(name, growTime, price, color) {
        this.name = name;
        this.growTime = growTime;
        this.price = price;
        this.color = color;
    }
}

class Tool {
    constructor(name, icon, price, type, unlockPrice) {
        this.name = name;
        this.icon = icon;
        this.price = price;
        this.type = type; // 'seed' or 'soil'
        this.unlockPrice = unlockPrice;
    }
}

class SoilType {
    constructor(name, color, multiplier) {
        this.name = name;
        this.color = color;
        this.multiplier = multiplier;
    }
}

const fruits = {
    tomato: new Fruit('Tomato', 10, 1, 'red'),
    cucumber: new Fruit('Cucumber', 18, 2, 'darkgreen')
};

const tools = {
    cursor: new Tool('Cursor', '🤌', 0, 'cursor', 0),
    tomatoSeed: new Tool('Tomato Seed', '🍅', .25, 'seed', 0),
    cucumberSeed: new Tool('Cucumber Seed', '🥒', .40, 'seed', 30),
    normalSoil: new Tool('Normal Soil', '🟫', 1, 'soil', 20),
    fertileSoil: new Tool('Fertile Soil', '🟤', 3, 'soil', 100)
};

const soilTypes = {
    empty: new SoilType('Empty', 'white', 0),
    normal: new SoilType('Normal', 'sandybrown', 1),
    fertile: new SoilType('Fertile', 'saddlebrown', 2)
};

function showAlert(message) {
    const banner = document.getElementById('alert-banner');
    banner.textContent = message; // Set the message
    banner.style.display = 'block'; // Show the banner

    // Hide banner after 3 seconds
    setTimeout(() => {
        banner.style.display = 'none';
    }, 3000);
}


class Plot {
    constructor(potType = 'empty') {
        this.state = 'dirt'; // 'dirt', 'seed', 'sprout', 'grown', 'fruit', 'overripe'
        this.timer = 0;
        this.fruit = null;
        this.potType = potType;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 80;
        this.canvas.height = 80;
        this.canvas.style.backgroundColor = soilTypes[this.potType].color;
        this.canvas.style.border = '1px solid black';
    }

    grow() {
        if (this.fruit) {
            this.timer++;
            const growthStage = Math.floor((this.timer / this.fruit.growTime));
            if (growthStage >= 9) {
                this.state = 'overripe';
            } else if (growthStage === 4) {
                this.state = 'fruit';
            } else if (growthStage === 3) {
                this.state = 'grown';
            } else if (growthStage === 2) {
                this.state = 'sprout';
            } else if (growthStage === 1) {
                this.state = 'seed';
            }
        }
        this.updateAppearance();
    }

    reset() {
        this.state = 'dirt';
        this.timer = 0;
        this.fruit = null;
        this.updateAppearance();
    }
 

    drawPlant() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        const growthFactor = Math.min(this.timer / (this.fruit?.growTime * 4), 1);
    
        // Dimensions based on canvas size
        const centerX = this.canvas.width / 2;
        const baseY = this.canvas.height * 0.9;
        const maxStemHeight = this.canvas.height - 25;
        const stemHeight = Math.min(this.canvas.height * 0.8 * growthFactor, maxStemHeight);
    
        // Draw stem based on growth factor
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, baseY);
        ctx.lineTo(centerX, baseY - stemHeight);
        ctx.stroke();
    
        // Generate leaf properties once, separately for left and right
        if (!this.leaves) {
            this.leaves = [];
            const leafCount = 8; // Fixed maximum number of leaves
            for (let i = 0; i < leafCount; i++) {
                this.leaves.push({
                    y: Math.random() * 0.9 + 0.1, // Position near the top of the stem (60-80%)
                    leftSize: Math.random() * 6 + 4, // Left leaf size
                    rightSize: Math.random() * 6 + 4, // Right leaf size
                    leftAngle: Math.random() * 0.6, // Slight upward angle for left leaves
                    rightAngle: Math.random() * -0.6, // Slight upward angle for right leaves
                    growthStart: 0 // Track when growth starts
                });
            }
        }
    
        // Draw leaves based on pre-generated properties
        this.leaves.forEach((leaf, index) => {
            const delayFactor = 0; // Delay the leaf growth
            const leafY = baseY - maxStemHeight * leaf.y;
    
            // Only draw leaves if the stem has grown 2px above their position
            if (stemHeight > (baseY - leafY) + 2) {
                if (leaf.growthStart === 0) {
                    leaf.growthStart = growthFactor; // Record when leaf starts growing
                }
                const leafGrowth = Math.max(0, Math.min(1, (growthFactor - leaf.growthStart) * 2)); // Grow leaves gradually
    
                // Left leaf
                ctx.save();
                ctx.translate(centerX, leafY);
                ctx.rotate(leaf.leftAngle);
                ctx.beginPath();
                ctx.ellipse(-leaf.leftSize * leafGrowth, 0, leaf.leftSize * leafGrowth, (leaf.leftSize / 2) * leafGrowth, 0, 0, Math.PI * 2);
                ctx.fillStyle = 'green';
                ctx.fill();
                ctx.restore();
    
                // Right leaf
                ctx.save();
                ctx.translate(centerX, leafY);
                ctx.rotate(leaf.rightAngle);
                ctx.beginPath();
                ctx.ellipse(leaf.rightSize * leafGrowth, 0, leaf.rightSize * leafGrowth, (leaf.rightSize / 2) * leafGrowth, 0, 0, Math.PI * 2);
                ctx.fillStyle = 'green';
                ctx.fill();
                ctx.restore();
            }
        });
    
        // Draw fruit based on state
        if (this.state === 'fruit') {
            ctx.fillStyle = this.fruit.color;
            ctx.beginPath();
            ctx.arc(centerX, baseY - stemHeight, 6 * soilTypes[this.potType].multiplier, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.state === 'overripe') {
            ctx.fillStyle = 'brown';
            ctx.beginPath();
            ctx.arc(centerX, baseY - stemHeight, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    

    updateAppearance() {
        this.drawPlant();
        this.canvas.style.backgroundColor = soilTypes[this.potType].color;
    }
}

function initializeGrid() {
    for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            const potType = 'empty';
            const plot = new Plot(potType);

            plot.updateAppearance();

            plot.canvas.addEventListener('click', () => {
                if (plot.state === 'fruit' || plot.state === 'overripe') {
                    if (plot.state === 'fruit') {
                        money += plot.fruit.price * soilTypes[plot.potType].multiplier;
                    }
                    plot.reset();
                } 
                if (selectedTool && money >= selectedTool.price) {
                    if (selectedTool.type === 'soil' && plot.potType === 'empty') {
                        plot.potType = selectedTool.name === 'Normal Soil' ? 'normal' : 'fertile';
                        plot.updateAppearance();
                        money -= selectedTool.price;
                    } else if (selectedTool.type === 'seed' && plot.state === 'dirt') {
                        if (plot.potType === 'empty') {
                            showAlert('You need to add soil first!');
                            return;
                        }
                        plot.state = 'seed';
                        plot.fruit = fruits[selectedTool.name.toLowerCase().split(' ')[0]];
                        plot.updateAppearance();
                        money -= selectedTool.price;
                    } else if (selectedTool.type === 'soil'){
                        const soilType = selectedTool.name.toLowerCase().split(' ')[0];
                        if (plot.potType !== soilType) {
                            plot.potType = selectedTool.name.toLowerCase().split(' ')[0];
                    
                            plot.updateAppearance();
                            money -= selectedTool.price;
                        }
                    }
                }
                moneyDisplay.textContent = `$${Math.round(money * 100) / 100}`; // Round to 2 decimal places
            });

            grid[i][j] = plot;
            gameContainer.appendChild(plot.canvas);
        }
    }
}

// Toolbar - Shows Purchased Tools
function initializeToolbar() {
    toolbarContainer.innerHTML = ''; // Clear toolbar
    toolbar.length = 0; // Reset toolbar array

    function highlightSelected(index) {
        toolbar.forEach((item, i) => {
            item.style.border = i === index ? '2px solid blue' : '1px solid black';
        });
    }

    purchasedTools.forEach((toolKey, index) => {
        const tool = tools[toolKey];
        const toolElement = document.createElement('div');
        toolElement.classList.add('toolbar-item');

        // add a tooltip with the name
        toolElement.title = tool.name;

        if (tool.price > 0) {
        toolElement.textContent = `${tool.icon}$${tool.price}`;
        } else {
            toolElement.textContent = `${tool.icon}`;
        }
        if (tool.type === 'seed') {
            toolElement.style.backgroundColor = 'lightgreen';
        } else if (tool.type === 'soil') {
            toolElement.style.backgroundColor = 'saddlebrown';
        } else {
            toolElement.style.backgroundColor = 'white'; // Default to white
        }                
        toolElement.addEventListener('click', () => {
            selectedTool = tool;
            highlightSelected(index);
        });
        toolbar.push(toolElement);
        toolbarContainer.appendChild(toolElement);
    });
}

// Store implementation
let storeOpen = false;
let growInterval; // Track the growth interval

function toggleStore() {
    storeOpen = !storeOpen;
    const storePanel = document.getElementById('store-panel');
    const gameContainer = document.getElementById('game-container');

    if (storeOpen) {
        storePanel.style.display = 'block';
        gameContainer.style.display = 'none';
        clearInterval(growInterval); // Pause growth
    } else {
        storePanel.style.display = 'none';
        gameContainer.style.display = 'grid';
        startGrowth(); // Resume growth
    }
}


function initializeStore() {
    const storePanel = document.createElement('div');
    storePanel.id = 'store-panel';
    storePanel.style.display = 'none';
    storePanel.style.position = 'absolute';
    storePanel.style.width = '100%';
    storePanel.style.height = '100%';
    storePanel.style.backgroundColor = 'lightgray';
    storePanel.style.zIndex = '10';

    Object.keys(tools).forEach(toolKey => {
        const tool = tools[toolKey];
        if (tool.unlockPrice === 0) return;
        const button = document.createElement('button');
        button.textContent = `${tool.icon} - $${tool.price}`;
        button.title = tool.name;
        
        button.onclick = () => {
            if (money >= tool.unlockPrice && !purchasedTools.includes(toolKey)) {
                money -= tool.unlockPrice;
                purchasedTools.push(toolKey);
                moneyDisplay.textContent = `$${money.toFixed(2)}`;
                initializeToolbar(); // Refresh toolbar
            }
        };
        storePanel.appendChild(button);
    });

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.onclick = toggleStore;
    storePanel.appendChild(closeButton);

    document.body.appendChild(storePanel);
}


// Store Logic
function toggleStore() {
    const storePanel = document.getElementById('store-panel');
    const gameContainer = document.getElementById('game-container');

    storePanel.style.display = storePanel.style.display === 'flex' ? 'none' : 'flex';
    gameContainer.style.display = storePanel.style.display === 'flex' ? 'none' : 'grid';

    if (storePanel.style.display === 'flex') {
        clearInterval(growInterval); // Pause growth
        updateStore();
    } else {
        startGrowth(); // Resume growth
    }
}

function updateStore() {
    const storeGrid = document.getElementById('store-grid');
    storeGrid.innerHTML = '';

    Object.keys(tools).forEach(toolKey => {
        if (toolKey === 'cursor') return; // Skip the cursor tool
        const tool = tools[toolKey];
        const isBought = purchasedTools.includes(toolKey);
        const canAfford = money >= tool.unlockPrice;

        const item = document.createElement('div');
        item.classList.add('store-item');

        if (isBought || !canAfford) {
            item.classList.add('disabled');
            if (isBought) {
                item.style.backgroundColor = 'lightgreen';
            }
        }


        item.onclick = () => {
            if (!isBought && canAfford) {
                money -= tool.unlockPrice;
                purchasedTools.push(toolKey);
                document.getElementById('money-display').textContent = `$${money.toFixed(2)}`;
                initializeToolbar();
                updateStore();
            }
        };

        item.innerHTML = `
        <div style="font-size: 24px;">${tool.icon}</div>
        <div style="font-size: 14px;">$${tool.unlockPrice}</div>
        <div style="font-size: 12px;">${tool.name}</div>
        <div style="font-size: 12px;">${isBought ? 'Bought' : ''}</div>
    `;
            storeGrid.appendChild(item);
    });
}


// Start growth function
function startGrowth() {
    growInterval = setInterval(() => {
        grid.forEach(row => row.forEach(plot => plot.grow()));
    }, 50);
}





// Initialize
initializeStore();
initializeGrid();
initializeToolbar();
startGrowth(); // Start growth initially
