let gridSize = 4;
let grid = [];
const toolbar = [];
let selectedTool = 1; 
let selectedSoil = null; 
let currentTier = 1;
let hasWon = false;
let startTime = new Date();

let purchasedTools = ['normal', 'normalSoil', 'tomatoSeed']; // Start with Tomato Seeds only

let elapsedTime = 0;
let money = 5;

let cursorMultiplier = 1


const gameContainer = document.getElementById('game-container');
const toolbarContainer = document.getElementById('toolbar-container');

const cursorMultipliers = {
    normal: 1,
    advanced: 1.2,
    crazy: 1.5,
    ultimate: 2,
};


class Fruit {
    constructor(name, growTime, price, color, groundGrower = false) {
        this.name = name;
        this.growTime = growTime;
        this.price = price;
        this.color = color;
        this.groundGrower = groundGrower;
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
        } else if (!this.tooltip && type === 'cursor') {
            this.tooltip = `Multiplies your earnings by ${cursorMultipliers[name.toLowerCase().split(' ')[0]]}`;
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
    tomato: new Fruit('Tomato', 10, 1, '#ad0000'),
    cucumber: new Fruit('Cucumber', 18, 2, '#7bd18a'),
    onion: new Fruit('Onion', 30, 5, '#dee1a8', groundGrower = true),
    pumpkin: new Fruit('Pumpkin', 40, 10, '#d77c14', groundGrower = true),
    strawberry: new Fruit('Strawberry', 8, 8, '#bcd981'),
    eggplant: new Fruit('Eggplant', 30, 50, '#7c59d4')
};

const tools = {
    normal: new Tool('Normal Cursor', '👆', 0, 'cursor', 1, 0),
    advanced: new Tool('Advanced Cursor', '^', 0, 'cursor', 2, 100),
    crazy: new Tool('Crazy Cursor', 'C', 0, 'cursor', 3, 400),
    ultimate: new Tool('Ultimate Cursor', 'U', 0, 'cursor', 5, 1000),

    tomatoSeed: new Tool('Tomato Seed', '🍅', 0.25, 'seed', 1, 0),
    cucumberSeed: new Tool('Cucumber Seed', '🥒', 0.40, 'seed', 1, 30),
    onionSeed: new Tool('Onion Seed', '🧅', 1, 'seed', 2, 70),
    pumpkinSeed: new Tool('Pumpkin Seed', '🎃', 3, 'seed', 3, 200),
    strawberrySeed: new Tool('Strawberry Seed', '🍓', 8, 'seed', 4, 600),
    eggplantSeed: new Tool('Eggplant Seed', '🍆', 30, 'seed', 5, 2000),

    normalSoil: new Tool('Normal Soil', '🟫', 1, 'soil', 1, 20, 'sandybrown', tooltip='A pot lol'),
    advancedSoil: new Tool('Advanced Soil', 'A', 3, 'soil', 2, 100, 'saddlebrown', tooltip='Better pot will yield 2x as much per plant'),
    superSoil: new Tool('Super Soil', 'S', 5, 'soil', 4, 400, 'brown',  tooltip='Better pot will yield 3x as much per plant'),
    megaSoil: new Tool('Mega Soil', 'M', 10, 'soil', 5, 800, 'darkgrey', tooltip='Better pot will yield 5x as much per plant'),

    autoFarmer: new Tool('Farmer', '👨‍🌾', 50, 'addon', 3, 400, '', tooltip='Add to a pot to automatically harvest them'),

    autoWater: new Tool('Irrigation', '💦', 0, 'automation', 2, 200, '', tooltip='Adds water to your crops, making them grow 20% faster'),
    autoFertilize: new Tool('Auto Fertilizer', '💩', 0, 'automation', 3, 500, '', tooltip='Adds fertilizer to your crops, making them grow 50% faster'),
    autoSeeder: new Tool('Auto Planter', '🌱', 0, 'automation', 4, 200, '', tooltip='after you harvest a crop, it will be automatically replanted'),
   // autoHarvester: new Tool('Auto Harvester', '🚜', 0, 'automation', 5, 5000, '', tooltip='All crops will be harvested automatically once they are ready'),
};


const soilTypes = {
    empty: new SoilType('Empty', 'white', 0),
    normal: new SoilType('Normal', 'sandybrown', 1),
    advanced: new SoilType('Advanced', 'saddlebrown', 2),
    super: new SoilType('Super', 'brown', 3),
    mega: new SoilType('Mega', 'black', 5)
};

const sounds = {
    click: new Audio('assets/digging.mp3'),
    plop: new Audio('assets/plop.mp3'),
    cutting: new Audio('assets/cutting.mp3'),
};

class Plot {
    constructor() {
        this.state = 'dirt'; // 'dirt', 'seed', 'sprout', 'grown', 'fruit', 'overripe'
        this.timer = 0;
        this.fruit = null;
        this.potType = 'empty';
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 120;
        this.canvas.height = 120;
        this.canvas.style.backgroundColor = soilTypes[this.potType].color;
        this.canvas.style.border = '1px solid black';
        this.hasAutoFarm = false
        this.fruitImage = new Image()
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
        
            if (growthStage == 8 && (purchasedTools.includes('autoPlanter') || this.hasAutoFarm)) {
                let earnings = this.fruit.price * this.fruitCount
                money += earnings;
                // Show the floating text near the clicked fruit
                    const rect = this.canvas.getBoundingClientRect();
                    showFloatingText(`+$${earnings.toFixed(2)}`, rect.left + rect.width / 2, rect.top);
                this.reset()
                updateState()
            }
        }
        this.updateAppearance();
    }

