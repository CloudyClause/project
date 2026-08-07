"use strict";


/* ==================================================
   메인 Canvas
================================================== */

const canvas =
  document.getElementById("tetris");

const context =
  canvas.getContext("2d");


/*
  게임판:
  10칸 × 20칸

  Canvas:
  300px × 600px

  한 칸:
  30px × 30px
*/
context.scale(30, 30);


/* ==================================================
   NEXT Canvas
================================================== */

const nextCanvases = [
  document.getElementById("next1"),
  document.getElementById("next2"),
  document.getElementById("next3"),
  document.getElementById("next4"),
  document.getElementById("next5")
];


const nextContexts =
  nextCanvases.map(canvas => {

    const ctx =
      canvas.getContext("2d");

    ctx.scale(20, 20);

    return ctx;

  });


/* ==================================================
   DOM
================================================== */

const scoreElement =
  document.getElementById("score");

const linesElement =
  document.getElementById("lines");

const levelElement =
  document.getElementById("level");

const timerElement =
  document.getElementById("timer");


const pauseButton =
  document.getElementById("pauseButton");

const restartButton =
  document.getElementById("restartButton");


const overlay =
  document.getElementById("gameOverlay");

const overlayTitle =
  document.getElementById("overlayTitle");

const overlayText =
  document.getElementById("overlayText");


/* ==================================================
   블록 색상
================================================== */

const colors = [
  null,

  "#08d9ed", // I
  "#164dff", // J
  "#ff7a00", // L
  "#ffe100", // O
  "#16d72e", // S
  "#c100ee", // T
  "#ff1a1a"  // Z
];


/* ==================================================
   보조 색상
================================================== */

const darkColors = [
  null,

  "#008fa4",
  "#0a2fb2",
  "#b64d00",
  "#b79a00",
  "#078f18",
  "#720092",
  "#ae0909"
];


const lightColors = [
  null,

  "#81ffff",
  "#7294ff",
  "#ffb267",
  "#fff173",
  "#7cff86",
  "#ee80ff",
  "#ff8181"
];


/* ==================================================
   게임판 생성
================================================== */

function createMatrix(width, height) {

  const matrix = [];

  while (height--) {

    matrix.push(
      new Array(width).fill(0)
    );

  }

  return matrix;

}


const arena =
  createMatrix(10, 20);


/* ==================================================
   테트리스 블록
================================================== */

function createPiece(type) {

  switch (type) {

    case "I":

      return [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
      ];


    case "J":

      return [
        [0, 2, 0],
        [0, 2, 0],
        [2, 2, 0]
      ];


    case "L":

      return [
        [0, 3, 0],
        [0, 3, 0],
        [0, 3, 3]
      ];


    case "O":

      return [
        [4, 4],
        [4, 4]
      ];


    case "S":

      return [
        [0, 5, 5],
        [5, 5, 0],
        [0, 0, 0]
      ];


    case "T":

      return [
        [0, 0, 0],
        [6, 6, 6],
        [0, 6, 0]
      ];


    case "Z":

      return [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0]
      ];

  }

}


/* ==================================================
   플레이어
================================================== */

const player = {

  position: {
    x: 0,
    y: 0
  },

  matrix: null,

  score: 0,

  lines: 0,

  level: 1

};


/* ==================================================
   다음 블록 큐
================================================== */

let pieceQueue = [];


function randomPiece() {

  const pieces =
    "IJLOSTZ";

  const random =
    Math.floor(
      Math.random() *
      pieces.length
    );

  return createPiece(
    pieces[random]
  );

}


function fillQueue() {

  while (
    pieceQueue.length < 6
  ) {

    pieceQueue.push(
      randomPiece()
    );

  }

}


/* ==================================================
   상태 변수
================================================== */

let dropCounter = 0;

let dropInterval = 850;

let lastTime = 0;

let isPaused = false;

let gameOverState = false;


/* ==================================================
   타이머
================================================== */

let startTime =
  Date.now();

let pauseStartedAt = 0;

let pausedDuration = 0;


/* ==================================================
   블록 셀 그리기
================================================== */

