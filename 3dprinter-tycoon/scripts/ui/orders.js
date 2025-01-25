import { gameState } from '../state.js';
import { updateHeader } from '../utils/helpers.js';
import { updateInventoryPane } from './inventory.js';
import { models, filaments } from '../definitions.js';
import { initializeToolbar } from './toolbar.js';
import { addReputation } from './reputationBar.js';

const ordersContainer = document.getElementById('orders-container');
const orderIntervalRange = [20000, 30000]; // 20-30 seconds between orders
let orderId = 1;

// Data structure to maintain all active orders
const activeOrders = [];

/**
 * Generates a random order with required parts and colors.
 * @returns {Object} - The generated order.
 */
function generateOrder() {
    const partOptions = models;
    const colors = filaments.map(filament => filament.color);

    const orderParts = [];
    const numberOfParts = 1 //Math.floor(Math.random() * 1) + 2; // 1-3 parts
    var totalPartCount = 0;

    for (let i = 0; i < numberOfParts; i++) {
        const part = partOptions[Math.floor(Math.random() * partOptions.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const existingPart = orderParts.find(p => p.name === part.name && p.color === color);
        let partQuantity = Math.floor(Math.random() * 3) + 3; // 3-5 parts
        if (existingPart) {
            existingPart.quantity += partQuantity; // Increment quantity if already exists
        } else {
            orderParts.push({
                ...part,
                color: color,
                quantity: partQuantity,
            });
        }
        totalPartCount += partQuantity;
    }

    const orderValue = orderParts.reduce((total, part) => total + part.value, 0); // $50 per part

    return {
        id: orderId++,
        parts: orderParts,
        value: orderValue,
        totalPartCount: totalPartCount,
        shippable: false, // Indicates if the order is ready to ship
        totalTime: totalPartCount * 10 * gameState.orderTime, // Total time in seconds before expiration
        timeRemaining: totalPartCount * 10, // Time in seconds before expiration
        timerId: null, // Reference to the countdown timer
    };
}

/**
 * Creates an order card in the UI and updates the activeOrders data structure.
 * @param {Object} order - The order object.
 */
function createOrder(order) {
    activeOrders.push(order);

    const card = document.createElement('div');
    card.classList.add('order-card');
    card.dataset.orderId = order.id; // Link card to order in activeOrders

    const partsList = order.parts
        .map(part => `${part.quantity} x ${part.color} ${part.name}`)
        .join('<br>');

    card.innerHTML = `
        <p><strong>Order #${order.id}</strong></p>
        <p>${partsList}</p>
        <p><strong>Value:</strong> $${order.value.toFixed(2)}</p>
        <div class="time-bar"></div>
        <button class="ship-order-btn" disabled>Ship Order</button>
    `;

    const shipButton = card.querySelector('.ship-order-btn');
    const timeBar = card.querySelector('.time-bar');
    // the time bar should be filled based on the time remaining
    timeBar.style.backgroundColor = '#006118'
    timeBar.style.height = '10px';
    timeBar.style.width = `${Math.floor(order.timeRemaining / order.totalTime*100)}%`;

    shipButton.addEventListener('click', () => {
        shipOrder(order);
    });

    ordersContainer.appendChild(card);

    // Start countdown timer for expiration
    order.timerId = setInterval(() => {
        order.timeRemaining -= .1;

        if (order.timeRemaining <= 0) {
            // Remove expired order
            removeOrder(order);
        }

        const timeBar = card.querySelector('.time-bar');
        // the time bar should be filled based on the time remaining
        timeBar.style.width = `${(order.timeRemaining / order.totalTime*100)}%`;
    }, 100);

    order.card = card; // Store reference to card in order object
    updateShipButtonState(order, shipButton);
}

/**
 * Updates the ship button's enabled state based on inventory.
 * @param {Object} order - The order object.
 * @param {HTMLElement} button - The ship button element.
 */
function updateShipButtonState(order, button) {
    const canShip = order.parts.every(part => {
        const inventoryItem = gameState.inventory.find(
            item => item.name === part.name && item.color === part.color
        );
        return inventoryItem && inventoryItem.quantity >= part.quantity;
    });

    order.shippable = canShip; // Update the order's shippable status
    button.disabled = !canShip;
    button.style.opacity = canShip ? '1' : '0.5';
}

/**
 * Ships the order, updates money, and removes parts from inventory.
 * @param {Object} order - The order object.
 */
function shipOrder(order) {
    // Remove parts from inventory
    order.parts.forEach(part => {
        const inventoryItem = gameState.inventory.find(
            item => item.name === part.name && item.color === part.color
        );
        if (inventoryItem) {
            inventoryItem.quantity -= part.quantity;
            if (inventoryItem.quantity <= 0) {
                gameState.inventory = gameState.inventory.filter(i => i !== inventoryItem);
            }
        }
    });

    // Add money to game state
    gameState.money += order.value;
    addReputation(order.totalPartCount * (Math.floor(order.timeRemaining / 4) + 3)); // Increase reputation
    // Remove the order from activeOrders
    removeOrder(order);

    updateHeader();
    updateInventoryPane();
    initializeToolbar();
}

/**
 * Removes an order from the activeOrders array by ID.
 * @param {number} orderId - The ID of the order to remove.
 */
function removeOrder(order) {
    const orderIndex = activeOrders.findIndex(o => o.id === order.id);
    clearInterval(order.timerId);

    if (orderIndex !== -1) {
        activeOrders.splice(orderIndex, 1);
    }
    order.card.remove();
}

let orderTimers = []; // Array to hold timeout IDs for active orders

/**
 * Generates new orders at random intervals.
 */
function startOrderGeneration() {
    function generateAndDisplayOrder() {
        const newOrder = generateOrder();
        createOrder(newOrder);

        const nextInterval = Math.random() * ((orderIntervalRange[1] - orderIntervalRange[0]) + orderIntervalRange[0]) / gameState.orderSpeed;
        const timerId = setTimeout(generateAndDisplayOrder, nextInterval);
        orderTimers.push(timerId); // Store the timer ID for possible cancellation
    }

    generateAndDisplayOrder();
}

/**
 * Stops generating new orders and clears all scheduled orders.
 */
function stopOrderGeneration() {
    orderTimers.forEach(timerId => clearTimeout(timerId)); // Clear all timeouts
    orderTimers.length = 0; // Clear the array
}


/**
 * Checks all orders in activeOrders and updates the ship buttons.
 */
function checkAllOrders() {
    activeOrders.forEach(order => {
        if (order.card) {
            const shipButton = order.card.querySelector('.ship-order-btn');
            updateShipButtonState(order, shipButton);
        }
    });
}

export { startOrderGeneration, stopOrderGeneration, checkAllOrders };
