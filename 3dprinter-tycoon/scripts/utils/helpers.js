import { gameState } from '../state.js';

/**
 * Updates the money display in the UI.
 */
export function updateHeader() {
    const moneyDisplay = document.getElementById('money-display');
    if (moneyDisplay) {
        moneyDisplay.textContent = `$${gameState.money.toFixed(2)}`;
    } 
}

/**
 * Formats a currency value as a string.
 * @param {number} value - The value to format.
 * @returns {string} - The formatted currency string.
 */
export function formatCurrency(value) {
    return `$${value.toFixed(2)}`;
}

/**
 * Highlights a selected element by applying a border.
 * @param {HTMLElement} element - The element to highlight.
 * @param {HTMLElement[]} allElements - All elements in the group to reset.
 */
export function highlightElement(element, allElements) {
    allElements.forEach(el => {
        el.style.border = el === element ? '2px solid blue' : '1px solid black';
    });
}

/**
 * Creates a dropdown menu with given options.
 * @param {Array} options - The list of options for the dropdown.
 * @param {string} id - The ID of the dropdown element.
 * @returns {HTMLElement} - The dropdown element.
 */
export function createDropdown(options, id) {
    const dropdown = document.createElement('select');
    dropdown.id = id;

    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value || option;
        optionElement.textContent = option.label || option;
        dropdown.appendChild(optionElement);
    });

    return dropdown;
}

/**
 * Disables or enables an HTML button.
 * @param {HTMLElement} button - The button element to update.
 * @param {boolean} disable - Whether to disable the button.
 * @param {string} text - Optional text to set on the button.
 */
export function toggleButtonState(button, disable, text = null) {
    button.disabled = disable;
    if (text) {
        button.textContent = text;
    }
    button.style.opacity = disable ? '0.5' : '1';
}

/**
 * Converts a percentage value (0-100) to a color gradient.
 * @param {number} percentage - The percentage value.
 * @returns {string} - The corresponding color.
 */
export function getGradientColor(percentage) {
    if (percentage < 50) {
        return 'red';
    } else if (percentage < 75) {
        return 'orange';
    }
    return 'green';
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - The string to capitalize.
 * @returns {string} - The capitalized string.
 */
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Clones a deep object or array.
 * @param {Object|Array} input - The object or array to clone.
 * @returns {Object|Array} - A deep copy of the input.
 */
export function deepClone(input) {
    return JSON.parse(JSON.stringify(input));
}
