async function createBoard() {
    responseInfo = await getBoard()
    let board = responseInfo.board

    window.turn = responseInfo.turn

    turn = window.turn

    let turns = document.getElementById('turns')
    if (turn == true) {
        turns.innerText = "White's Turn ⚪"
    }
    else {
        turns.innerHTML = "Black's Turn ⚫"
    }

    const aiCol = document.getElementById('aiCol').innerText
    if (aiCol !== 'None') {
        getAiMove(aiCol)
    }


    window.boardVar = board

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let sqColor
            let uiNum
            let uiLet
            if ((i + j) % 2 == 0) {
                sqColor = 'light'
            }
            else {
                sqColor = 'dark'
            }
            piece = board[i][j]
            cords = i + "" + j
            if (j == 0) {
                uiNum = 8 - i
            }
            if (i == 7) {
                uiLet = String.fromCharCode(97 + j)
            }
            drawSquares(sqColor, piece, cords, uiNum, uiLet)
        }
    }

}

createBoard()


// sends get request to get the board position
async function getBoard() {
    let board;

    await $.get('/board', function (data) {
        reData = data
    })
    return reData
}


// get the legal moves.
function getMoves(sqId) {
    const formdata = new FormData()
    const csrf = document.getElementsByName('csrfmiddlewaretoken')
    formdata.append('csrfmiddlewaretoken', csrf[0].value)
    formdata.append('sqId', sqId)

    $.ajax({
        type: "POST",
        url: "/board",
        enctype: 'multipart/form-data',
        data: formdata,
        success: function (res) {
            if (res.checkMate == true) {
                checkMateHandler('c')
            }
            if (res.draw == true) {
                checkMateHandler('s')
            }
            highlightAvailableMoves(res.moves)
            drawcaptureStatus(res.captureStatus)
        },

        cache: false,
        contentType: false,
        processData: false,

    });
}

function getAiMove(aiCol) {
    const formdata = new FormData()
    const csrf = document.getElementsByName('csrfmiddlewaretoken')

    formdata.append('csrfmiddlewaretoken', csrf[0].value)
    formdata.append('aiCol', aiCol)
    $.ajax({
        type: "POST",
        url: "/board",
        enctype: 'multipart/form-data',
        data: formdata,
        success: function (res) {
            removeLastMoveHighlight()
            window.turn = res.turn
            compareBoard(res.board)
        },


        cache: false,
        contentType: false,
        processData: false,

    });
}

// Send the new piece places
function sendNewPlace(oldID, newID) {
    const aiCol = document.getElementById('aiCol').innerText;
    const formdata = new FormData();
    const csrf = document.getElementsByName('csrfmiddlewaretoken');

    formdata.append('csrfmiddlewaretoken', csrf[0].value);
    formdata.append('newSqId', newID);
    formdata.append('oldSqId', oldID);

    $.ajax({
        type: "POST",
        url: "/board",
        enctype: 'multipart/form-data',
        data: formdata,
        success: function (res) {
            removeLastMoveHighlight();
            window.turn = res.turn;
            compareBoard(res.board);

            console.log("Server Response:", res);

            // ✅ Display Opening Name in UI
            if (res.opening) {
                console.log("Detected Opening:", res.opening);
                document.getElementById("opening-name").innerText = res.opening;
            } else {
                console.log("No Opening Detected");
            }

            // ✅ Make AI Move if Playing Against AI
            if (aiCol !== 'None') {
                getAiMove(aiCol);
            }
        },

        cache: false,
        contentType: false,
        processData: false,
    });
}



// 

function drawImages(piece) {
    const isUpperCase = (string) => /^[A-Z]*$/.test(string)
    let color
    if (isUpperCase(piece)) {
        color = 'w'
    }
    else {
        color = 'b'
    }

    const piecee = piece.toUpperCase()
    if (piece) {
        return `images/${color}${piecee}.png`
    }
}

function drawSquares(sqColor, piece, cords, uiNum, uiLet) {

    let board = document.getElementById('board')
    let square = document.createElement('div')

    square.classList.add('square', sqColor)
    square.id = cords
    board.appendChild(square)

    let squarePieceName = document.createElement('p')
    squarePieceName.innerText = piece
    square.appendChild(squarePieceName)

    if (drawImages(piece)) {
        let img = document.createElement('img')
        img.src = drawImages(piece)
        square.appendChild(img)
    }

    // Draw the board Cordiants 
    if (uiNum) {
        let cordNumber = document.createElement('span')
        cordNumber.classList.add('uiNum')
        cordNumber.innerText = uiNum
        square.appendChild(cordNumber)
    }

    if (uiLet) {
        let cordLetter = document.createElement('span')
        cordLetter.classList.add('uiLet')
        cordLetter.innerText = uiLet
        square.appendChild(cordLetter)
    }


    // handle the click events
    square.addEventListener('click', function () {
        let selected = document.querySelectorAll('.selected')
        let highlighted = document.querySelectorAll('.highlightAvailable')
        pieceClickHandler(this, selected, highlighted)
    })
}


