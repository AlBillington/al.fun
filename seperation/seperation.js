// Hey! No peeking! 😠
const wordConnections = [
    { start: "race", path: ["car"], end: "pool" },
    { start: "snow", path: ["man", "cave"], end: "painting" },
    { start: "dog", path: ["house", "party"], end: "dress" },
    { start: "light", path: ["bulb", "socket"], end: "wrench" },
    { start: "paper", path: ["trail", "mix"], end: "tape" },
    { start: "apple", path: ["pie", "dish"], end: "soap" },
    { start: "moon", path: ["rock", "climbing"], end: "gear" },
    { start: "tree", path: ["house", "party"], end: "trick" },
    { start: "fire", path: ["alarm", "clock"], end: "tower" },
    { start: "road", path: ["map", "key", "chain"], end: "reaction" },
    { start: "book", path: ["cover", "story", "time"], end: "machine" },
    { start: "car", path: ["seat", "belt", "loop"], end: "hole" },
    { start: "road", path: ["map", "key", "chain"], end: "reaction" },
];


// DOM Elements
const puzzleContainer = document.getElementById("puzzle-container");
const resultBanner = document.getElementById("result-banner");
const levelDisplay = document.getElementById("level-display");
const checkButton = document.getElementById("check-button");
const triesDisplay = document.getElementById("tries-display");

// State for levels and submissions
let currentLevel = 0;
let remainingTries = 4;

// Load a puzzle by level
function loadPuzzle(level) {
    const puzzle = wordConnections[level];
    if (!puzzle) {
        resultBanner.textContent = "🎉 Congratulations! You completed all levels! 🎉";
        resultBanner.style.display = "block";
        checkButton.style.display = "none";
        return;
    }

    // Reset tries
    remainingTries = 4;

    // Update level and tries display
    levelDisplay.textContent = `Level ${level + 1}`;
    triesDisplay.textContent = `Tries Left: ${remainingTries}`;

    // Create puzzle layout
    puzzleContainer.innerHTML = ""; // Clear previous puzzle
    createWordBoxes(puzzle.start, true); // Start word

    puzzle.path.forEach((word) => createWordBoxes(word, false)); // Intermediate words

    createWordBoxes(puzzle.end, true); // End word
    resultBanner.style.display = "none"; // Hide the win banner
}

function createWordBoxes(word, isFixed) {
    const wordDiv = document.createElement("div");
    wordDiv.classList.add("word-row");

    [...word].forEach((letter) => {
        const letterBox = document.createElement("input");
        letterBox.type = "text";
        letterBox.maxLength = 1;
        letterBox.classList.add("letter-box");

        // Fixed letters remain disabled
        if (isFixed) {
            letterBox.value = letter.toUpperCase();
            letterBox.disabled = true;
            letterBox.classList.add("fixed-letter");
        } else {
            // Handle key presses
            letterBox.addEventListener("keydown", (e) => handleKeyPress(e, wordDiv, letterBox));
        }

        wordDiv.appendChild(letterBox);
    });

    puzzleContainer.appendChild(wordDiv);
}



// Handle key presses to set the letter and navigate
function handleKeyPress(event, wordDiv, currentBox) {
    const key = event.key.toUpperCase();
    const currentWordBoxes = Array.from(wordDiv.children);
    const currentIndex = currentWordBoxes.indexOf(currentBox);
    const allBoxes = Array.from(document.querySelectorAll(".letter-box"));
    const currentBoxIndex = allBoxes.indexOf(currentBox);

    // Handle Delete and Backspace
    if (event.key === "Backspace") {
        if (currentIndex > 0) {
            currentWordBoxes[currentIndex].value = ""; // Clear the box
            currentWordBoxes[currentIndex - 1].focus(); // Move focus to the previous box
        } else {
            const prevWordDiv = wordDiv.previousElementSibling;
            if (prevWordDiv) {
                const lastBox = prevWordDiv.children[prevWordDiv.children.length - 1];
                lastBox.value = ""; // Clear the last box in the previous row
                lastBox.focus(); // Move focus to the last box in the previous row
            }
        }
        event.preventDefault();
        return;
    }

    if (event.key === "Delete") {
        currentBox.value = ""; // Clear the current box
        event.preventDefault();
        return;
    }

    // Allow only letters to be entered
    if (key.length === 1 && key.match(/[A-Z]/)) {
        currentBox.value = key; // Set the box text to the pressed key

        // Move to the next box
        if (currentIndex < currentWordBoxes.length - 1) {
            currentWordBoxes[currentIndex + 1].focus();
        } else {
            const nextWordDiv = wordDiv.nextElementSibling;
            if (nextWordDiv) {
                nextWordDiv.children[0].focus();
            } else {
                // Go back to the first box if no next word
                allBoxes[0].focus();
            }
        }
    }

    // Prevent default behavior for key presses
    event.preventDefault();
}

// Check the user's solution
function checkSolution() {
    const currentPuzzle = wordConnections[currentLevel];
    const userWords = Array.from(puzzleContainer.children)
        .slice(1, -1) // Skip the first and last words
        .map((wordDiv) =>
            Array.from(wordDiv.children)
                .map((input) => input.value.trim().toLowerCase())
                .join("")
        );

    const correctWords = currentPuzzle.path;

    let isComplete = true;

    // Highlight correct letters
    puzzleContainer.querySelectorAll(".word-row").forEach((wordDiv, rowIndex) => {
        Array.from(wordDiv.children).forEach((input, charIndex) => {
            if (rowIndex > 0 && rowIndex <= correctWords.length) {
                const correctWord = correctWords[rowIndex - 1];
                if (input.value.toLowerCase() === correctWord[charIndex]) {
                    input.style.backgroundColor = "#a8d5a2"; // Washed-out green for correct letters
                } else {
                    input.style.backgroundColor = ""; // Reset color
                    isComplete = false;
                }
            }
        });
    });

    if (isComplete) {
        resultBanner.textContent = " Correct! ";
        resultBanner.style.display = "block";
        setTimeout(() => {
            currentLevel++;
            loadPuzzle(currentLevel);
        }, 1500);
        return;
    }

    // Decrease tries
    remainingTries--;
    triesDisplay.textContent = `Tries Left: ${remainingTries}`;

    if (remainingTries <= 0) {
        resultBanner.textContent = "❌ Out of tries! Reloading level... ❌";
        resultBanner.style.display = "block";
        setTimeout(() => loadPuzzle(currentLevel), 1500);
    }
}

// Add event listener to the check button
checkButton.addEventListener("click", checkSolution);

// Load the first puzzle on page load
window.addEventListener("load", () => loadPuzzle(currentLevel));