    reset(selectedTool) {

        this.timer = 0;
        this.state = 'dirt'; 
        this.leaves = null;
        this.fruitPositions = null;
        this.fruitCount = 0;

        const toolKey = selectedTool?.name?.toLowerCase()?.split(' ')[0] ?? ''
        if (!purchasedTools.includes('autoSeeder') || toolKey == 'cursor' ) {
            this.fruit = null;
        } else {
            if (fruits[toolKey]) {
            this.fruit = fruits[toolKey];
            }
        }

        this.updateAppearance();
    }
 

    drawPlant() {

        function drawLeaf(ctx, centerX, leafY, angle, size, growth, side, borderColor = '#111', fillColor = 'green') {
            ctx.save();
            ctx.translate(centerX, leafY);
            ctx.rotate(angle);
        
            // Leaf dimensions
            const leafLength = Math.abs(size) * growth * 2.7;
            const leafWidth = Math.abs(size) * growth * 0.8;
        
            // Flip the leaf if on the left side
            const direction = side === 'left' ? -1 : 1;
        
            // Draw leaf border
            ctx.fillStyle = borderColor;
            ctx.beginPath();
            ctx.moveTo(0, 0); // Starting point at the base
            ctx.bezierCurveTo(
                direction * (leafLength / 3), -leafWidth, // Control point for the upper curve
                direction * (leafLength / 3) * 2, -leafWidth, // Control point near the tip (upper side)
                direction * leafLength, 0 // Tip of the leaf
            );
            ctx.bezierCurveTo(
                direction * (leafLength / 3) * 2, leafWidth, // Control point for the lower curve
                direction * (leafLength / 3), leafWidth, // Control point near the base (lower side)
                0, 0 // Return to the base
            );
            ctx.closePath();
            ctx.fill();
        
            // Draw leaf body
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.moveTo(0, 0); // Starting point at the base
            ctx.bezierCurveTo(
                direction * (leafLength / 3), -leafWidth + 1, // Control point for the upper curve
                direction * (leafLength / 3) * 2, -leafWidth + 1, // Control point near the tip (upper side)
                direction * leafLength - 1, 0 // Tip of the leaf
            );
            ctx.bezierCurveTo(
                direction * (leafLength / 3) * 2, leafWidth - 1, // Control point for the lower curve
                direction * (leafLength / 3), leafWidth - 1, // Control point near the base (lower side)
                0, 0 // Return to the base
            );
            ctx.closePath();
            ctx.fill();
        
            ctx.restore();
        }
        
        const ctx = this.ctx;
    
        const growthFactor = Math.min(this.timer / (this.fruit?.growTime * 6), 1);
    
        // Dimensions based on canvas size
        const centerX = this.canvas.width / 2;
        const baseY = this.canvas.height * 0.9;
        const maxStemHeight = this.canvas.height - 35;
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
            const leafCount = 12; // Fixed maximum number of leaves
            for (let i = 0; i < leafCount; i++) {
                this.leaves.push({
                    y: Math.random() * 0.05 + i/leafCount,
                    offset: 1.5 - Math.random() * 3,
                    size: Math.random() * 10 + 8 - i/leafCount, // Left leaf size
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
                const leafGrowth = Math.max(0, Math.min(1, (growthFactor - leaf.growthStart))); // Grow leaves gradually

                drawLeaf(ctx, centerX, leafY, leaf.leftAngle, Math.abs(leaf.size), leafGrowth, 'left');
                drawLeaf(ctx, centerX, leafY + leaf.offset, leaf.rightAngle, Math.abs(leaf.size), leafGrowth, 'right');
                                
            }
        });
                    

            // Draw fruit based on state
            if (this.fruit && (this.state === 'fruit' || this.state === 'overripe')) {
                let radius = 6;

                // Generate positions if not already created
                if (!this.fruitPositions) {
                    this.fruitPositions = [];
                    let x_jitter = 2; // Maximum random offset for bunching
                    let y_jitter = 15; // Maximum random offset for bunching

                    if (this.fruit.groundGrower) {
                        x_jitter = 30; // Increase jitter for ground-growing plants
                        y_jitter = 0; // Reduce jitter for ground-growing plants
                    }
                    for (let i = 0; i < 10; i++) {
                        this.fruitPositions.push({
                            offsetX: (Math.random() - 0.5) * x_jitter * 2,
                            offsetY: (Math.random() - 0.5) * y_jitter * 2
                        });
                    }
                }

                let src = `assets/${this.fruit.name.toLowerCase()}`;
                if (this.state === 'overripe') {
                    src += '_dead';
                }
                src += '.svg';
                this.fruitImage.src = src

                // Draw each fruit
                this.fruitPositions.forEach((position, i) => {
                    if (i > this.fruitCount - 1) {
                        return;
                    }

                    const x = centerX + position.offsetX;
                    let y = baseY - stemHeight + 20 + position.offsetY;
                    if (this.fruit.groundGrower) {
                        y = baseY - 10;
                    }

                    // Draw the fruit image
                    if (this.fruitImage.complete) { // Ensure the SVG is fully loaded
                        ctx.drawImage(
                            this.fruitImage,
                            x - radius * 3, // Adjust X position to center the image
                            y - radius * 2, // Adjust Y position to center the image
                            radius * 6, // Width
                            radius * 6 // Height
                        );
                    } 
                });


        }


    }
    
