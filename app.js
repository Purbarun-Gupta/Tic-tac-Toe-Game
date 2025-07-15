let boxes = document.querySelectorAll(".box");
let resetBtn = document.querySelector(".reset-button");
let newGameBtn = document.querySelector(".new-button");
let msgContainer = document.querySelector(".msg-container");
let msg = document.querySelector("#msg");
let turnIndicator = document.querySelector("#turn-indicator");

let turnO = true; // true = O (You), false = X (AI)
let moveCount = 0;
let gameOver = false;

const winPatterns = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const resetGame = () => {
  turnO = true;
  moveCount = 0;
  gameOver = false;
  enableBoxes();
  msgContainer.classList.add("hide");
  turnIndicator.innerText = "Turn: O";
};

const disableBoxes = () => {
  boxes.forEach((box) => box.disabled = true);
};

const enableBoxes = () => {
  boxes.forEach((box) => {
    box.disabled = false;
    box.innerText = "";
    box.classList.remove("win");
  });
};

const showWinner = (winner, pattern) => {
  msg.innerText = `🎉 Winner: ${winner}`;
  msgContainer.classList.remove("hide");
  turnIndicator.innerText = "";
  pattern.forEach(index => boxes[index].classList.add("win"));
  disableBoxes();
  gameOver = true;

  // 🎆 Fireworks only when player O wins
  if (winner === "O" && typeof confetti === "function") {
    const duration = 1500;
    const end = Date.now() + duration;
    const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];

    (function firework() {
      confetti({
        particleCount: 40,
        angle: 60 + Math.random() * 60,
        spread: 70,
        origin: { x: Math.random(), y: Math.random() * 0.5 },
        colors: colors,
      });
      if (Date.now() < end) {
        requestAnimationFrame(firework);
      }
    })();
  }
};



const checkWinner = () => {
  for (let pattern of winPatterns) {
    let [a, b, c] = pattern;
    let val1 = boxes[a].innerText;
    let val2 = boxes[b].innerText;
    let val3 = boxes[c].innerText;

    if (val1 && val1 === val2 && val2 === val3) {
      showWinner(val1, pattern);
      return true;
    }
  }

  if (moveCount === 9) {
    msg.innerText = "😐 It's a Draw!";
    msgContainer.classList.remove("hide");
    turnIndicator.innerText = "";
    gameOver = true;
    disableBoxes();

    // 🎆 Firework confetti on draw
    if (typeof confetti === "function") {
      // Fireworks burst at multiple positions
      const duration = 1500;
      const end = Date.now() + duration;

      const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];

      (function firework() {
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 55,
          origin: { x: Math.random(), y: Math.random() * 0.5 },
          colors: colors,
        });
        if (Date.now() < end) {
          requestAnimationFrame(firework);
        }
      })();
    }

    return true;
  }

  return false;
};


// AI move with medium difficulty
const aiMove = () => {
  if (gameOver) return;

  const tryToWinOrBlock = (symbol) => {
    for (let pattern of winPatterns) {
      let [a, b, c] = pattern;
      let values = [boxes[a].innerText, boxes[b].innerText, boxes[c].innerText];
      let counts = values.filter(v => v === symbol).length;
      let emptyIndex = [a, b, c].find(i => boxes[i].innerText === "");

      if (counts === 2 && emptyIndex !== undefined) {
        return emptyIndex;
      }
    }
    return null;
  };

  // 1. Try to win
  let winIndex = tryToWinOrBlock("X");
  if (winIndex !== null) {
    makeAIMove(winIndex);
    return;
  }

  // 2. Try to block opponent's win
  let blockIndex = tryToWinOrBlock("O");
  if (blockIndex !== null) {
    makeAIMove(blockIndex);
    return;
  }

  // 3. Else, choose random
  let emptyBoxes = [];
  boxes.forEach((box, index) => {
    if (box.innerText === "") emptyBoxes.push(index);
  });

  if (emptyBoxes.length === 0) return;
  let randomIndex = emptyBoxes[Math.floor(Math.random() * emptyBoxes.length)];
  makeAIMove(randomIndex);
};

const makeAIMove = (index) => {
  let box = boxes[index];
  box.innerText = "X";
  box.disabled = true;
  moveCount++;

  if (!checkWinner()) {
    turnO = true;
    turnIndicator.innerText = "Turn: O";
  }
};

// Human move
boxes.forEach((box) => {
  box.addEventListener("click", () => {
    if (gameOver || box.innerText !== "" || !turnO) return;

    box.innerText = "O";
    box.disabled = true;
    moveCount++;

    if (!checkWinner()) {
      turnO = false;
      turnIndicator.innerText = "AI is thinking...";
      setTimeout(aiMove, 700); // Delay for realism
    }
  });
});

// Button listeners
resetBtn.addEventListener("click", resetGame);
if (newGameBtn) {
  newGameBtn.addEventListener("click", resetGame);
}
