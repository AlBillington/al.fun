let gridSize = 4;
const grid = [];
const toolbar = [];
let money = 5;
let selectedTool = 1; 
let selectedSoil = null; 
let currentTier = 1;

let purchasedTools = ['cursor', 'normalSoil', 'tomatoSeed']; // Start with Tomato Seeds only


const gameContainer = document.getElementById('game-container');
const toolbarContainer = document.getElementById('toolbar-container');

class Fruit {
    constructor(name, growTime, price, color) {
        this.name = name;
        this.growTime = growTime;
        this.price = price;
        this.color = color;
    }
}

class Tool {
    constructor(name, icon, price, type, tier, unlockPrice, backgroundColor = 'white', tooltip = '') {
        this.name = name;
        this.icon = icon;
        this.price = price;
        this.type = type; // 'seed' or 'soil'
        this.unlockPrice = unlockPrice;
        this.backgroundColor = backgroundColor;
        this.tier = tier;
        this.tooltip = tooltip;
        if (!this.tooltip && type === 'seed') {
            this.tooltip = `Cost $${price.toFixed(2)}, sells for $${fruits[name.toLowerCase().split(' ')[0]].price.toFixed(2)}.  Matures in ${fruits[name.toLowerCase().split(' ')[0]].growTime} seconds`;
        }
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
    kiwi: new Fruit('Kiwi', 6, 10, 'brown'),
    eggplant: new Fruit('Eggplant', 30, 70, 'purple')
};

const tools = {
    cursor: new Tool('Cursor', '👆', 0, 'cursor', 1, 0),
    tomatoSeed: new Tool('Tomato Seed', '🍅', 0.25, 'seed', 1, 0),
    cucumberSeed: new Tool('Cucumber Seed', '🥒', 0.40, 'seed', 1, 30),
    onionSeed: new Tool('Onion Seed', '🧅', 1, 'seed', 2, 70),
    pumpkinSeed: new Tool('Pumpkin Seed', '🎃', 3, 'seed', 3, 200),
    kiwiSeed: new Tool('Kiwi Seed', '🥝', 3, 'seed', 4, 600),
    eggPlantSeed: new Tool('Eggplant Seed', '🍆', 5, 'seed', 5, 2000),

    normalSoil: new Tool('Normal Pot', '🟫', 1, 'soil', 1, 20, 'sandybrown', tooltip='A pot lol'),
    advancedSoil: new Tool('Advanced Pot', 'A', 3, 'soil', 2, 50, 'saddlebrown', tooltip='Better pot will yield 2x as much per plant'),
    superSoil: new Tool('Super Pot', 'S', 5, 'soil', 3, 200, 'brown',  tooltip='Better pot will yield 3x as much per plant'),
    megaSoil: new Tool('Mega Pot', 'M', 10, 'soil', 4, 500, 'darkgrey', tooltip='Better pot will yield 5x as much per plant'),

    autoWater: new Tool('Irrigation', '💦', 0, 'automation', 2, 200, '', tooltip='Adds water to your crops, making them grow 20% faster'),
    autoFertilize: new Tool('Auto Fertilizer', '💩', 0, 'automation', 3, 500, '', tooltip='Adds fertilizer to your crops, making them grow 50% faster'),
    autoSeeder: new Tool('Auto Planter', '🌱', 0, 'automation', 4, 200, '', tooltip='after you harvest a crop, it will be automatically replanted'),
    autoPlanter: new Tool('Auto Harvester', '🚜', 0, 'automation', 5, 5000, '', tooltip='Crops will be harvested automatically once they are ready'),
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

            let increment = 1;
            if (purchasedTools.includes('autoWater')) {
                increment = increment * 1.2;
            }
            if (purchasedTools.includes('autoFertilize')) {
                increment = increment * 1.5;
            }
            this.timer += increment;
            const growthDuration = this.timer / this.fruit.growTime
            const growthStage = Math.floor(growthDuration);
            if (growthStage >= 9 * increment) {
                this.state = 'overripe';
            } else if (growthStage >= 4 ) {
                const multiplier = soilTypes[this.potType].multiplier;
                this.fruitCount = Math.min((Math.ceil((growthDuration - 4) * multiplier)), Math.ceil(multiplier))
                this.state = 'fruit';
            } else if (growthStage === 3) {
                this.state = 'grown';
            } else if (growthStage === 2) {
                this.state = 'sprout';
            } else if (growthStage === 1) {
                this.state = 'seed';
            }
        
            if (growthStage == 8 && purchasedTools.includes('autoPlanter')) {
                let earnings = this.fruit.price * this.fruitCount
                money += earnings;
                // Show the floating text near the clicked fruit
                    const rect = this.canvas.getBoundingClientRect();
                    showFloatingText(`+$${earnings.toFixed(0)}`, rect.left + rect.width / 2, rect.top);
                this.reset()
                updateState()
            }
        }
        this.updateAppearance();
    }

    reset(selectedTool) {
        const toolKey = selectedTool?.name?.toLowerCase()?.split(' ')[0] ?? ''
        if (!purchasedTools.includes('autoSeeder') || toolKey == 'cursor' ) {
            this.fruit = null;
        } else {
            if (fruits[toolKey]) {
            this.fruit = fruits[toolKey];
            }
        }
        this.timer = 0;
        this.state = 'dirt'; 
        this.leaves = null;
        this.fruitPositions = null;
        this.fruitCount = 0;
        this.updateAppearance();
    }
 

    drawPlant() {

        function drawLeaf(ctx, centerX, leafY, angle, size, growth, borderColor = '#111', fillColor = 'green') {
            ctx.save();
            ctx.translate(centerX, leafY);
            ctx.rotate(angle);
        
            // Draw leaf border
            ctx.fillStyle = borderColor;
            ctx.beginPath();
            ctx.ellipse(
                size * growth, 0, // Position of the ellipse
                Math.abs(size) * growth *1.1, // Slightly larger for border
                (Math.abs(size) / 2) * growth + 1, // Slightly larger for border
                0, 0, Math.PI * 2
            );
            ctx.fill();
        
            // Draw leaf body
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.ellipse(
                size * growth, 0, // Position of the ellipse
                Math.abs(size) * growth,
                (Math.abs(size) / 2) * growth,
                0, 0, Math.PI * 2
            );
            ctx.fill();
        
            ctx.restore();
        }
             
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        const growthFactor = Math.min(this.timer / (this.fruit?.growTime * 6), 1);
    
        // Dimensions based on canvas size
        const centerX = this.canvas.width / 2;
        const baseY = this.canvas.height * 0.9;
        const maxStemHeight = this.canvas.height - 25;
        const stemHeight = Math.min(this.canvas.height * 0.8 * growthFactor, maxStemHeight);
    
        // Draw stem based on growth factor
        ctx.strokeStyle = 'green';
        ctx.lineWidth = Math.max(1, growthFactor * 4);
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
                    y: Math.random() * 0.2 + 0.1 + i/leafCount, // Position near the top of the stem (60-80%)
                    size: Math.random() * 6 + 4, // Left leaf size
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

                drawLeaf(ctx, centerX, leafY, leaf.leftAngle, -leaf.size, leafGrowth);
                drawLeaf(ctx, centerX, leafY, leaf.rightAngle, leaf.size, leafGrowth);
                
            }
        });
                    
        // Draw fruit based on state
        if (this.state === 'fruit' || this.state === 'overripe') {
            let radius = 6;
            let color = this.fruit.color;
            if (this.state === 'overripe') {
                radius = 4; // Fixed size for each fruit
                color = 'black';
            }

            // Draw each fruit at its pre-generated position

            if (!this.fruitPositions) {
                // Generate positions once
                this.fruitPositions = [];
                const x_jitter = 5; // Maximum random offset for bunching
                const y_jitter = 15; // Maximum random offset for bunching
                for (let i = 0; i < 10; i++) {
                    this.fruitPositions.push({
                        offsetX: (Math.random() - 0.5) * x_jitter * 2,
                        offsetY: (Math.random() - 0.5) * y_jitter * 2
                    });
                }
            }

            this.fruitPositions.forEach((position, i) => {
                if (i > this.fruitCount - 1) {
                    return;
                }
                const x = centerX + position.offsetX; // Apply pre-generated X offset
                const y = baseY - stemHeight + 20 + position.offsetY; // Apply pre-generated Y offset

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
                        earnings = plot.fruit.price * plot.fruitCount;
                        money += earnings;
                        // Show the floating text near the clicked fruit
                            const rect = plot.canvas.getBoundingClientRect();
                            showFloatingText(`+$${earnings.toFixed(0)}`, rect.left + rect.width / 2, rect.top);
                    }
                    plot.reset(selectedTool);
                } 
                else if (selectedTool && money >= selectedTool.price) {
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
                updateState();
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
        }).filter(tool => tool.type != 'automation'); 

    // Create toolbar elements
    sortedTools.forEach((tool, index) => {
        const toolElement = document.createElement('div');
        toolElement.classList.add('toolbar-item');

        // Add tooltip with the name
        toolElement.title = tool.name;
            
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
        selectedTool = tool;
        toolbar.push(toolElement);
        toolbarContainer.appendChild(toolElement);
    });
}



