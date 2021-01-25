"use strict";

let boardHeight = 0;
let boardWidth = 0;
let inARowToWin = 0;

//
// -------------------------------------------------------------------------------------
//

/* Dynamically create the cells of the playing field with JS. */
const rowExpansion = (value) => {
  if (value <= 2) {
    document.querySelector("div #messagePromt").innerHTML = "Select a value above: 2";
    return;
  } else document.querySelector("div #messagePromt").innerHTML = "";

  // If board already has been created.
  if (boardHeight !== 0 && value !== "") {
    boardHeight = 0;
    boardWidth = 0;
    document.querySelectorAll("div div .cell").forEach((n) => n.remove());
    document.querySelectorAll("div div br").forEach((n) => n.remove());
  }

  // If rowExpansion is called before colExpansion. (Common user behaviour)
  if (boardWidth == 0) {
    for (let i = 0; i < value; i++) {
      let div = document.createElement("div");
      div.className = "cell";
      div.id = i;
      document.getElementById("board").appendChild(div);
      document.getElementById("board").appendChild(document.createElement("br"));
    }
  }

  // If rowExpansion is called after colExpansion. (Uncommon user behaviour)
  if (boardWidth !== 0) {
    [...document.querySelectorAll("div div .cell")].map((element, elementId) => {
      element.insertAdjacentElement("afterend", document.createElement("br"));
      for (let i = value - 1; i > 0; i--) {
        let div = document.createElement("div");
        div.className = "cell";
        div.id = parseFloat(boardWidth * i) + parseFloat(elementId);
        element.insertAdjacentElement("afterend", div);
      }
    });
  }

  boardHeight = value;
  document.querySelector("div span #inputRow").value = "";
  document.querySelector("div span #inputRow").placeholder = value;
};

//
// -------------------------------------------------------------------------------------
//

const colExpansion = (value) => {
  if (value <= 2) {
    document.querySelector("div #messagePromt").innerHTML = "Select a value above: 2";
    return;
  } else document.querySelector("div #messagePromt").innerHTML = "";

  // If board already has been created.
  if (boardWidth !== 0 && value !== "") {
    boardHeight = 0;
    boardWidth = 0;
    document.querySelectorAll("div div .cell").forEach((n) => n.remove());
    document.querySelectorAll("div div br").forEach((n) => n.remove());
  }

  // If colExpansion is called after rowExpansion. (Common user behaviour)
  if (boardHeight !== 0) {
    [...document.querySelectorAll("div div .cell")].map((element, elementId) => {
      for (let i = value - 1; i > 0; i--) {
        let div = document.createElement("div");
        div.className = "cell";
        div.id = boardHeight * i + elementId;
        element.insertAdjacentElement("afterend", div);
      }
    });
  }

  // If colExpansion is called before rowExpansion. (Uncommon user behaviour)
  if (boardHeight == 0) {
    for (let i = 0; i < value; i++) {
      let div = document.createElement("div");
      div.className = "cell";
      div.id = i;
      document.getElementById("board").appendChild(div);
    }
  }

  boardWidth = value;
  document.querySelector("div span #inputCol").value = "";
  document.querySelector("div span #inputCol").placeholder = value;
};

//
// -------------------------------------------------------------------------------------
//

const winObjective = (value) => {
  if (boardWidth !== 0 && boardHeight !== 0) {
    if (value > Math.min(boardWidth, boardHeight) || value <= 2) {
      inARowToWin = Math.min(boardWidth, boardHeight);
      document.querySelector("div #messagePromt").innerHTML = "Select between: 3 - " + inARowToWin;
    } else {
      inARowToWin = value;
      document.querySelector("div #messagePromt").innerHTML = "";
    }
    document.querySelector("h1").textContent = "Connect " + inARowToWin + " to win";
  }
};

//
// -------------------------------------------------------------------------------------
//

let origBoard;
const startGame = () => {
  if (boardWidth !== 0 && boardHeight !== 0 && inARowToWin != 0) {
    document.querySelector("div span #inputWin").value = "";
    document.querySelectorAll("div span").forEach((n) => n.remove());
    document.querySelectorAll("div button").forEach((n) => n.remove());
    document.querySelector(".overlay").remove();
    document.querySelector(".inGameHeader").textContent = "Connect " + inARowToWin + " to win";
    // Add eventlistener on every cell in on the board.
    document.querySelectorAll("div div .cell").forEach((cell) => cell.addEventListener("click", turnClick, false));

    origBoard = Array.from(Array(boardHeight * boardWidth).keys());
  }
};