function drawCell(
  targetContext,
  x,
  y,
  value
) {

  /*
    기본 블록
  */
  targetContext.fillStyle =
    colors[value];

  targetContext.fillRect(
    x,
    y,
    1,
    1
  );


  /*
    오른쪽 / 아래 그림자
  */
  targetContext.fillStyle =
    darkColors[value];

  targetContext.fillRect(
    x + 0.78,
    y + 0.08,
    0.14,
    0.84
  );

  targetContext.fillRect(
    x + 0.08,
    y + 0.78,
    0.84,
    0.14
  );


  /*
    위 / 왼쪽 광택
  */
  targetContext.fillStyle =
    lightColors[value];

  targetContext.fillRect(
    x + 0.08,
    y + 0.08,
    0.84,
    0.12
  );

  targetContext.fillRect(
    x + 0.08,
    y + 0.08,
    0.12,
    0.84
  );


  /*
    중앙 광택
  */
  targetContext.fillStyle =
    "rgba(255,255,255,0.18)";

  targetContext.fillRect(
    x + 0.25,
    y + 0.25,
    0.45,
    0.15
  );


  /*
    블록 외곽선
  */
  targetContext.strokeStyle =
    "rgba(0,0,0,0.58)";

  targetContext.lineWidth =
    0.055;

  targetContext.strokeRect(
    x + 0.03,
    y + 0.03,
    0.94,
    0.94
  );


  /*
    안쪽 선
  */
  targetContext.strokeStyle =
    "rgba(255,255,255,0.22)";

  targetContext.lineWidth =
    0.025;

  targetContext.strokeRect(
    x + 0.14,
    y + 0.14,
    0.72,
    0.72
  );

}


/* ==================================================
   행렬 그리기
================================================== */

function drawMatrix(
  matrix,
  offset,
  targetContext = context
) {

  matrix.forEach(
    (row, y) => {

      row.forEach(
        (value, x) => {

          if (value !== 0) {

            drawCell(
              targetContext,
              x + offset.x,
              y + offset.y,
              value
            );

          }

        }
      );

    }
  );

}


/* ==================================================
   게임판 배경
================================================== */

function drawBoardBackground() {

  context.fillStyle =
    "#07142c";

  context.fillRect(
    0,
    0,
    10,
    20
  );


  /*
    매우 약한 세로 그리드
  */
  context.strokeStyle =
    "rgba(30,80,140,0.13)";

  context.lineWidth =
    0.02;


  for (
    let x = 0;
    x <= 10;
    x++
  ) {

    context.beginPath();

    context.moveTo(
      x,
      0
    );

    context.lineTo(
      x,
      20
    );

    context.stroke();

  }


  /*
    가로 그리드
  */
  for (
    let y = 0;
    y <= 20;
    y++
  ) {

    context.beginPath();

    context.moveTo(
      0,
      y
    );

    context.lineTo(
      10,
      y
    );

    context.stroke();

  }

}


/* ==================================================
   메인 화면 그리기
================================================== */

function draw() {

  drawBoardBackground();


  drawMatrix(
    arena,
    {
      x: 0,
      y: 0
    }
  );


  if (
    player.matrix
  ) {

    drawMatrix(
      player.matrix,
      player.position
    );

  }


  drawNextPieces();

}


/* ==================================================
   다음 블록들 표시
================================================== */

function drawNextPieces() {

  for (
    let i = 0;
    i < nextContexts.length;
    i++
  ) {

    const ctx =
      nextContexts[i];

    const canvas =
      nextCanvases[i];


    ctx.clearRect(
      0,
      0,
      canvas.width / 20,
      canvas.height / 20
    );


    const matrix =
      pieceQueue[i];


    if (!matrix) {
      continue;
    }


    const canvasWidth =
      canvas.width / 20;

    const canvasHeight =
      canvas.height / 20;


    const offsetX =
      (
        canvasWidth -
        matrix[0].length
      ) / 2;


    const offsetY =
      (
        canvasHeight -
        matrix.length
      ) / 2;


    drawMatrix(
      matrix,
      {
        x: offsetX,
        y: offsetY
      },
      ctx
    );

  }

}


/* ==================================================
   충돌 검사
================================================== */

function collide(
  arena,
  player
) {

  const matrix =
    player.matrix;

  const position =
    player.position;


  for (
    let y = 0;
    y < matrix.length;
    y++
  ) {

    for (
      let x = 0;
      x < matrix[y].length;
      x++
    ) {

      if (
        matrix[y][x] !== 0 &&
        (
          arena[
            y + position.y
          ] &&
          arena[
            y + position.y
          ][
            x + position.x
          ]
        ) !== 0
      ) {

        return true;

      }

    }

  }


  return false;

}


/* ==================================================
   블록 고정
================================================== */