// Store implementation
let storeOpen = false;
let growInterval; // Track the growth interval

function toggleStore() {
    updateState();
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
const nextTierCost = [0, 150, 500, 1500, 3500, 8500];

function updateState() {
    const moneyDisplay = document.getElementById('money-display');
    moneyDisplay.textContent = `$${money.toFixed(2)}`;

    // Update the Upgrade Tier button
    const upgradeButton = document.getElementById('upgrade-tier-button');

    const canAfford = money >= nextTierCost[currentTier];
    upgradeButton.classList.remove('disabled');

    if (!canAfford) {
        upgradeButton.classList.add('disabled');
    }
    if (currentTier > 4) {
        upgradeButton.innerHTML = `
            <div style="font-size: 14px;">Max Level Reached</div>
        `;
    } else { 
        upgradeButton.innerHTML = `
        <div style="font-size: 14px;">$${nextTierCost[currentTier]}</div>
        <div style="font-size: 12px;">Upgrade Farm to Level ${currentTier + 1}</div>
        `;
    }
}

function initializeStore() {
    const storePanel = document.getElementById('store-panel');
    document.body.appendChild(storePanel);
}


function upgradeTier() {
    let unlockPrice = nextTierCost[currentTier]
    if (money >= unlockPrice) {
        // Deduct money and upgrade the tier
        money -= unlockPrice;
        currentTier++;
        unlockPrice = nextTierCost[currentTier];
        updateState()
        updateStore()
    } 

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
    storeGrid.innerHTML = ''; // Clear the current store content

    // Group tools by tier
    const toolsByTier = {};
    Object.keys(tools).forEach(toolKey => {
        const tool = tools[toolKey];
        if (!toolsByTier[tool.tier]) {
            toolsByTier[tool.tier] = [];
        }
        toolsByTier[tool.tier].push({ key: toolKey, ...tool });
    });

    // Sort tiers numerically and create a section for each tier
    Object.keys(toolsByTier)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .forEach(tier => {

            if (tier > currentTier) return; // Skip tiers above the current tier
            // Create tier section
            const tierSection = document.createElement('div');
            tierSection.classList.add('tier-section');
            tierSection.innerHTML = `<h3>Level ${tier} Upgrades</h3>`;

            // Create a grid container for tools in this tier
            const tierGrid = document.createElement('div');
            tierGrid.classList.add('tier-grid');
            tierGrid.style.display = 'grid';
            tierGrid.style.gridTemplateColumns = 'repeat(4, 1fr)';
            tierGrid.style.gap = '10px'; // Space between items

            const tierTools = toolsByTier[tier];
            tierTools.forEach(({ key: toolKey, name, icon, unlockPrice }) => {
                if (toolKey === 'cursor') return; // Skip the cursor tool
                const isBought = purchasedTools.includes(toolKey);
                const canAfford = money >= unlockPrice;

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
                        money -= unlockPrice;
                        purchasedTools.push(toolKey);
                        document.getElementById('money-display').textContent = `$${money.toFixed(2)}`;
                        initializeToolbar();
                        updateStore();
                    }
                };
                item.title = tools[toolKey].tooltip;
                item.innerHTML = `
                    <div style="font-size: 24px;">${icon}</div>
                    <div style="font-size: 14px;">$${unlockPrice}</div>
                    <div style="font-size: 12px;">${name}</div>
                    <div style="font-size: 12px;">${isBought ? 'Bought' : ''}</div>
                `;

                // Add the tool to the tier grid
                tierGrid.appendChild(item);
            });

            // Append the tier grid to the tier section
            tierSection.appendChild(tierGrid);

            // Append the tier section to the store grid
            storeGrid.appendChild(tierSection);
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
updateState();  
startGrowth(); // Start growth initially
