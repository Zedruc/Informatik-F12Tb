let balls = [];
let __isGamePaused = false;

/* Minutes; How many balls to add */
const waves = {
  0: 5,
  1: 2,
  3: 2,
  5: 5
}
let lastSpawnedWave = null;

let startTime = Date.now();
const timerDisplay = document.getElementById('timerDisplay');
const highscoreDisplay = document.getElementById('highscoreDisplay');
let bestTime = localStorage.getItem('bestTime') || 0;

const timeToMinutesAndSeconds = (time) => {
  const minutes = time/1000/60<<0;
  const seconds = time/1000-minutes*60<<0;

  return {
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0')
  }
}

if(bestTime > 0) {
  const {minutes, seconds} = timeToMinutesAndSeconds(bestTime);
  highscoreDisplay.innerText = `Highscore: ${minutes}:${seconds}`;
}

const updateTimer = () => {
  if(__isGamePaused) return;
  const now = Date.now();
  const gameDuration = now-startTime;

  const {minutes, seconds} = timeToMinutesAndSeconds(gameDuration);
  
  timerDisplay.innerText = `${minutes}:${seconds}`;
  let waveIndex = (gameDuration/1000/60<<0)

  if(waves.hasOwnProperty(waveIndex) && lastSpawnedWave !== waveIndex) {
    let i = 0;
    lastSpawnedWave = waveIndex;
    while(i++ < waves[waveIndex]) createBall();
  }
}

setInterval(() => {
  updateTimer();
}, 1000);

const resetGame = () => {
  balls.forEach(ball => {
    ball.element.remove();
  });
  balls = [];

  startTime = Date.now();
  lastSpawnedWave = null;

  __isGamePaused = false;
}

const checkHighscore = () => {
  const gameDuration = Date.now()-startTime;
  if(gameDuration > bestTime) {
    bestTime = gameDuration;
    localStorage.setItem('bestTime', bestTime);

    const {minutes, seconds} = timeToMinutesAndSeconds(gameDuration);

    highscoreDisplay.innerText = `New Highscore: ${minutes}:${seconds}`;
    setTimeout(() => {
      highscoreDisplay.innerText = `Highscore: ${minutes}:${seconds}`;
    }, 3000);
  }
}

const createBall = (width = 100, height = 100) => {
  const newBall = document.createElement('div');
  const spawnPos = getRandomSpawnPos();

  newBall.classList.add('ball');
  newBall.style.backgroundColor = generateRandomColor();
  newBall.style.left = `${spawnPos.x}px`;
  newBall.style.top = `${spawnPos.y}px`;
  newBall.style.width = `${width}px`;
  newBall.style.height = `${height}px`;

  document.body.appendChild(newBall);

  balls.push({
    pos: spawnPos,
    reversed: {
      x: Math.random() > 0.5 ? true : false,
      y: Math.random() > 0.5 ? true : false
    },
    width: width,
    height: height,
    element: newBall
  });
}

const generateRandomColor = () => {
  return '#'+(Math.random()*0xFFFFFF<<0).toString(16).padEnd(0, '6');
}

const lastMousePos = {
  x: 0,
  y: 0
}

const handleMouseMove = (ev) => {
  lastMousePos.x = ev.clientX;
  lastMousePos.y = ev.clientY;
}

document.addEventListener('mousemove', handleMouseMove);

/**
 * @returns {'y' | 'x'}
 */
const getCollisionAxis = (pos1, pos2) => {
  let deltaY = Math.abs(pos1.y-pos2.y);
  let deltaX = Math.abs(pos1.x-pos2.x);
  
  if(deltaY > deltaX) return 'y'
  else return 'x';
}

let maxX = window.innerWidth;
let maxY = window.innerHeight;

/* Spawn prot around cursor? */
const getRandomSpawnPos = () => {
  return {
    x: Math.random()*maxX<<0,
    y: Math.random()*maxY<<0,
  }
}

const step = 10;

const render = () => {
  if(__isGamePaused) return;
  maxX = window.innerWidth;
  maxY = window.innerHeight;

  balls.forEach(ball => {
    ball.reversed.x
      ? ball.pos.x -= step
      : ball.pos.x += step

    ball.reversed.y
      ? ball.pos.y -= step
      : ball.pos.y += step    

    if(ball.pos.x+ball.width > maxX) ball.reversed.x = true;
    if(ball.pos.x < 0) ball.reversed.x = false;

    if(ball.pos.y+ball.height > maxY) ball.reversed.y = true;
    if(ball.pos.y < 0) ball.reversed.y = false;

    if(
      lastMousePos.x >= ball.pos.x && lastMousePos.x <= ball.pos.x+ball.width
      && lastMousePos.y >= ball.pos.y && lastMousePos.y <= ball.pos.y+ball.height
    ) {
      __isGamePaused = true;
      timerDisplay.innerText = 'Game Over!';
      checkHighscore();
      setTimeout(() => {
        resetGame();
      }, 3000);
    }

    balls.forEach(otherBall => {
      if(ball.element == otherBall.element) return;
      if(
        ball.pos.x >= otherBall.pos.x && ball.pos.x <= otherBall.pos.x+otherBall.width
        && ball.pos.y >= otherBall.pos.y && ball.pos.y <= otherBall.pos.y+otherBall.height
      ) {
        if(getCollisionAxis(ball.pos, otherBall.pos) == 'x') {
          ball.reversed.x = !ball.reversed.x;
          otherBall.reversed.x = !ball.reversed.x;
        } else {
          ball.reversed.y = !ball.reversed.y;
          otherBall.reversed.y = !ball.reversed.y;
        }
        
        

      
      }
    });

    ball.element.style.left = `${ball.pos.x}px`;
    ball.element.style.top = `${ball.pos.y}px`;
    // ball.element.style.backgroundColor = generateRandomColor();
  });
}

setInterval(() => {
  render();
}, 10);