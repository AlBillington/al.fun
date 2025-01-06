export function isAdjacent(r1, c1, r2, c2) {
    return Math.abs(r1 - r2) <= 1 && Math.abs(c1 - c2) <= 1;
}

export function isValid(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function pieceColor(piece) {
    return piece === piece.toUpperCase() ? 'white' : 'black';
}

export function getValidMoves(board, piece, row, col, type = 'all') {
    const moves = [];

    function getSquare(r, c) {
        if (isValid(r, c)) {
            return board[r][c];
        }
        return '-';
    }

    function addMove(r, c, moveType) {
        const target = getSquare(r, c);
        if ((moveType === 'normal' && target === ' ') || 
            (moveType === 'capture' && target !== ' ' && pieceColor(target) !== pieceColor(piece))) {
            if (type === 'all' || type === moveType) {
                moves.push({ row: r, col: c, type: moveType });
            }
        }
    }

    if ('Pp'.includes(piece)) { // Pawn
        const step = piece === piece.toUpperCase() ? -1 : 1;
        const startRow = piece === piece.toUpperCase() ? 6 : 1;

        for (let i = 1; i <= 3; i++) {
            const nextRow = row + i * step;
            if (getSquare(nextRow, col) === ' ') {
                addMove(nextRow, col, 'normal');
            } else {
                break;
            }
            if (row !== startRow) break;
        }

        [-1, 0, 1].forEach(dc => {
            if (getSquare(row + step, col + dc) !== ' ' && pieceColor(getSquare(row + step, col + dc)) !== pieceColor(piece)) {
                addMove(row + step, col + dc, 'capture');
            }
        });
    }

    else if ('Nn'.includes(piece)) { // Knight
        for (let l of [1, 2, 3]) {
            const directions = [
                [l, 1], [l, -1], [-l, 1], [-l, -1],
                [1, l], [1, -l], [-1, l], [-1, -l]
            ];
            directions.forEach(([dr, dc]) => {
                const r = row + dr;
                const c = col + dc;
                if (getSquare(r, c) === ' ' || pieceColor(getSquare(r, c)) !== pieceColor(piece)) {
                    addMove(r, c, getSquare(r, c) === ' ' ? 'normal' : 'capture');
                }
            });
        }
    }

    else if ('Bb'.includes(piece)) { // Bishop
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        directions.forEach(([dr1, dc1]) => {
            let r = row, c = col;
            for (let i = 1; i <= 3; i++) {
                r += dr1;
                c += dc1;
                if (getSquare(r, c) === '-') break;
                if (getSquare(r, c) === ' ') {
                    addMove(r, c, 'normal');
                    directions.forEach(([dr2, dc2]) => {
                        let r2 = r, c2 = c;
                        for (let j = 1; j <= 3; j++) {
                            r2 += dr2;
                            c2 += dc2;
                            if (getSquare(r2, c2) === '-') break;
                            if (getSquare(r2, c2) === ' ') {
                                addMove(r2, c2, 'normal');
                            } else if (pieceColor(getSquare(r2, c2)) !== pieceColor(piece)) {
                                addMove(r2, c2, 'capture');
                                break;
                            } else break;
                        }
                    });
                } else if (pieceColor(getSquare(r, c)) !== pieceColor(piece)) {
                    addMove(r, c, 'capture');
                    break;
                } else break;
            }
        });
    }

    else if ('Rr'.includes(piece)) { // Rook
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
        directions.forEach(([dr1, dc1]) => {
            let r = row, c = col;
            for (let i = 1; i <= 3; i++) {
                r += dr1;
                c += dc1;
                if (getSquare(r, c) === '-') break;
                if (getSquare(r, c) === ' ') {
                    addMove(r, c, 'normal');
                    directions.forEach(([dr2, dc2]) => {
                        let r2 = r, c2 = c;
                        for (let j = 1; j <= 3; j++) {
                            r2 += dr2;
                            c2 += dc2;
                            if (getSquare(r2, c2) === '-') break;
                            if (getSquare(r2, c2) === ' ') {
                                addMove(r2, c2, 'normal');
                            } else if (pieceColor(getSquare(r2, c2)) !== pieceColor(piece)) {
                                addMove(r2, c2, 'capture');
                                break;
                            } else break;
                        }
                    });
                } else if (pieceColor(getSquare(r, c)) !== pieceColor(piece)) {
                    addMove(r, c, 'capture');
                    break;
                } else break;
            }
        });
    }

    else if ('Qq'.includes(piece)) { // Queen
        const directions = [
            [1, 0], [-1, 0], [0, 1], [0, -1], // Rook-like moves
            [1, 1], [1, -1], [-1, 1], [-1, -1] // Bishop-like moves
        ];

        directions.forEach(([dr1, dc1]) => {
            let r = row, c = col;
            for (let i = 1; i <= 3; i++) { // First move component (max 3 squares)
                r += dr1;
                c += dc1;
                if (getSquare(r, c) === '-') break;
                addMove(r, c, getSquare(r, c) === ' ' ? 'normal' : 'capture');
                if (getSquare(r, c) !== ' ') break;

                directions.forEach(([dr2, dc2]) => {
                    let r2 = r, c2 = c;
                    for (let j = 1; j <= 5-i; j++) { // Second move component (max 3 squares)
                        r2 += dr2;
                        c2 += dc2;
                        if (getSquare(r2, c2) === '-') break;
                        addMove(r2, c2, getSquare(r2, c2) === ' ' ? 'normal' : 'capture');
                        if (getSquare(r2, c2) !== ' ') break;
                    }
                });
            }
        });
    }

    else if ('Kk'.includes(piece)) { // King
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        directions.forEach(([dr1, dc1]) => {
            let r = row + dr1;
            let c = col + dc1;
            if (getSquare(r, c) === ' ') {
                directions.forEach(([dr2, dc2]) => {
                    let r2 = r + dr2;
                    let c2 = c + dc2;
                    if (getSquare(r2, c2) === ' ' || pieceColor(getSquare(r2, c2)) !== pieceColor(piece)) {
                        // only add it not adjacent to current position
                        if (!isAdjacent(row, col, r2, c2)) {
                            addMove(r2, c2, getSquare(r2, c2) === ' ' ? 'normal' : 'capture');
                        }
                    }
                });
            }
        });
    }

    return moves;
}