function pieceClickHandler(selectedPiece, selected, highlighted) {
    turn = window.turn

    if (selectedPiece.classList.contains('highlightAvailable')) {
        sendNewPlace(selected[0].id, selectedPiece.id)
    }
    removeHighlights(selected, highlighted)
    if (upInverse(turn, selectedPiece.innerText)) {
        selectedPiece.classList.add('selected')
        getMoves(selectedPiece.id)

    }
}



function removeHighlights(selected, highlighted) {
    selected.forEach(function (sq) {
        sq.classList.remove('selected')
    })
    highlighted.forEach(function (sq) {
        sq.classList.remove('highlightAvailable')
    })
}


function highlightAvailableMoves(moves) {
    for (let move in moves) {
        let square = document.getElementById(moves[move])
        square.classList.add('highlightAvailable')
    }
}

function movePieces(differences, newBoard) {
    for (let i = 0; i < differences.length; i++) {
        let square = document.getElementById(differences[i]['c'])
        let squareText = square.querySelector('p')
        let SquareImage = square.querySelector('img')
        let squareNewImage = document.createElement('img')

        if (differences[i]['n'] !== "") {
            squareNewImage.src = drawImages(differences[i]['n'])
            square.appendChild(squareNewImage)

            if (SquareImage) {
                square.removeChild(SquareImage)
            }
            squareText.innerText = differences[i]['n']

        }
        else {
            square.removeChild(SquareImage)
            squareText.innerText = differences[i]['n']
        }
        window.boardVar = newBoard
    }

    turn = window.turn
    let turns = document.getElementById('turns')
    if (turn == true) {
        turns.innerText = "White's Turn ⚪"
    }
    else {
        turns.innerHTML = "Black's Turn ⚫"
    }


}

function compareBoard(newBoard) {
    oldBoard = window.boardVar
    changesArr = []

    for (let i = 0; i < newBoard.length; i++) {
        for (let j = 0; j < newBoard[i].length; j++) {
            if (newBoard[i][j] !== oldBoard[i][j]) {
                changesArr.push({ 'o': oldBoard[i][j], 'n': newBoard[i][j], 'c': String(i) + String(j) })
            }

        }
    }
    lastMoveHighlight(changesArr)
    movePieces(changesArr, newBoard)
}

function lastMoveHighlight(changesArr) {
    // recentlyMoved
    for (let i = 0; i < changesArr.length; i++) {
        let square = document.getElementById(changesArr[i]['c'])
        square.classList.add('recentlyMoved')
    }

}

function removeLastMoveHighlight() {
    let lastMoves = document.querySelectorAll('.recentlyMoved')
    lastMoves.forEach(function (sq) {
        sq.classList.remove('recentlyMoved')
    })
}

function upInverse(switcher, string) {
    const isUpperCase = (string) => /^[A-Z]*$/.test(string)

    if (switcher == true) {
        return isUpperCase(string[0])
    }
    else if (switcher == false) {

        if (string) {
            return !isUpperCase(string[0])
        }
    }

}

function checkMateHandler(checker) {
    togglePopup()
    let win = ''
    if (checker == 'c') {
        if (window.turn == true) {
            win = 'black won by checkmate'
        }
        else {
            win = 'white won by checkmate'
        }
    }
    if (checker == 'd') {
        win = 'Draw'
    }
    document.getElementById("winner").innerText = win
}

function drawcaptureStatus(captureStatus) {
    let darkStatus = document.getElementById('darkStatus')
    let lightStatus = document.getElementById('lightStatus')

    darkStatus.innerHTML = '<h2>Captured Pieces:</h2>'
    lightStatus.innerHTML = '<h2>Captured Pieces:</h2>'
    // Dark

    for (let i = 0; i < captureStatus[0].length; i++) {
        let image = document.createElement('img')
        image.classList.add('captured-piece')
        image.src = drawImages(captureStatus[0][i])

        darkStatus.appendChild(image)

    }


    // Light

    for (let i = 0; i < captureStatus[1].length; i++) {
        let image = document.createElement('img')
        image.classList.add('captured-piece')
        image.src = drawImages(captureStatus[1][i])
        lightStatus.appendChild(image)

    }
}

function togglePopup() {
    document.getElementById("popup-1").classList.toggle("active");
}

function sendMessage() {
    const user_input = document.getElementById("user_input").value;  // Get user input from the chat box
    document.getElementById("user_input").value = '';

    // Only proceed if the input is not empty
    if (user_input.trim() !== "") {
        // Append the user message to the chatlogs
        const chatlogs = document.getElementById("chatlogs");
        chatlogs.innerHTML += "<p><strong>User:</strong> " + user_input + "</p>";
        
        // Send the user input to the Django backend using fetch and JSON
        fetch('/chat_with_ai/', {  // Call the Django view that interacts with OpenRouter AI
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,  // CSRF token for security
            },
            body: JSON.stringify({ 'user_input': user_input })  // Send the input as JSON
        })
        .then(response => response.json())
        .then(data => {
            // Append the AI's response to the chatlogs
            chatlogs.innerHTML += "<p><strong>AI:</strong> " + data.ai_response + "</p>";

            // Scroll to the bottom of the chatlogs
            chatlogs.scrollTop = chatlogs.scrollHeight;
        });
    } else {
        alert("Please type a message!");
    }
}
