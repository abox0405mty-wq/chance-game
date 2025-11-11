const initialWeight = 100;
const weightIncrease = 15;
const baseSpeed = 12; // % per second without cheers
const cheerBoost = 20; // extra % per second per cheer power
const cheerDecayPerSecond = 1.2; // how fast cheer power falls
const progressGoal = 100;
const timeLimit = 60;

const weightEl = document.getElementById('weight');
const clearedEl = document.getElementById('cleared');
const cheersEl = document.getElementById('cheers');
const timerEl = document.getElementById('timer');
const progressEl = document.getElementById('progress');
const messageEl = document.getElementById('message');
const lifterEl = document.getElementById('lifter');
const cheerBtn = document.getElementById('cheerBtn');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const cheerMembers = Array.from(document.querySelectorAll('.cheer'));

let currentWeight = initialWeight;
let clearedCount = 0;
let cheerPower = 0;
let totalCheers = 0;
let progress = 0;
let timeLeft = timeLimit;
let isRunning = false;
let lastFrame = performance.now();
let animationId = null;
let timerId = null;

function updateStatus() {
  weightEl.textContent = currentWeight;
  clearedEl.textContent = clearedCount;
  cheersEl.textContent = Math.round(cheerPower);
  timerEl.textContent = Math.max(0, Math.ceil(timeLeft));
  progressEl.style.width = `${Math.min(progress, progressGoal).toFixed(1)}%`;
}

function resetCheerVisuals() {
  cheerMembers.forEach(member => {
    member.classList.remove('active', 'squat');
    Array.from(member.querySelectorAll('.bubble')).forEach(b => b.remove());
  });
}

function attachLegs() {
  cheerMembers.forEach(member => {
    if (!member.querySelector('.leg')) {
      const leftLeg = document.createElement('div');
      leftLeg.className = 'leg left';
      const rightLeg = document.createElement('div');
      rightLeg.className = 'leg right';
      member.append(leftLeg, rightLeg);
    }
  });
}

function cheerAnimation(member) {
  member.classList.add('active', 'squat');
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = 'チャンス！';
  member.appendChild(bubble);
  setTimeout(() => {
    member.classList.remove('squat');
  }, 300);
  setTimeout(() => {
    bubble.remove();
    member.classList.remove('active');
  }, 900);
}

function processCheer() {
  if (!isRunning) return;
  cheerPower += 1;
  totalCheers += 1;
  cheersEl.textContent = Math.round(cheerPower);
  const member = cheerMembers[Math.floor(Math.random() * cheerMembers.length)];
  cheerAnimation(member);
}

function handleSuccess() {
  clearedCount += 1;
  currentWeight += weightIncrease;
  progress = 0;
  cheerPower = Math.max(cheerPower, 2.5);
  lifterEl.classList.add('squat');
  messageEl.textContent = `${currentWeight - weightIncrease}kg をクリア！ 次は ${currentWeight}kg！`;
  setTimeout(() => lifterEl.classList.remove('squat'), 350);
}

function animationLoop(timestamp) {
  const delta = (timestamp - lastFrame) / 1000;
  lastFrame = timestamp;

  if (isRunning) {
    cheerPower = Math.max(0, cheerPower - cheerDecayPerSecond * delta);
    progress += (baseSpeed + cheerPower * cheerBoost) * delta;

    if (progress >= progressGoal) {
      handleSuccess();
    }

    if (timeLeft <= 0) {
      endGame();
    }

    updateStatus();
  }

  animationId = requestAnimationFrame(animationLoop);
}

function startTimer() {
  timerId = setInterval(() => {
    if (!isRunning) return;
    timeLeft -= 1;
    if (timeLeft <= 0) {
      timeLeft = 0;
      updateStatus();
      endGame();
    } else {
      updateStatus();
    }
  }, 1000);
}

function startGame() {
  if (isRunning) return;
  isRunning = true;
  lastFrame = performance.now();
  messageEl.textContent = `${currentWeight}kg に挑戦中！`;
  startBtn.disabled = true;
  cheerBtn.disabled = false;
  resetBtn.disabled = false;
  if (!timerId) startTimer();
}

function endGame() {
  if (!isRunning && timeLeft <= 0) {
    return;
  }
  const wasRunning = isRunning;
  isRunning = false;
  cheerBtn.disabled = true;
  startBtn.disabled = true;
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  if (wasRunning) {
    messageEl.textContent = `タイムアップ！ 合計 ${clearedCount} 回クリア、応援 ${totalCheers} チャンス！`;
  }
}

function resetGame() {
  isRunning = false;
  currentWeight = initialWeight;
  clearedCount = 0;
  cheerPower = 0;
  totalCheers = 0;
  progress = 0;
  timeLeft = timeLimit;
  messageEl.textContent = 'スタートで挑戦開始！';
  startBtn.disabled = false;
  cheerBtn.disabled = true;
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  updateStatus();
  resetCheerVisuals();
}

cheerBtn.addEventListener('click', processCheer);
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

attachLegs();
resetGame();
animationId = requestAnimationFrame(animationLoop);

window.addEventListener('beforeunload', () => {
  if (animationId) cancelAnimationFrame(animationId);
  if (timerId) clearInterval(timerId);
});
