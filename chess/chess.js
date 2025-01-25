// Chess game rewritten in JavaScript for web compatibility
import { getValidMoves } from './moves.js';

const canvas = document.getElementById('chessCanvas');
const ctx = canvas.getContext('2d');
const SQUARE_SIZE = 100;
const ROWS = 8;
const COLS = 8;
const WHITE = '#FFAFAF';
const GRAY = '#802828';
const HIGHLIGHT = 'yellow';

let board = [
    ['n', 'b', 'r', 'q', 'k', 'r', 'b', 'n'],
    ['p', 'p', 'p', ' ', ' ', 'p', 'p', 'p'],
    ['p', ' ', ' ', ' ', ' ', ' ', ' ', 'p'],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    ['P', ' ', ' ', ' ', ' ', ' ', ' ', 'P'],
    ['P', 'P', 'P', ' ', ' ', 'P', 'P', 'P'],
    ['N', 'B', 'R', 'Q', 'K', 'R', 'B', 'N']
];

let turn = 'white';
let selectedPiece = null;
let startLocation = null;
let validMoves = [];
let lastMove = null;

const images = {};
const pieceOrder = ['k', 'q', 'b', 'n', 'r', 'p'];
const pieceScores = { 'K': 3, 'Q': 9, 'R': 5, 'B': 3, 'N': 3, 'P': 1 };

function loadImages(callback) {
    const SPRITE_SHEET = new Image();
    SPRITE_SHEET.src = './assets/ChessPiecesArray.png';

    const SPRITE_WIDTH = 100;
    const SPRITE_HEIGHT = 100;
    let loadedCount = 0; // Track loaded pieces

    SPRITE_SHEET.onload = () => {
        ['white', 'black'].forEach((color, rowIndex) => {
            pieceOrder.forEach((piece, colIndex) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = SPRITE_WIDTH;
                canvas.height = SPRITE_HEIGHT;

                const x = colIndex * SPRITE_WIDTH;
                const y = rowIndex * SPRITE_HEIGHT;

                ctx.drawImage(SPRITE_SHEET, x, y, SPRITE_WIDTH, SPRITE_HEIGHT, 0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
                const img = new Image();
                img.src = canvas.toDataURL();

                img.onload = () => {
                    if (color === 'white') {
                        images[`${piece.toUpperCase()}`] = img; // White pieces
                    } else {
                        images[`${piece.toLowerCase()}`] = img; // Black pieces
                    }
                    loadedCount++;
                    // If all pieces are loaded, trigger callback
                    if (loadedCount === pieceOrder.length * 2) {
                        callback();
                    }
                };

                img.onerror = () => console.error(`Failed to load image for ${piece}`);
            });
        });
    };

    SPRITE_SHEET.onerror = () => console.error('Failed to load sprite sheet!');
}


function drawBoard() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const color = (row + col) % 2 === 0 ? WHITE : GRAY;
            ctx.fillStyle = color;
            ctx.fillRect(col * SQUARE_SIZE, row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
        }
    }
}

function drawPieces() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const piece = board[row][col];
            if (piece !== ' ') {
                if (images[piece]) {
                    ctx.drawImage(
                        images[piece], 
                        col * SQUARE_SIZE, 
                        row * SQUARE_SIZE, 
                        SQUARE_SIZE, 
                        SQUARE_SIZE
                    );
                } else {
                    console.warn(`Image not found for piece: ${piece}`);
                }
            }
        }
    }
}


function highlightSquare(row, col, color = 'yellow') {
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.5; // Transparency for highlighting
    ctx.fillRect(col * SQUARE_SIZE, row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
    ctx.globalAlpha = 1.0; // Reset transparency
}


function movePiece(start, end) {
    const piece = board[start.row][start.col];
    board[start.row][start.col] = ' ';
    board[end.row][end.col] = piece;
    checkForPromotion(end, piece);
}

function isValidMove(row, col) {
    return row >= 0 && row < ROWS && col >= 0 && col < COLS;
}

function evaluateMove(board, move) {
    if (!isValidMove(move.row, move.col)) {
        return -Infinity;
    }
    const target = board[move.row][move.col];
    return target && target !== ' ' ? pieceScores[target.toUpperCase()] || 0 : 0;
}

function computerMove() {
    let bestMove = null;
    let bestScore = -Infinity;

    // Piece scores for evaluation

    // Evaluate opponent's best response for a given board state
    function opponentBestResponse(board) {
        let maxScore = 0;
        for (let orow = 0; orow < ROWS; orow++) {
            for (let ocol = 0; ocol < COLS; ocol++) {
                const opiece = board[orow][ocol];
                if (opiece === opiece.toUpperCase()) { // White pieces
                    const oppMoves = getValidMoves(board, opiece, orow, ocol, 'all');
                    for (const oppMove of oppMoves) {
                        const target = board[oppMove.row][oppMove.col];
                        if (target !== ' ' && target.toLowerCase() !== opiece.toLowerCase()) {
                            maxScore = Math.max(maxScore, pieceScores[target.toUpperCase()] || 0);
                        }
                    }
                }
            }
        }
        return maxScore;
    }

    // Iterate through all black pieces
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const piece = board[row][col];
            if (piece === piece.toLowerCase()) { // Black pieces
                const moves = getValidMoves(board, piece, row, col, 'all');
                for (const move of moves) {
                    const score = evaluateMove(board, move);
                    if (score < -40 ) {
                        continue;
                    }

                    // Simulate the move
                    const originalPiece = board[move.row][move.col];
                    board[move.row][move.col] = piece;
                    board[row][col] = ' ';

                    // Evaluate opponent's response only if the current move improves score
                    const opponentScore = score > bestScore ? opponentBestResponse(board) : 0;

                    // Restore the board state
                    board[row][col] = piece;
                    board[move.row][move.col] = originalPiece;

                    // Calculate net score
                    const netScore = score - opponentScore;

                    // Update best move
                    if (netScore > bestScore) {
                        bestScore = netScore;
                        bestMove = { from: { row, col }, to: { row: move.row, col: move.col } };
                    }
                }
            }
        }
    }
    // Execute the best move or default to the first available move
    if (!bestMove) {
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                const piece = board[row][col];
                if (piece === piece.toLowerCase()) {
                    const moves = getValidMoves(board, piece, row, col, 'all');
                    if (moves.length > 0) {
                        bestMove = { from: { row, col }, to: { row: moves[0].row, col: moves[0].col } };
                        break;
                    }
                }
            }
        }
    }

    movePiece(bestMove.from, bestMove.to);
    highlightSquare(bestMove.from.row, bestMove.from.col, 'green');
    changeTurn();
    return bestMove.to;
}