function merge(
  arena,
  player
) {

  player.matrix.forEach(
    (row, y) => {

      row.forEach(
        (value, x) => {

          if (value !== 0) {

            arena[
              y + player.position.y
            ][
              x + player.position.x
            ] = value;

          }

        }
      );

    }
  );

}


/* ==================================================
   줄 제거
================================================== */

function sweepArena() {

  let combo = 1;

  let removed = 0;


  outer:
  for (
    let y =
      arena.length - 1;

    y >= 0;

    y--
  ) {

    for (
      let x = 0;
      x < arena[y].length;
      x++
    ) {

      if (
        arena[y][x] === 0
      ) {

        continue outer;

      }

    }


    const row =
      arena.splice(
        y,
        1
      )[0]
      .fill(0);


    arena.unshift(row);

    y++;


    removed++;


    player.score +=
      combo * 100;


    combo *= 2;

  }


  if (
    removed > 0
  ) {

    player.lines +=
      removed;


    player.level =
      Math.floor(
        player.lines / 10
      ) + 1;


    /*
      레벨 증가 시
      낙하 속도 증가
    */
    dropInterval =
      Math.max(
        100,
        850 -
        (
          player.level - 1
        ) * 65
      );

  }

}


/* ==================================================
   새 블록 등장
================================================== */

function playerReset() {

  fillQueue();


  player.matrix =
    pieceQueue.shift();


  fillQueue();


  player.position.y = 0;


  player.position.x =
    Math.floor(
      arena[0].length / 2
    )

    -

    Math.floor(
      player.matrix[0].length / 2
    );


  /*
    등장하자마자 충돌하면
    게임 종료
  */
  if (
    collide(
      arena,
      player
    )
  ) {

    endGame();

  }


  drawNextPieces();

}


/* ==================================================
   아래 이동
================================================== */

function playerDrop() {

  if (
    isPaused ||
    gameOverState
  ) {
    return;
  }


  player.position.y++;


  if (
    collide(
      arena,
      player
    )
  ) {

    player.position.y--;


    merge(
      arena,
      player
    );


    sweepArena();


    playerReset();


    updateInfo();

  }


  dropCounter = 0;

}


/* ==================================================
   좌우 이동
================================================== */

function playerMove(direction) {

  if (
    isPaused ||
    gameOverState
  ) {
    return;
  }


  player.position.x +=
    direction;


  if (
    collide(
      arena,
      player
    )
  ) {

    player.position.x -=
      direction;

  }

}


/* ==================================================
   블록 회전
================================================== */

function rotate(
  matrix,
  direction
) {

  for (
    let y = 0;
    y < matrix.length;
    y++
  ) {

    for (
      let x = 0;
      x < y;
      x++
    ) {

      [
        matrix[x][y],
        matrix[y][x]
      ]
      =
      [
        matrix[y][x],
        matrix[x][y]
      ];

    }

  }


  if (
    direction > 0
  ) {

    matrix.forEach(
      row => row.reverse()
    );

  } else {

    matrix.reverse();

  }

}


/* ==================================================
   회전 + 벽 보정
================================================== */

function playerRotate(direction) {

  if (
    isPaused ||
    gameOverState
  ) {
    return;
  }


  const originalX =
    player.position.x;


  let offset = 1;


  rotate(
    player.matrix,
    direction
  );


  while (
    collide(
      arena,
      player
    )
  ) {

    player.position.x +=
      offset;


    offset =
      -(
        offset +
        (
          offset > 0
            ? 1
            : -1
        )
      );


    if (
      Math.abs(offset) >
      player.matrix[0].length
    ) {

      rotate(
        player.matrix,
        -direction
      );


      player.position.x =
        originalX;


      return;

    }

  }

}


/* ==================================================
   하드 드롭
================================================== */

function hardDrop() {

  if (
    isPaused ||
    gameOverState
  ) {
    return;
  }


  let distance = 0;


  while (
    !collide(
      arena,
      player
    )
  ) {

    player.position.y++;

    distance++;

  }


  player.position.y--;

  distance--;


  merge(
    arena,
    player
  );


  sweepArena();


  /*
    낙하 거리만큼 보너스
  */
  player.score +=
    Math.max(
      0,
      distance * 2
    );


  playerReset();

  updateInfo();

  dropCounter = 0;

}


/* ==================================================
   정보 업데이트
================================================== */

function updateInfo() {

  scoreElement.textContent =
    String(
      player.score
    ).padStart(
      6,
      "0"
    );


  linesElement.textContent =
    String(
      player.lines
    ).padStart(
      3,
      "0"
    );


  levelElement.textContent =
    String(
      player.level
    ).padStart(
      2,
      "0"
    );

}