    updateAppearance() {
        const ctx = this.ctx;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = soilTypes[this.potType].color;

        // Start the path for the hill
        ctx.beginPath();
        ctx.moveTo(0, 106); // Start at the bottom-left corner (80% of canvas height)
        ctx.quadraticCurveTo(60, 72, 120, 106); // Peak at the middle, end at bottom-right corner
        ctx.lineTo(120, 120); // Extend to the bottom-right of the canvas
        ctx.lineTo(0, 120); // Draw across the bottom of the canvas
        ctx.closePath(); // Close the shape
        ctx.fill(); // Fill the hill with soil color
        

        this.drawPlant();

            if (this.hasAutoFarm) {
                // add an indicator to the corner of the pot
                this.ctx.fillStyle = 'green';
                this.ctx.beginPath();
                this.ctx.arc(5, 5, 3, 0, Math.PI * 2);
                this.ctx.fill();
            } 
    }
}

/// Save and Load

function saveGame() {
    const saveData = {
        grid: grid.filter(x => x).map(row =>
            row.map(plot => ({
                state: plot.state,
                timer: plot.timer,
                fruit: plot.fruit ? plot.fruit.name.toLowerCase() : null,
                potType: plot.potType,
                hasAutoFarm: plot.hasAutoFarm,
            }))
        ),
        money,
        startTime,
        purchasedTools,
        currentTier,
        hasWon,
    };
    localStorage.setItem('farmGameSave', JSON.stringify(saveData));
}

function loadGame() {
    const savedData = localStorage.getItem('farmGameSave');
    if (savedData) {
        const { grid: savedGrid, money: savedMoney, startTime: savedTime, purchasedTools: savedTools, currentTier: savedTier, hasWon: savedWon } = JSON.parse(savedData);

        money = savedMoney;
        startTime = new Date(savedTime);
        purchasedTools = savedTools;
        currentTier = savedTier;
        hasWon = savedWon;

        grid.length = 0; // Clear current grid
 
        initializeGrid(savedGrid); // Re-render the grid
        initializeToolbar(); // Re-initialize the toolbar
        updateState(); // Update the state
        updateStore(); // Update the store
    } else {
        initializeGrid();
    }
}


/// Utils

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

