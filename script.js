
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

const spinButton = document.getElementById("spin-button");
const result = document.getElementById("result");
const resetButton = document.getElementById("reset-button");
const historyList = document.getElementById("history-list");

let winningHistory = [];
let audioContext;
// Wheel prizes
const prizes = [
    "$100",
    "$200",
    "$500",
    "Try Again",
    "$1,000",
    "Bonus",
    "$50",
    "Jackpot"
];

// Wheel colours
const colors = [
    "#ff595e",
    "#ffca3a",
    "#8ac926",
    "#1982c4",
    "#6a4c93",
    "#f72585",
    "#4cc9f0",
    "#7209b7"
];

const centerX = 250;
const centerY = 250;
const radius = 235;

const sliceAngle = (Math.PI * 2) / prizes.length;

let rotation = 0;
let spinning = false;

// Draw the wheel
function drawWheel() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    prizes.forEach((prize, index) => {

        const startAngle = rotation + index * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        // Draw wheel section
        ctx.beginPath();

        ctx.moveTo(centerX, centerY);

        ctx.arc(
            centerX,
            centerY,
            radius,
            startAngle,
            endAngle
        );

        ctx.closePath();

        ctx.fillStyle = colors[index];
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw prize text
        ctx.save();

        ctx.translate(centerX, centerY);

        ctx.rotate(startAngle + sliceAngle / 2);

        ctx.textAlign = "right";
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 19px Arial";

        ctx.fillText(prize, radius - 20, 7);

        ctx.restore();

    });

    // Draw centre circle
    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        35,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#ffffff";
    ctx.fill();

    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#222222";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText("GO", centerX, centerY);
}

// Initial wheel display
drawWheel();
 
// Play a simple spinning sound
function playSpinSound() {

    audioContext = audioContext || new AudioContext();

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
        500,
        audioContext.currentTime
    );

    oscillator.frequency.exponentialRampToValueAtTime(
        150,
        audioContext.currentTime + 1
    );

    gain.gain.setValueAtTime(
        0.12,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 1
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
}

// Add winner to history
function addToHistory(prize) {

    winningHistory.unshift(prize);

    historyList.innerHTML = "";

    winningHistory.forEach((item, index) => {

        const li = document.createElement("li");

        li.textContent = `${index + 1}. 🎉 ${item}`;

        historyList.appendChild(li);

    });

}

// Reset game
function resetGame() {

    if (spinning) return;

    winningHistory = [];

    historyList.innerHTML = "<li>No prizes won yet</li>";

    result.textContent = "Your prize will appear here!";

}

// Spin the wheel
function spinWheel() {

    if (spinning) return;

    spinning = true;
    spinButton.disabled = true;

    result.textContent = "Good luck! Spinning...";
    playSpinSound();

    const extraSpins = 5 + Math.random() * 5;

    const targetRotation = rotation + extraSpins * Math.PI * 2;

    const duration = 4000;

    const startTime = performance.now();
    const startRotation = rotation;

    function animate(currentTime) {

        const elapsed = currentTime - startTime;

        let progress = Math.min(elapsed / duration, 1);

        // Smooth slowing animation
        let easeOut = 1 - Math.pow(1 - progress, 4);

        rotation = startRotation +
            (targetRotation - startRotation) * easeOut;

        drawWheel();

        if (progress < 1) {

            requestAnimationFrame(animate);

        } else {

            rotation = rotation % (Math.PI * 2);

            drawWheel();

            showWinner();

            spinning = false;
            spinButton.disabled = false;

        }

    }

    requestAnimationFrame(animate);
}

// Identify the winning prize
function showWinner() {

    const pointerAngle = (Math.PI * 1.5 - rotation + Math.PI * 2)
        % (Math.PI * 2);

    const winningIndex = Math.floor(pointerAngle / sliceAngle);

    result.textContent = "🎉 Congratulations! You won: " +
        prizes[winningIndex];
addToHistory(prizes[winningIndex]);
}

// Button event
spinButton.addEventListener("click", spinWheel);
resetButton.addEventListener("click", resetGame);