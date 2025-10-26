const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Lấy các phần tử thông báo
const scoreDisplay = document.getElementById('score');
const startMessage = document.getElementById('start-message');
const gameOverMessage = document.getElementById('game-over-message');

// Cài đặt trò chơi
const birdSize = 20;
const gravity = 0.5;
const flapStrength = 8;
const pipeWidth = 60;
const pipeGap = 150;
const pipeSpeed = 3;
const pipeSpawnInterval = 100; // Số khung hình (frames)

let birdY, birdVelocity, score, frame, pipes, gameStarted, gameOver;

// Hàm khởi tạo/Reset trò chơi
function resetGame() {
    birdY = canvas.height / 2 - birdSize / 2;
    birdVelocity = 0;
    score = 0;
    frame = 0;
    pipes = [];
    gameStarted = false;
    gameOver = false;
    
    scoreDisplay.textContent = '0';
    startMessage.classList.remove('hidden');
    gameOverMessage.classList.add('hidden');
    draw(); // Vẽ màn hình ban đầu
}

// Hàm "vẽ" (cập nhật mỗi khung hình)
function draw() {
    if (gameOver) return;

    // 1. Xóa màn hình (vẽ nền đen)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!gameStarted) {
        // Chỉ vẽ con chim nếu game chưa bắt đầu
        drawBird();
        return;
    }

    // 2. Cập nhật & Vẽ Con Chim
    birdVelocity += gravity;
    birdY += birdVelocity;
    drawBird();

    // 3. Cập nhật & Vẽ Ống
    // Tạo ống mới
    if (frame % pipeSpawnInterval === 0) {
        const topPipeHeight = Math.random() * (canvas.height - pipeGap - 100) + 50;
        pipes.push({
            x: canvas.width,
            topHeight: topPipeHeight,
            bottomHeight: canvas.height - topPipeHeight - pipeGap,
            scored: false
        });
    }

    // Di chuyển và vẽ các ống
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= pipeSpeed;

        // Vẽ ống trên
        drawRect(pipes[i].x, 0, pipeWidth, pipes[i].topHeight);
        // Vẽ ống dưới
        drawRect(pipes[i].x, canvas.height - pipes[i].bottomHeight, pipeWidth, pipes[i].bottomHeight);

        // 4. Kiểm tra cộng điểm
        if (!pipes[i].scored && pipes[i].x + pipeWidth < canvas.width / 2 - birdSize / 2) {
            score++;
            scoreDisplay.textContent = score;
            pipes[i].scored = true;
        }

        // Xóa ống khi ra khỏi màn hình
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }

        // 5. Kiểm tra Va Chạm
        if (checkCollision(pipes[i])) {
            endGame();
            return;
        }
    }

    // 6. Kiểm tra va chạm với lề (trên/dưới)
    if (birdY + birdSize > canvas.height || birdY < 0) {
        endGame();
        return;
    }

    // Tăng số khung hình và lặp lại
    frame++;
    requestAnimationFrame(draw);
}

// Hàm vẽ khối pixel đơn giản (trắng)
function drawRect(x, y, w, h) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y, w, h);
    // Vẽ viền đen cho rõ khối pixel
    ctx.strokeStyle = '#000000'; 
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
}

// Hàm vẽ con chim (một khối pixel)
function drawBird() {
    drawRect(canvas.width / 2 - birdSize / 2, birdY, birdSize, birdSize);
}

// Hàm kiểm tra va chạm
function checkCollision(pipe) {
    const birdLeft = canvas.width / 2 - birdSize / 2;
    const birdRight = birdLeft + birdSize;
    const birdTop = birdY;
    const birdBottom = birdY + birdSize;

    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + pipeWidth;
    const pipeTopEnd = pipe.topHeight;
    const pipeBottomStart = canvas.height - pipe.bottomHeight;

    // Va chạm với ống trên HOẶC va chạm với ống dưới
    const hitTopPipe = (birdRight > pipeLeft && birdLeft < pipeRight && birdTop < pipeTopEnd);
    const hitBottomPipe = (birdRight > pipeLeft && birdLeft < pipeRight && birdBottom > pipeBottomStart);

    return hitTopPipe || hitBottomPipe;
}

// Hàm kết thúc game
function endGame() {
    gameOver = true;
    gameStarted = false;
    gameOverMessage.classList.remove('hidden');
}

// Hàm "vỗ cánh"
function flap() {
    if (gameOver) return;
    
    if (!gameStarted) {
        gameStarted = true;
        startMessage.classList.add('hidden');
        requestAnimationFrame(draw); // Bắt đầu vòng lặp game
    }
    
    birdVelocity = -flapStrength;
}

// Lắng nghe sự kiện
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        flap();
    }
    // Chơi lại bằng phím 'R'
    if (e.code === 'KeyR' && gameOver) {
        resetGame();
    }
});

// Chơi lại bằng click nếu game over
document.addEventListener('click', () => {
    if (!gameStarted) {
        flap();
    }
});

// Khởi động trò chơi lần đầu
resetGame();
