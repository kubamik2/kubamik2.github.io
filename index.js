const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const playAgainButton = document.getElementById("play-again");
canvas.width = 288;
canvas.height = 512;

const State = {
    START: 0,
    PLAYING: 1,
    GAME_OVER: 2,
}
var gameState = State.START;
var frame = 0;
const GRAVITY_CONSTANT = 900;
const GROUND_SPEED = 130;

const dieSound = new Audio("assets/Sound Efects/die.wav");
const hitSound = new Audio("assets/Sound Efects/hit.wav");
const pointSound = new Audio("assets/Sound Efects/point.wav");
const swooshSound = new Audio("assets/Sound Efects/swoosh.wav");
const wingSound = new Audio("assets/Sound Efects/wing.wav");

playAgainButton.onclick = () => {
    resetToStart();
};

if (window.localStorage.getItem("bestScores") == null) {
    window.localStorage.setItem("bestScores", [0, 0, 0, 0, 0]);
}

class Sprite {
    constructor({ position, imageSrc, frames = 1, framerate = 1, animationEnabled = true }) {
        this.position = position;
        this.image = new Image();
        this.image.src = imageSrc;
        this.image.onload = () => {
            this.width = this.image.width / frames;
            this.height = this.image.height;
        }
        this.frames = frames;
        this.framerate = framerate;
        this.timeSinceFrame = 0;
        this.currentFrame = 0;
        this.animationEnabled = animationEnabled;
    }

    drawAt(position) {
        if (!this.image) {
            return;
        }
        if (this.animationEnabled) {
            this.timeSinceFrame += dt;
            if (this.timeSinceFrame >= 1 / this.framerate) {
                this.timeSinceFrame = 0;
                this.currentFrame = (this.currentFrame + 1) % this.frames;
            }
        }
        const cropbox = {
            position: { x: (this.currentFrame * this.width), y: 0 },
            width: this.image.width / this.frames,
            height: this.image.height,
        };

        ctx.drawImage(
            this.image,
            cropbox.position.x,
            cropbox.position.y,
            cropbox.width,
            cropbox.height,
            position.x,
            position.y,
            this.width,
            this.height,
        );
    }

    draw() { this.drawAt(this.position); }

    update() {
        this.draw();
    }
}

class Bird extends Sprite {
    constructor() {
        super({ imageSrc: "assets/Flappy Bird/yellowbird.png", frames: 3, framerate: 8 });
        this.position = { x: 70, y: 244 };
        this.velocity = 0;
        this.angle = 0;
    }

    update() {
        ctx.save();
        ctx.translate(this.position.x + 17, this.position.y + 12);
        ctx.rotate(this.angle);
        ctx.translate(-this.position.x - 17, -this.position.y - 12);
        this.draw();
        ctx.restore();

        if (gameState == State.START) {
            return;
        }
        this.position.y += this.velocity * dt;
        this.velocity += GRAVITY_CONSTANT * dt;
        this.angle = -(Math.PI / 8) + (Math.min(Math.max((this.velocity - 200) / 300, 0), 1) * (Math.PI / 8 + Math.PI / 2));
        const groundHeight = canvas.height - ground.height - bird.height;
        if (this.position.y >= groundHeight && gameState != State.GAME_OVER) {
            gameState = State.GAME_OVER;
            bird.onGameOver();
            gameOverMenu.onGameOver();
        }
        this.position.y = Math.min(this.position.y, groundHeight);
    }

    reset() {
        this.position = { x: 70, y: 244 };
        this.velocity = 0;
        this.angle = 0;
        this.animationEnabled = true;
    }

    fly() {
        this.velocity = -280;
        wingSound.cloneNode().play();
    }

    onGameOver() {
        this.animationEnabled = false;
        hitSound.cloneNode().play();
        dieSound.cloneNode().play();
        swooshSound.cloneNode().play();
    }
}

class Ground extends Sprite {
    constructor() {
        super({ imageSrc: "assets/Flappy Bird/base.png" });
        this.position = { x: 0, y: 400 };
    }

    update() {
        this.draw();
        if (gameState == State.PLAYING) {
            this.position.x -= GROUND_SPEED * dt;
            if (this.position.x < -48) {
                this.position.x += 48;
            }
        }
    }
}

class StartMenu extends Sprite {
    constructor() {
        super({ position: { x: canvas.width / 2 - 92, y: 50 }, imageSrc: "assets/UI/message.png" });
    }

    update() {
        if (gameState == State.START) {
            this.draw();
        }
    }
}

class PipeWall {
    static sprite = new Sprite({ position: { x: 0, y: 0 }, imageSrc: "assets/Flappy Bird/pipe-green.png" });
    static gap = 100;
    constructor(x) {
        this.position = { x: x, y: Math.random() * 200 + 150 };
        this.scored = false;
    }

    update() {
        if (gameState == State.PLAYING) {
            if (this.position.x < -52) {
                this.position = { x: 448, y: Math.random() * 200 + 150 };
                this.scored = false;
            }
            this.position.x -= GROUND_SPEED * dt;

            if (gameState != State.GAME_OVER && bird.position.x <= this.position.x + PipeWall.sprite.width
                && bird.position.x + bird.width >= this.position.x
                && (bird.position.y <= this.position.y - PipeWall.gap || bird.position.y + bird.height >= this.position.y)) {
                gameState = State.GAME_OVER;
                bird.onGameOver();
                gameOverMenu.onGameOver();
            }
            if (bird.position.x > this.position.x && !this.scored) {
                score.increment();
                pointSound.cloneNode().play();
                this.scored = true;
            }
        }
        PipeWall.sprite.drawAt(this.position);

        ctx.save();
        ctx.translate(this.position.x + PipeWall.sprite.width / 2, this.position.y + PipeWall.sprite.height / 2);
        ctx.scale(1, -1);
        ctx.translate(-this.position.x - PipeWall.sprite.width / 2, -this.position.y - PipeWall.sprite.height / 2);
        PipeWall.sprite.drawAt({ x: this.position.x, y: this.position.y + 320 + PipeWall.gap });
        ctx.restore();
    }
}

