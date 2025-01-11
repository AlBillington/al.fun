// Hey! No peeking! 😠
const wordConnections = [
    { start: "race", path: ["car", "pool"] },
    { start: "snow", path: ["man", "cave", "painting"] },
    { start: "dog", path: ["house", "party", "dress"] },
    { start: "light", path: ["bulb", "socket", "wrench"] },
    { start: "paper", path: ["trail", "mix", "tape"] },
    { start: "apple", path: ["pie", "dish", "soap"] },
    { start: "moon", path: ["rock", "climbing", "gear"] },
    { start: "tree", path: ["house", "party", "trick"] },
    { start: "fire", path: ["alarm", "clock", "tower"] },
    { start: "road", path: ["map", "key", "chain", "reaction"] },
    { start: "book", path: ["cover", "story", "time", "machine"] },
    { start: "car", path: ["seat", "belt", "loop", "hole"] },
    { start: "road", path: ["map", "key", "chain", "reaction"] }
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
    createWordBoxes(puzzle.start, true); // Start word (prefilled and fixed)

    puzzle.path.forEach((word, index) => {
        // Prefill the first letter for each word except the first
        const isLast = index === puzzle.path.length - 1;
        createWordBoxes(word, false, isLast);
    });

    resultBanner.style.display = "none"; // Hide the win banner
}

function createWordBoxes(word, isFixed, isLast = false) {
    const wordDiv = document.createElement("div");
    wordDiv.classList.add("word-row");

    [...word].forEach((letter, index) => {
        const letterBox = document.createElement("input");
        letterBox.type = "text";
        letterBox.maxLength = 1;
        letterBox.classList.add("letter-box");

        if (isFixed || (index === 0)) {
            letterBox.value = letter.toUpperCase(); // Prefill the first letter
            letterBox.disabled = true; // Disable editing
            letterBox.classList.add("fixed-letter");
        } else {
            // For the last word, user must fill in the rest of the letters
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
        currentWordBoxes[currentIndex].value = ""; // Clear the box
        if (currentIndex > 0) {
            currentWordBoxes[currentIndex - 1].focus(); // Move focus to the previous box
        } else {
            const prevWordDiv = wordDiv.previousElementSibling;
            if (prevWordDiv) {
                const lastBox = prevWordDiv.children[prevWordDiv.children.length - 1];
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
    const correctWords = [...currentPuzzle.path]; // Get all words (path)
    const userWords = []; // Collect user inputs for validation

    // Extract user inputs from the puzzle container
    const wordRows = Array.from(puzzleContainer.children).slice(1); // Skip the first (start word)
    wordRows.forEach((wordDiv) => {
        const userWord = Array.from(wordDiv.children)
            .map((input) => input.value.trim().toLowerCase())
            .join("");
        userWords.push(userWord);
    });

    // Highlight letters and validate words
    let isComplete = true; // Check if the puzzle is fully correct
    wordRows.forEach((wordDiv, rowIndex) => {
        const correctWord = correctWords[rowIndex];
        Array.from(wordDiv.children).forEach((input, charIndex) => {
            if (charIndex === 0) return; // Skip the first letter
            if (input.value.toLowerCase() === correctWord[charIndex]) {
                input.style.backgroundColor = "#a8d5a2"; // Correct letters in washed-out green
            } else {
                input.style.backgroundColor = ""; // Reset color for incorrect letters
                isComplete = false; // Mark the puzzle as incomplete
            }
        });
    });

    // Check if all words match
    const allWordsCorrect = userWords.every((word, index) => word === correctWords[index]);

    if (allWordsCorrect && isComplete) {
        resultBanner.textContent = "🎉 Correct! Loading next level... 🎉";
        resultBanner.style.display = "block";
        setTimeout(() => {
            currentLevel++;
            loadPuzzle(currentLevel);
        }, 1500);
    } else {
        // Decrease tries if the puzzle isn't solved
        remainingTries--;
        triesDisplay.textContent = `Tries Left: ${remainingTries}`;

        if (remainingTries <= 0) {
            resultBanner.textContent = "Out of tries! Reloading level...";
            resultBanner.style.display = "block";
            setTimeout(() => loadPuzzle(currentLevel), 1500);
        }
    }
}

// Add event listener to the check button
checkButton.addEventListener("click", checkSolution);

// Load the first puzzle on page load
window.addEventListener("load", () => loadPuzzle(currentLevel));