//
// -------------------------------------------------------------------------------------
//

document.querySelectorAll("div span input")[0].addEventListener("blur", (event) => rowExpansion(event.target.value));
document.getElementById("inputCol").addEventListener("blur", (event) => colExpansion(event.target.value));
document.getElementById("inputWin").addEventListener("input", (event) => winObjective(event.target.value));
document.getElementById("startGame").addEventListener("click", (event) => startGame(event.target.value));

//
// -------------------------------------------------------------------------------------
//

const player1Marker = "X";
const player2Marker = "O";
let playerTurn = 0;

const turnClick = (cellClicked) => {
  // console.log(cellClicked);
  if (typeof origBoard[cellClicked.target.id] == "number") {
    switch (playerTurn % 2) {
      // Player1Marker = X
      case 0:
        turn(cellClicked.target.id, player1Marker);
        break;
      // Player2Marker = O
      case 1:
        turn(cellClicked.target.id, player2Marker);
        break;
    }
    playerTurn++;
  }
};

const turn = (index, playerSymbol) => {
  origBoard[index] = playerSymbol;
  document.querySelectorAll("div div .cell").forEach((cell) => {
    if (cell.id == index) {
      cell.innerHTML = playerSymbol;
    }
  });
  let gameWon = checkWin(origBoard, playerSymbol, index);
  if (gameWon) {
    console.log(gameWon);
    gameOver(gameWon);
  }
};