/* ==================================================
   타이머 업데이트
================================================== */

function updateTimer() {

  let now =
    Date.now();


  let elapsed;


  if (isPaused) {

    elapsed =
      pauseStartedAt -
      startTime -
      pausedDuration;

  } else {

    elapsed =
      now -
      startTime -
      pausedDuration;

  }


  elapsed =
    Math.max(
      elapsed,
      0
    );


  const totalSeconds =
    Math.floor(
      elapsed / 1000
    );


  const minutes =
    Math.floor(
      totalSeconds / 60
    );


  const seconds =
    totalSeconds % 60;


  timerElement.textContent =
    String(minutes).padStart(
      2,
      "0"
    )
    +
    ":"
    +
    String(seconds).padStart(
      2,
      "0"
    );

}


/* ==================================================
   게임 종료
================================================== */

function endGame() {

  gameOverState = true;


  overlayTitle.textContent =
    "GAME OVER";


  overlayText.textContent =
    "RESTART 버튼을 눌러 다시 시작하세요.";


  overlay.classList.add(
    "show"
  );

}


/* ==================================================
   일시정지
================================================== */

function togglePause() {

  if (
    gameOverState
  ) {
    return;
  }


  isPaused =
    !isPaused;


  if (isPaused) {

    pauseStartedAt =
      Date.now();


    pauseButton.textContent =
      "RESUME";


    overlayTitle.textContent =
      "PAUSED";


    overlayText.textContent =
      "P 키 또는 RESUME 버튼을 눌러주세요.";


    overlay.classList.add(
      "show"
    );

  } else {

    pausedDuration +=
      Date.now() -
      pauseStartedAt;


    pauseButton.textContent =
      "PAUSE";


    overlay.classList.remove(
      "show"
    );


    lastTime =
      performance.now();

  }

}


/* ==================================================
   다시 시작
================================================== */

function restartGame() {

  arena.forEach(
    row => row.fill(0)
  );


  player.score = 0;

  player.lines = 0;

  player.level = 1;


  pieceQueue = [];


  dropCounter = 0;

  dropInterval = 850;


  isPaused = false;

  gameOverState = false;


  startTime =
    Date.now();

  pausedDuration = 0;

  pauseStartedAt = 0;


  pauseButton.textContent =
    "PAUSE";


  overlay.classList.remove(
    "show"
  );


  fillQueue();

  playerReset();

  updateInfo();

  draw();

}


/* ==================================================
   키보드 이벤트
================================================== */

document.addEventListener(
  "keydown",
  event => {

    const preventKeys = [
      "ArrowLeft",
      "ArrowRight",
      "ArrowDown",
      "ArrowUp",
      "Space"
    ];


    if (
      preventKeys.includes(
        event.code
      )
    ) {

      event.preventDefault();

    }


    /*
      P = 일시정지
    */
    if (
      event.code === "KeyP"
    ) {

      togglePause();

      return;

    }


    if (
      isPaused ||
      gameOverState
    ) {
      return;
    }


    /*
      왼쪽
    */
    if (
      event.code ===
      "ArrowLeft"
    ) {

      playerMove(-1);

    }


    /*
      오른쪽
    */
    else if (
      event.code ===
      "ArrowRight"
    ) {

      playerMove(1);

    }


    /*
      아래
    */
    else if (
      event.code ===
      "ArrowDown"
    ) {

      playerDrop();

      player.score += 1;

      updateInfo();

    }


    /*
      위 = 회전
    */
    else if (
      event.code ===
      "ArrowUp"
    ) {

      playerRotate(1);

    }


    /*
      Space = 즉시 낙하
    */
    else if (
      event.code ===
      "Space"
    ) {

      hardDrop();

    }

  }
);


/* ==================================================
   버튼
================================================== */

pauseButton.addEventListener(
  "click",
  togglePause
);


restartButton.addEventListener(
  "click",
  restartGame
);


/* ==================================================
   게임 루프
================================================== */

function update(time = 0) {

  const deltaTime =
    time - lastTime;


  lastTime =
    time;


  if (
    !isPaused &&
    !gameOverState
  ) {

    dropCounter +=
      deltaTime;


    if (
      dropCounter >
      dropInterval
    ) {

      playerDrop();

    }

  }


  updateTimer();

  draw();


  requestAnimationFrame(
    update
  );

}


/* ==================================================
   초기 실행
================================================== */

fillQueue();

playerReset();

updateInfo();

update();