function isValidTurn(piece) {
    if (turn === 'white') {
        return piece === piece.toUpperCase();
    } else {
        return piece === piece.toLowerCase();
    }
}

function changeTurn() {
    turn = turn === 'white' ? 'black' : 'white';
}

function promotePawn(row, col) {
    const color = turn === 'white' ? 'white' : 'black';
    const choice = prompt("Promote to Knight (N) or Bishop (B)?", 'B').toUpperCase();
    let promotedPiece = null;
    if (choice === 'N') {
        promotedPiece = turn === 'white' ? 'N' : 'n';
    } else {
        promotedPiece = turn === 'white' ? 'B' : 'b';
    }
    board[row][col] = promotedPiece;
}

function checkForPromotion(move, piece) {
    if ('Pp'.includes(piece) && (move.row === 0 || move.row === 7)) {
        promotePawn(move.row, move.col);
    }
}

function checkForWin() {
    // a side wins if all of the other side's non-pawn pieces are captured
    let whitePieces = 0;    
    let blackPieces = 0;

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const piece = board[row][col];
            if (piece !== ' ' && piece.toLowerCase() !== 'p') {
                if (piece === piece.toUpperCase()) { 
                    whitePieces++;
                } else if (piece === piece.toLowerCase()) { 
                    blackPieces++;
                }
            }
        }
    }
    if (blackPieces === 0) {
        alert('White wins!');
        location.reload();
    }
    else if (whitePieces === 0) {
        alert('Black wins!');
        // reload the game
        location.reload();
    } 
    
}
                


canvas.addEventListener('click', (event) => {

    const rect = canvas.getBoundingClientRect(); // Get size and position of canvas
    const scaleX = canvas.width / rect.width;   // Calculate horizontal scale
    const scaleY = canvas.height / rect.height; // Calculate vertical scale

    // Adjust mouse coordinates based on scale
    const col = Math.floor((event.clientX - rect.left) * scaleX / SQUARE_SIZE);
    const row = Math.floor((event.clientY - rect.top) * scaleY / SQUARE_SIZE);

    let movedPiece = null

    const piece = board[row][col];

    if (selectedPiece && validMoves.length) {
        // Check if clicked square is a valid move
        const move = validMoves.find(m => m.row === row && m.col === col);
        if (move) {
            movePiece(selectedPiece, { row, col });
            changeTurn() ; // Change turn after move
            movedPiece =  { row, col }
        }

        // Clear selection
        selectedPiece = null;
        validMoves = [];
    } else if (piece !== ' ' && isValidTurn(piece)) {
        // Select piece and show valid moves
        selectedPiece = { row, col };
        validMoves = getValidMoves(board, piece, row, col, 'all');
    }

    if (turn === 'black') {
        movedPiece = computerMove();
    }


    drawBoard();
    drawPieces();

    if (movedPiece) {
        highlightSquare(movedPiece.row, movedPiece.col, 'green');
        setTimeout(() => checkForWin(), 100);
    }

    // Highlight selected piece
    if (selectedPiece) {
        highlightSquare(selectedPiece.row, selectedPiece.col, 'green');
    }

    // Highlight valid moves
    validMoves.forEach(move => {
        if (move.type === 'capture') {
            highlightSquare(move.row, move.col, 'red');
        } else {    
            highlightSquare(move.row, move.col);
        }
    });
});


function initialize() {
    drawBoard();
    drawPieces();
    //requestAnimationFrame(gameLoop);
}

loadImages(() => {
    initialize(); // Start the game loop after images are ready
});