const checkWin = (board, player, cellSelected) => {
  // Way to find every index that the player has played in.
  let plays = board.reduce(
    (accumulator, element, index) => (element === player ? accumulator.concat(index) : accumulator),
    []
  );

  let gameWon = null;

  /* console.log("Plays: ");
  console.log(plays);
  console.log("Board: ");
  console.log(board); */

  let connectCounter = 1;
  let checkCellDir1 = cellSelected;
  let checkCellDir2 = cellSelected;
  let connectedIndexes = [];

  // Three for loops to check connections in every possible 45 degree.
  // --- 0° and 180°
  for (let i = 1; i < inARowToWin; i++) {
    // LEFT
    if (Number(checkCellDir1) >= Number(boardHeight)) {
      // Not left edge of board
      checkCellDir1 = Number(checkCellDir1) - Number(boardHeight);
      if (plays.includes(Number(checkCellDir1))) {
        connectCounter++;
        connectedIndexes = [...connectedIndexes, checkCellDir1];
      } else {
        checkCellDir1 = Number.NEGATIVE_INFINITY;
      }
    }
    // RIGHT
    if (Number(checkCellDir2) < Number(boardHeight) * Number(boardWidth - 1)) {
      // Not right edge of board
      checkCellDir2 = Number(checkCellDir2) + Number(boardHeight);
      if (plays.includes(Number(checkCellDir2))) {
        connectCounter++;
        connectedIndexes = [...connectedIndexes, checkCellDir2];
      } else {
        checkCellDir2 = Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (connectCounter >= inARowToWin) {
    // console.log("FIRST LOOP");
    return (gameWon = { player, highlightCells: [...connectedIndexes, Number(cellSelected)] });
  } else {
    connectCounter = 1;
    checkCellDir1 = cellSelected;
    checkCellDir2 = cellSelected;
    connectedIndexes = [];
  }

  // --- 90° and 270°
  for (let i = 1; i < inARowToWin; i++) {
    // UP
    if (Number(checkCellDir1) % boardHeight !== 0) {
      // Not upper edge of the board
      checkCellDir1 = Number(checkCellDir1) - Number(1);
      if (plays.includes(checkCellDir1)) {
        connectCounter++;
        connectedIndexes = [...connectedIndexes, checkCellDir1];
      } else {
        checkCellDir1 = Number.NEGATIVE_INFINITY;
      }
    }
    // DOWN
    if ((checkCellDir2 + 1) % boardHeight !== 0) {
      // Not bottom edge of the board
      checkCellDir2 = Number(checkCellDir2) + 1;
      if (plays.includes(checkCellDir2)) {
        connectCounter++;
        connectedIndexes = [...connectedIndexes, checkCellDir2];
      } else {
        checkCellDir2 = Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (connectCounter >= inARowToWin) {
    // console.log("SECOND LOOP");
    return (gameWon = { player, highlightCells: [...connectedIndexes, Number(cellSelected)] });
  } else {
    connectCounter = 1;
    checkCellDir1 = cellSelected;
    checkCellDir2 = cellSelected;
    connectedIndexes = [];
  }

  // --- 135° and 315°
  for (let i = 1; i < inARowToWin; i++) {
    // DIAGONAL(UP)
    if (Number(checkCellDir1) % boardHeight !== 0 && Number(checkCellDir1) < boardHeight * Number(boardWidth - 1)) {
      // Not upper or right edge of the board
      checkCellDir1 = Number(checkCellDir1) - Number(boardHeight);
      checkCellDir1 = Number(checkCellDir1) - Number(1);
      if (plays.includes(checkCellDir1)) {
        connectCounter++;
        connectedIndexes = [...connectedIndexes, checkCellDir1];
      } else {
        checkCellDir1 = Number.NEGATIVE_INFINITY;
      }
    }
    // DIAGONAL(DOWN)
    if ((checkCellDir2 + 1) % boardHeight !== 0 && checkCellDir2 >= boardHeight) {
      // Not bottom or left edge of the board
      checkCellDir2 = Number(checkCellDir2) + Number(boardHeight);
      checkCellDir2 = Number(checkCellDir2) + Number(1);
      if (plays.includes(checkCellDir2)) {
        connectCounter++;
        connectedIndexes = [...connectedIndexes, checkCellDir2];
      } else {
        checkCellDir2 = Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (connectCounter >= inARowToWin) {
    // console.log("THIRD LOOP");
    return (gameWon = { player, highlightCells: [...connectedIndexes, Number(cellSelected)] });
  } else {
    connectCounter = 1;
    checkCellDir1 = cellSelected;
    checkCellDir2 = cellSelected;
    connectedIndexes = [];
  }

  // --- 215° and 45°
  for (let i = 1; i < inARowToWin; i++) {
    // ANTI-DIAGONAL (DOWN)
    if (Number(checkCellDir1 + 1) % boardHeight !== 0 && Number(checkCellDir1) >= boardHeight) {
      // Not bottom or left edge of the board
      checkCellDir1 = Number(checkCellDir1) - Number(boardHeight);
      checkCellDir1 = Number(checkCellDir1) + Number(1);
      if (plays.includes(checkCellDir1)) {
        connectCounter++;
        connectedIndexes = [...connectedIndexes, checkCellDir1];
      } else {
        checkCellDir1 = Number.NEGATIVE_INFINITY;
      }
    }
    // ANTI-DIAGONAL (UP)
    if (checkCellDir2 % boardHeight !== 0 && checkCellDir2 < boardHeight * Number(boardWidth - 1)) {
      // Not upper or right edge of the board
      checkCellDir2 = Number(checkCellDir2) + Number(boardHeight);
      checkCellDir2 = Number(checkCellDir2) - Number(1);
      if (plays.includes(checkCellDir2)) {
        connectCounter++;
        connectedIndexes = [...connectedIndexes, checkCellDir2];
      } else {
        checkCellDir2 = Number.NEGATIVE_INFINITY;
      }
    }
  }
  if (connectCounter >= inARowToWin) {
    // console.log("FORTH LOOP");
    return (gameWon = { player, highlightCells: [...connectedIndexes, Number(cellSelected)] });
  } else {
    connectCounter = 1;
    checkCellDir1 = cellSelected;
    checkCellDir2 = cellSelected;
    connectedIndexes = [];
  }
};

//
// -------------------------------------------------------------------------------------
//

const gameOver = (gameWon) => {
  document.querySelectorAll("div div .cell").forEach((cell) => {
    if (gameWon.highlightCells.includes(Number(cell.id))) cell.style.backgroundColor = "green";
  });
  document.querySelectorAll("div div .cell").forEach((cell) => cell.removeEventListener("click", turnClick, false));

  document.querySelector(".endgame").style.display = "block";
  document.querySelector(".endgame .text").innerText = gameWon.player == "X" ? "Player X wins!" : "Player O wins!";
  document.querySelector(".endgame .button").innerText = "Play Again";
  document.querySelector(".endgame .button").addEventListener("click", reloadPage, false);
};

const reloadPage = () => {
  document.querySelector(".endgame .button").removeEventListener("click", reloadPage, false);
  location.reload();
};