class Score {
    static sprites = [
        new Sprite({ position: { x: 0, y: 0 }, imageSrc: "assets/UI/Numbers/0.png" }),
        new Sprite({ position: { x: 0, y: 0 }, imageSrc: "assets/UI/Numbers/1.png" }),
        new Sprite({ position: { x: 0, y: 0 }, imageSrc: "assets/UI/Numbers/2.png" }),
        new Sprite({ position: { x: 0, y: 0 }, imageSrc: "assets/UI/Numbers/3.png" }),
        new Sprite({ position: { x: 0, y: 0 }, imageSrc: "assets/UI/Numbers/4.png" }),
        new Sprite({ position: { x: 0, y: 0 }, imageSrc: "assets/UI/Numbers/5.png" }),
        new Sprite({ position: { x: 0, y: 0 }, imageSrc: "assets/UI/Numbers/6.png" }),
        new Sprite({ position: { x: 0, y: 0 }, imageSrc: "assets/UI/Numbers/7.png" }),
        new Sprite({ position: { x: 0, y: 0 }, imageSrc: "assets/UI/Numbers/8.png" }),
        new Sprite({ position: { x: 0, y: 0 }, imageSrc: "assets/UI/Numbers/9.png" }),
    ];
    constructor({ position, value = 0 }) {
        this.value = value;
        this.position = position;
    }

    increment() {
        this.value += 1;
    }

    reset() {
        this.value = 0;
    }

    update() {
        const width = Score.sprites[0].width;
        if (this.value > 9) {
            const ones = this.value % 10;
            const tens = (Math.floor(this.value / 10)) % 10;
            Score.sprites[ones].drawAt({ x: this.position.x, y: this.position.y })
            Score.sprites[tens].drawAt({ x: this.position.x - width, y: this.position.y })
        } else {
            const ones = this.value % 10;
            Score.sprites[ones].drawAt({ x: this.position.x - width / 2, y: this.position.y })
        }
    }
}

class GameOverMenu extends Sprite {
    static currentScore = new Score({ position: { x: canvas.width / 2, y: 100 } });
    static bestScores = [
        new Score({ position: { x: canvas.width / 2, y: 160 } }),
        new Score({ position: { x: canvas.width / 2, y: 200 } }),
        new Score({ position: { x: canvas.width / 2, y: 240 } }),
        new Score({ position: { x: canvas.width / 2, y: 280 } }),
        new Score({ position: { x: canvas.width / 2, y: 320 } }),
    ];
    constructor() {
        super({ position: { x: canvas.width / 2 - 92, y: 50 }, imageSrc: "assets/UI/gameover.png" });
    }

    update() {
        if (gameState == State.GAME_OVER) {
            this.draw();
            GameOverMenu.currentScore.value = score.value;
            GameOverMenu.currentScore.update();
            for (const score of GameOverMenu.bestScores) {
                score.update();
            }
        }
    }

    onGameOver() {
        const localStorageBestScores = window.localStorage.getItem("bestScores").split(",").map((e) => parseInt(e));
        localStorageBestScores.push(score.value);
        localStorageBestScores.sort(function (a,b) { return a - b});
        localStorageBestScores.reverse();
        localStorageBestScores.pop();
        window.localStorage.setItem("bestScores", localStorageBestScores);
        for (const [i, score] of localStorageBestScores.entries()) {
            GameOverMenu.bestScores[i].value = score;
        }
        playAgainButton.style.display = "block";
    }
}

const background = new Sprite({ position: { x: 0, y: 0 }, imageSrc: "assets/Flappy Bird/background-day.png" });
const ground = new Ground();
const pipeSprite = new Sprite({ position: { x: 0, y: 0 }, imageSrc: "assets/Flappy Bird/pipe-green.png" });
const startMenu = new StartMenu();
const gameOverMenu = new GameOverMenu();

var bird = new Bird();
var pipes = [new PipeWall(500), new PipeWall(675), new PipeWall(850)];
var score = new Score({ position: { x: canvas.width / 2, y: 50 } });

function updatePipes() {
    for (var pipeWall of pipes) {
        pipeWall.update();
    }
}

var lastFrame = Date.now();
var dt = 0;

function animate() {
    dt = (Date.now() - lastFrame) / 1000;
    lastFrame = Date.now();
    window.requestAnimationFrame(animate);
    background.update();
    startMenu.update();
    updatePipes();
    bird.update();
    ground.update();
    gameOverMenu.update();
    if (gameState == State.PLAYING) {
        score.update();
    }
    frame += 1;
}

animate();

window.addEventListener("keydown", (e) => {
    if (e.key == " ") {
        onSpace();
    }
});

function resetToStart() {
    bird.reset();
    playAgainButton.style.display = "none";
    gameState = State.START;
    pipes = [new PipeWall(500), new PipeWall(675), new PipeWall(850)];
}

function onSpace() {
    switch (gameState) {
        case State.START:
            gameState = State.PLAYING;
            bird.fly();
            score.reset();
            break;
        case State.PLAYING:
            bird.fly();
            break;
        case State.GAME_OVER:
            resetToStart();
            break;
    }
}