function initializeGrid(sourceGrid, append = false) {
    if (!append) {
        gameContainer.innerHTML = ''; 
        grid = [];
    }
    for (let i = 0; i < currentTier; i++) {
        if (!grid[i]) {
            grid[i] = [];
            for (let j = 0; j < gridSize; j++) {
                let potType = 'empty';
                let plot = new Plot();
                // check if sourcegrid has the current elements
                if (sourceGrid && sourceGrid[i] && sourceGrid[i][j]) {
                    const plotData = sourceGrid[i][j];
                    plot.fruit = plotData.fruit ? fruits[plotData.fruit] : null;
                    plot.state = plotData.state;
                    plot.timer = plotData.timer;
                    plot.potType = plotData.potType;
                    plot.hasAutoFarm = plotData.hasAutoFarm;
                } 
                plot.updateAppearance();

                plot.canvas.addEventListener('click', () => {
                    if (plot.state === 'fruit' || plot.state === 'overripe') {
                        if (plot.state === 'fruit') {
                            earnings = plot.fruit.price * plot.fruitCount * cursorMultiplier;
                            money += earnings;
                            // Show the floating text near the clicked fruit
                                const rect = plot.canvas.getBoundingClientRect();
                                showFloatingText(`+$${earnings.toFixed(2)}`, rect.left + rect.width / 2, rect.top);
                        }
                        sounds.cutting.currentTime = 0;
                        sounds.cutting.play();
                        plot.reset(selectedTool);
                    } 
                    else if (selectedTool && money >= selectedTool.price) {
                        if (selectedTool.type === 'soil' && plot.potType === 'empty') {
                            plot.potType = selectedTool.name.toLowerCase().split(' ')[0];
                            plot.updateAppearance();
                            money -= selectedTool.price;
                            sounds.click.currentTime = 0;
                            sounds.click.play();
                        } else if (selectedTool.type === 'seed' && plot.state === 'dirt') {
                            if (plot.potType === 'empty') {
                                showAlert('You need to add soil first!');
                                return;
                            }
                            sounds.plop.currentTime = 0.1;
                            sounds.plop.play();
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
                        } else if (selectedTool.type === 'addon') {
                            if (selectedTool.name === 'Farmer') {
                                plot.hasAutoFarm = true;
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
}



// Sort tools: Cursor first, then by type and price

// Toolbar - Shows Purchased Tools
function initializeToolbar() {
    toolbarContainer.innerHTML = ''; // Clear toolbar
    toolbar.length = 0; // Reset toolbar array

    const sortedTools = purchasedTools
    .map(toolKey => tools[toolKey]) // Map tool keys to tool objects
    .filter(tool => {
        if (tool.type === 'cursor') {
            // Keep only the most expensive cursor
            const cursors = purchasedTools
                .map(toolKey => tools[toolKey])
                .filter(t => t.type === 'cursor');
            const mostExpensiveCursor = cursors.reduce((max, current) => 
                current.unlockPrice > max.unlockPrice ? current : max, cursors[0]);
            cursorMultiplier = cursorMultipliers[mostExpensiveCursor.name.toLowerCase().split(' ')[0]]
            return tool === mostExpensiveCursor;

        }
        return true; // Keep all other tools
    })
    .sort((a, b) => {
        // Cursor type always first
        if (a.type === 'cursor' && b.type !== 'cursor') return -1;
        if (b.type === 'cursor' && a.type !== 'cursor') return 1;

        // Sort by type alphabetically
        if (a.type !== b.type) return a.type.localeCompare(b.type);

        // Sort by price (ascending) within type
        return a.price - b.price;
    })
    .filter(tool => tool.type !== 'automation'); // Exclude automation tools


    function highlightSelected(selectedIndex) {
        toolbar.forEach((item, i) => {
            item.style.border = i === selectedIndex ? '2px solid blue' : '1px solid black';
        });
    }

    // Group tools by type
    const toolsByType = sortedTools.reduce((groups, tool) => {
        if (!groups[tool.type]) {
            groups[tool.type] = [];
        }
        groups[tool.type].push(tool);
        return groups;
    }, {});

    // Create rows for each tool type
    Object.keys(toolsByType).forEach(type => {
        // Create a row for the current type
        const rowElement = document.createElement('div');
        rowElement.classList.add('toolbar-row');
        rowElement.style.display = 'flex'; // Flex row for tools
        rowElement.style.marginBottom = '10px'; // Space between rows

        // Create elements for each tool in the type
        toolsByType[type].forEach((tool, index) => {
            const toolElement = document.createElement('div');
            toolElement.classList.add('toolbar-item');

            // Add tooltip with the name
            toolElement.title = tool.name;

            // Display icon and price if applicable
            toolElement.innerHTML = tool.price > 0
                ? `<div style="font-size: 24px;">${tool.icon}</div>
                   <div style="font-size: 12px; margin-top: 2px;">$${tool.price.toFixed(2)}</div>`
                : `<div style="font-size: 24px;">${tool.icon}</div>`;

            toolElement.style.backgroundColor = tool.backgroundColor;

            // Click handler for selecting tool
            toolElement.addEventListener('click', () => {
                selectedTool = tool;
                highlightSelected(toolbar.indexOf(toolElement));
            });

            selectedTool = tool;
            toolbar.push(toolElement);
            rowElement.appendChild(toolElement);
        });

        // Add the row to the toolbar container
        toolbarContainer.appendChild(rowElement);
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
    updateStore()
    saveGame();
    if (money >= 10000) {
        const finalTime = formatElapsedTime();
        if (!hasWon) {
            showPopup(`Well Yeee-haw! You got to $10,000 in ${finalTime}.`);
            hasWon = true
        }
    } else if (money < .25) {
        // check if any plots have plants in them
        let hasPlants = false
        grid.forEach(row => row.forEach(plot => {
            if (plot.state !== 'dirt') {
                hasPlants = true
            }
        })
        )
        if (!hasPlants) {
            showPopup(`Aww shucks, you ran out of money! Try again?`, 'Yes', true);
        }
    }

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
        upgradeButton.classList.add('disabled');
    } else { 
        upgradeButton.innerHTML = `
        <div style="font-size: 14px;">$${nextTierCost[currentTier]}</div>
        <div style="font-size: 12px;">Upgrade Farm to Level ${currentTier + 1}</div>
        `;
    }
}

function showPopup(message, buttonText = 'OK', reloadPage = false) {
    // Create the overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = 1000;

    // Create the popup
    const popup = document.createElement('div');
    popup.style.backgroundColor = '#fff';
    popup.style.padding = '20px';
    popup.style.borderRadius = '10px';
    popup.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    popup.style.textAlign = 'center';
    popup.style.maxWidth = '500px';
    popup.style.fontFamily = 'Arial, sans-serif';

    // Add the message
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    popup.appendChild(messageElement);

    // Add a close button
    const closeButton = document.createElement('button');
    closeButton.textContent = buttonText;
    closeButton.style.marginTop = '15px';
    closeButton.style.padding = '10px 20px';
    closeButton.style.border = 'none';
    closeButton.style.backgroundColor = '#007bff';
    closeButton.style.color = '#fff';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    if (reloadPage) {
        closeButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
            location.reload();
        });
    } else {
        closeButton.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
    }

    popup.appendChild(closeButton);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
}


function upgradeTier() {
    let unlockPrice = nextTierCost[currentTier]
    if (money >= unlockPrice) {
        // Deduct money and upgrade the tier
        money -= unlockPrice;
        currentTier++;
        sourceGrid = grid
        initializeGrid(sourceGrid, true);

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
                        updateState();
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

function formatElapsedTime() {
    const minutes = Math.floor(elapsedTime / 60); // Calculate the number of minutes
    const seconds = elapsedTime % 60; // Calculate the remaining seconds
    return timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`; // Format as MM:SS
}

// Start growth function
function startGrowth() {
    growInterval = setInterval(() => {
        grid.forEach(row => row.forEach(plot => plot.grow()));
        const timer = document.getElementById('timer');
        elapsedTime = Math.floor((new Date() - startTime) / 1000);
        timer.textContent = formatElapsedTime();        
    }, 50);
}

// Initialize
initializeToolbar();

const backgroundMusic = new Audio('assets/background.mp3');
loadGame();

updateState();  
updateStore()
startGrowth(); // Start growth initially

document.addEventListener('click', () => {
    backgroundMusic.play();
    backgroundMusic.loop = true; // Enable looping

}, { once: true }); // Ensure it only listens for the first click

// Initialize sound toggle
const soundToggle = document.getElementById('sound-toggle');
let isSoundEnabled = false; // Default to sound on

// Update state when checkbox is toggled
soundToggle.addEventListener('change', () => {
    isSoundEnabled = soundToggle.checked; // Update sound state
    if (isSoundEnabled) {
        backgroundMusic.play();
    } else {
        backgroundMusic.pause();
    }
});

document.getElementById('reset-game').addEventListener('click', () => {
    localStorage.removeItem('farmGameSave');
    location.reload(); // Restart the game
});
