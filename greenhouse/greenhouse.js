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
    constructor(name, icon, price, type, unlockPrice, backgroundColor = 'white') {
        this.name = name;
        this.icon = icon;
        this.price = price;
        this.type = type; // 'seed' or 'soil'
        this.unlockPrice = unlockPrice;
        this.backgroundColor = backgroundColor;
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
    cucumber: new Fruit('Cucumber', 18, 2, 'darkgreen'),
    onion: new Fruit('Onion', 30, 5, 'yellow'),
    pumpkin: new Fruit('Pumpkin', 40, 10, 'orange'),
};

const tools = {
    cursor: new Tool('Cursor', '👆', 0, 'cursor', 0),
    tomatoSeed: new Tool('Tomato Seed', '🍅', .25, 'seed', 0),
    cucumberSeed: new Tool('Cucumber Seed', '🥒', .40, 'seed', 30),
    onionSeed: new Tool('Onion Seed', '🧅', 1, 'seed', 70),
    pumpkinSeed: new Tool('Pumpkin Seed', '🎃', 3, 'seed', 200),
    normalSoil: new Tool('Normal Pot', '🟫', 1, 'soil', 20, 'sandybrown'),
    advancedSoil: new Tool('Advanced Pot', 'A', 3, 'soil', 100, 'saddlebrown'),
    superSoil: new Tool('Super Pot', 'S', 5, 'soil', 200, 'brown'),
    megaSoil: new Tool('Mega Pot', 'M', 10, 'soil', 500, 'black'),
};

const soilTypes = {
    empty: new SoilType('Empty', 'white', 0),
    normal: new SoilType('Normal', 'sandybrown', 1),
    advanced: new SoilType('Advanced', 'saddlebrown', 2),
    super: new SoilType('Super', 'brown', 3),
    mega: new SoilType('Mega', 'black', 5)
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

function showFloatingText(text, x, y) {
    const floatingText = document.createElement('div');
    floatingText.textContent = text;
    floatingText.classList.add('floating-text');
    document.body.appendChild(floatingText);

    // Position the text near the click location
    floatingText.style.left = `${x}px`;
    floatingText.style.top = `${y}px`;

    // Remove the text after animation
    setTimeout(() => {
        floatingText.remove();
    }, 1000); // Matches the animation duration
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
        this.leaves = null;
        this.fruitPositions = null;
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
        if (this.state === 'fruit' || this.state === 'overripe') {
            const radius = 6; // Fixed size for each fruit
            const color = this.state === 'fruit' ? this.fruit.color : 'brown'; // Color depends on state

            // Draw each fruit at its pre-generated position

            if (!this.fruitPositions) {
                // Generate positions once
                this.fruitPositions = [];
                const fruitCount = soilTypes[this.potType].multiplier; // Number of fruits based on pot type
                const jitter = 5; // Maximum random offset for bunching
                for (let i = 0; i < fruitCount; i++) {
                    this.fruitPositions.push({
                        offsetX: (Math.random() - 0.5) * jitter * 2,
                        offsetY: (Math.random() - 0.5) * jitter * 2
                    });
                }
            }

            this.fruitPositions.forEach(position => {
                const x = centerX + position.offsetX; // Apply pre-generated X offset
                const y = baseY - stemHeight + position.offsetY; // Apply pre-generated Y offset

                // Draw fruit border (near black)
                ctx.fillStyle = '#111'; // Near black border
                ctx.beginPath();
                ctx.arc(x, y, radius + 1, 0, Math.PI * 2); // Slightly larger radius for the border
                ctx.fill();

                // Draw fruit body
                ctx.fillStyle = color; // Main fruit color
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            });
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
                        earnings = plot.fruit.price * soilTypes[plot.potType].multiplier;
                        money += earnings;
                        // Show the floating text near the clicked fruit
                            const rect = plot.canvas.getBoundingClientRect();
                            showFloatingText(`+$${earnings.toFixed(0)}`, rect.left + rect.width / 2, rect.top);
                    }
                    plot.reset();
                } 
                if (selectedTool && money >= selectedTool.price) {
                    if (selectedTool.type === 'soil' && plot.potType === 'empty') {
                        plot.potType = selectedTool.name.toLowerCase().split(' ')[0];
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

    // Sort tools: Cursor first, then by type and price
    const sortedTools = purchasedTools
        .map(toolKey => tools[toolKey]) // Map tool keys to tool objects
        .sort((a, b) => {
            // Cursor type always first
            if (a.type === 'cursor' && b.type !== 'cursor') return -1;
            if (b.type === 'cursor' && a.type !== 'cursor') return 1;

            // Sort by type alphabetically
            if (a.type !== b.type) return a.type.localeCompare(b.type);

            // Sort by price (ascending) within type
            return a.price - b.price;
        });

    // Create toolbar elements
    sortedTools.forEach((tool, index) => {
        const toolElement = document.createElement('div');
        toolElement.classList.add('toolbar-item');

        // Add tooltip with the name
        toolElement.title = tool.name;
            
        // Display icon and price if applicable
// Display icon and price if applicable
toolElement.innerHTML = tool.price > 0 
    ? `<div style="font-size: 24px;">${tool.icon}</div>
       <div style="font-size: 12px; margin-top: 2px;">$${tool.price.toFixed(2)}</div>`
    : `<div style="font-size: 24px;">${tool.icon}</div>`;




        toolElement.style.backgroundColor = tool.backgroundColor

        // Click handler for selecting tool
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
