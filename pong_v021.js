// Global Variables
var DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4 },
    rounds = [5, 3],
    finalRound = rounds.length-1,
    nextRound = document.getElementById('gameNext'),
    gameMode = document.getElementById('gameMode'),
    gameMessage = document.getElementById('gameMessage'),
    gameStart = document.getElementById('messageStart'),
    gameWon = document.getElementById('messageWon'),
    gameEnd = document.getElementById('messageEnd'),
    windowWidth = window.innerWidth,
    windowHeight = window.innerHeight;
const restartCountdown = document.querySelectorAll('.restartCountdown');


function setPaddleSpeed() {
    if (windowWidth >= 2560) { return 10.2; } 
    else if (windowWidth < 2560 && windowWidth >= 1920) { return 9.2; }
    else if (windowWidth < 1920 && windowWidth >= 1440) { return 8.6; }
    else if (windowWidth < 1440 && windowWidth >= 992) { return 8.4; }
    else if (windowWidth < 992 && windowWidth >= 768) { return 7.6; }
    else { return 7; }
}
function setBallSpeed() {
    if (windowWidth >= 2560) { return 12; } 
    else if (windowWidth < 2560 && windowWidth >= 1920) { return 11; }
    else if (windowWidth < 1920 && windowWidth >= 1440) { return 10; }
    else if (windowWidth < 1440 && windowWidth >= 992) { return 9; }
    else if (windowWidth < 992 && windowWidth >= 768) { return 8; }
    else if (windowWidth < 768 && windowWidth >= 640) { return 7; }
    else { return 6; }
}
function paddleMargin() {
    if (windowWidth >= 2560) { return .225;}
    else if (windowWidth < 2560 && windowWidth >= 1920) { return .2; }
    else if (windowWidth < 1920 && windowWidth >= 1440) { return .175; }
    else if (windowWidth < 1440 && windowWidth >= 992) { return .15; }
    else if (windowWidth < 992 && windowWidth >= 640) { return .1; }
    else { return .075; }
}

var Ball = {
    new: function (incrementedSpeed) {
        return {
            width: this.canvas.height / 40,
            height: this.canvas.height / 40,
            x: (this.canvas.width / 2) - (this.canvas.height / 80),
            y: (this.canvas.height / 2) - (this.canvas.height / 80),
            moveX: DIRECTION.IDLE,
            moveY: DIRECTION.IDLE,
            speed: incrementedSpeed || setBallSpeed(),
        };
    }
};
var Ai = {
    new: function (side) {
        return {
            width: this.canvas.height / 40,
            height: this.canvas.height / 5,
            x: side === 'left' ? (this.canvas.width * paddleMargin()) - (this.canvas.height / 40) : (this.canvas.width * (1 - paddleMargin())),
            y: (this.canvas.height / 2) - this.canvas.height / 10,
            score: 0,
            move: DIRECTION.IDLE,
            speed: setPaddleSpeed()
        };
    }
};
 
var Game = {
    initialize: function () {
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');
 
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
 
        this.player = Ai.new.call(this, 'left');
        this.ai = Ai.new.call(this, 'right');
        this.ball = Ball.new.call(this);

        this.ai.speed = setPaddleSpeed() * .95;
        this.running = this.over = false;
        this.turn = this.ai;
        this.timer = this.round = 0;

        gameStart.style.display = 'block';
        gameWon.style.display = 'none';
        gameEnd.style.display = 'none';

        countdownNumber = 4;
 
        Pong.menu();
        Pong.listen();
    },
 
    endGameMenu: function (text) {
        setTimeout(function () {
            Pong = Object.assign({}, Game);
            Pong.initialize();
        }, 3000);
    },
 
    menu: function () {
        Pong.draw();
    },
 
    // Update all objects (move the player, ai, ball, increment the score, etc.)
    update: function () {
        if (!this.over) {
            gameMode.classList.remove('paused');
            // If the ball collides with the bound limits - correct the x and y coords.
            if (this.ball.x <= 0) Pong._resetTurn.call(this, this.ai, this.player);
            if (this.ball.x >= this.canvas.width - this.ball.width) Pong._resetTurn.call(this, this.player, this.ai);
            if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
            if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;
 
            // Move player if they player.move value was updated by a keyboard event
            if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
            else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;
 
            // On new serve (start of each turn) move the ball to the correct side
            // and randomize the direction to add some challenge.
            if (Pong._turnDelayIsOver.call(this) && this.turn) {
                this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
                this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][Math.round(Math.random())];
                if (this.ball.moveX === DIRECTION.LEFT) {
                    //this.ball.x = this.canvas.width / 2 + 100;
                    this.ball.x = this.canvas.width - (this.canvas.width / 5);
                } else {
                    //this.ball.x = this.canvas.width / 2 - 100;
                    this.ball.x = this.canvas.width / 5;
                }
                //this.ball.y = Math.floor(Math.random() * this.canvas.height - 200) + 200;
                this.ball.y = Math.floor(Math.random() * this.canvas.height / 5) + (this.canvas.height / 5);
                this.turn = null;
            }
 
            // If the player collides with the bound limits, update the x and y coords.
            if (this.player.y <= 0) this.player.y = 0;
            else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);
 
            // Move ball in intended direction based on moveY and moveX values
            if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
            else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
            if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
            else if (this.ball.moveX === DIRECTION.RIGHT) this.ball.x += this.ball.speed;
 
            // Handle ai (AI) UP and DOWN movement
            if (this.ai.y > this.ball.y - (this.ai.height / 2)) {
                if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y -= this.ai.speed / 1.5;
                else this.ai.y -= this.ai.speed / 4;
            }
            if (this.ai.y < this.ball.y - (this.ai.height / 2)) {
                if (this.ball.moveX === DIRECTION.RIGHT) this.ai.y += this.ai.speed / 1.5;
                else this.ai.y += this.ai.speed / 4;
            }
 
            // Handle ai (AI) wall collision
            if (this.ai.y >= this.canvas.height - this.ai.height) this.ai.y = this.canvas.height - this.ai.height;
            else if (this.ai.y <= 0) this.ai.y = 0;
 
            // Handle Player-Ball collisions
            if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
                if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
                    this.ball.x = (this.player.x + this.ball.width);
                    this.ball.moveX = DIRECTION.RIGHT;
 
                }
            }
 
            // Handle ai-ball collision
            if (this.ball.x - this.ball.width <= this.ai.x && this.ball.x >= this.ai.x - this.ai.width) {
                if (this.ball.y <= this.ai.y + this.ai.height && this.ball.y + this.ball.height >= this.ai.y) {
                    this.ball.x = (this.ai.x - this.ball.width);
                    this.ball.moveX = DIRECTION.LEFT;
 
                }
            }
        }
 
        // Handle the end of round transition
        // Check to see if the player won the round.
        if (this.player.score === rounds[this.round]) {
            // Check to see if there are any more rounds/levels left and display the victory screen if
            // there are not.
            if (!rounds[this.round + 1]) {
                this.over = true;
                let count = 5;
                const countDown = document.getElementById('restartCountdown1');
                countDown.textContent = count;
                gameMode.classList.add('paused');
                gameStart.style.display = 'none';
                gameEnd.style.display = 'none';
                gameWon.style.display = 'block';
                const interval = setInterval(() => {
                    countDown.textContent = count-1;
                    count--;
                    if (count < 0) {
                        clearInterval(interval);
                        countDown.textContent = '0';
                    }
                }, 1000);
                setTimeout(function () { Pong.endGameMenu('Winner!'); }, 3000);
            } else {
                // If there is another round, reset all the values and increment the round number.
                this.player.score = this.ai.score = 0;
                this.player.speed += 0.5;
                this.ai.speed += 1;
                this.ball.speed += 1;
                this.round += 1;
                if(this.round == finalRound) {
                    nextRound.textContent = 'win!';
                }
            }
        }
        // Check to see if the ai/AI has won the round.
        else if (this.ai.score === rounds[this.round]) {
            this.over = true;
            let count = 5;
            const countDown = document.getElementById('restartCountdown2');
            countDown.textContent = count;
            gameStart.style.display = 'none';
            gameWon.style.display = 'none';
            gameEnd.style.display = 'block';
            gameMode.classList.add('paused');
            const interval = setInterval(() => {
                countDown.textContent = count-1;
                count--;
                if (count < 0) {
                    clearInterval(interval);
                    countDown.textContent = '0';
                }
            }, 1000);
            setTimeout(function () { Pong.endGameMenu('Game Over!'); }, 3000);
        }
    },
 
    // Draw the objects to the canvas element
    draw: function () {
        // Clear the Canvas
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
        // Set the fill style to black
        this.context.fillStyle = this.color; 
        // Set the fill style to white (For the paddles and the ball)
        this.context.fillStyle = '#e8b62a';
 
        // Draw the Player
        this.context.fillRect(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );
 
        // Draw the Ai
        this.context.fillRect(
            this.ai.x,
            this.ai.y,
            this.ai.width,
            this.ai.height 
        );
 
        // Draw the Ball
        if (Pong._turnDelayIsOver.call(this)) {
            this.context.fillRect(
                this.ball.x,
                this.ball.y,
                this.ball.width,
                this.ball.height
            );
        }
        // javascript score (RM way)
        var scorePlayer = document.getElementById('scorePlayer'),
            scoreComputer = document.getElementById('scoreComputer'),
            gameLevel = document.getElementById('gameLevel'),
            gameLevelPoints = document.getElementById('levelGoal');
        scorePlayer.textContent = this.player.score.toString();
        scoreComputer.textContent = this.ai.score.toString();
        gameLevel.textContent = (Pong.round + 1);
        gameLevelPoints.textContent = rounds[Pong.round] ? rounds[Pong.round] : rounds[Pong.round - 1];
    },
 
    loop: function () {
        Pong.update();
        Pong.draw();
 
        // If the game is not over, draw the next frame.
        if (!Pong.over) requestAnimationFrame(Pong.loop);
    },
 
    listen: function () {

        document.addEventListener('keydown', function (key) {
            // Handle the 'Press any key to begin' function and start the game.
            if (Pong.running === false) {
                Pong.running = true;
                window.requestAnimationFrame(Pong.loop);
            }
 
            // Handle up arrow and w key events
            if (key.keyCode === 38 || key.keyCode === 87) Pong.player.move = DIRECTION.UP;
 
            // Handle down arrow and s key events
            if (key.keyCode === 40 || key.keyCode === 83) Pong.player.move = DIRECTION.DOWN;
        });
 
        // Stop the player from moving when there are no keys being pressed.
        document.addEventListener('keyup', function (key) { Pong.player.move = DIRECTION.IDLE; });

        // Unified event handlers
        var handleButtonDown = function(moveDirection) {
            return function(e) {
                e.preventDefault(); // Prevents additional mouse event or scrolling on touch devices
                Pong.player.move = moveDirection;
                if (Pong.running === false) {
                    Pong.running = true;
                    window.requestAnimationFrame(Pong.loop);
                }
            };
        };

        var handleButtonUp = function() {
            Pong.player.move = DIRECTION.IDLE;
        };

        // Attach event listeners for buttonUp
        var buttonUp = document.getElementById('buttonUp');
        buttonUp.addEventListener('mousedown', handleButtonDown(DIRECTION.UP));
        buttonUp.addEventListener('touchstart', handleButtonDown(DIRECTION.UP));
        buttonUp.addEventListener('mouseup', handleButtonUp);
        buttonUp.addEventListener('touchend', handleButtonUp);

        // Attach event listeners for buttonDown
        var buttonDown = document.getElementById('buttonDown');
        buttonDown.addEventListener('mousedown', handleButtonDown(DIRECTION.DOWN));
        buttonDown.addEventListener('touchstart', handleButtonDown(DIRECTION.DOWN));
        buttonDown.addEventListener('mouseup', handleButtonUp);
        buttonDown.addEventListener('touchend', handleButtonUp);
    },
 
    // Reset the ball location, the player turns and set a delay before the next round begins.
    _resetTurn: function(victor, loser) {
        this.ball = Ball.new.call(this, this.ball.speed);
        this.turn = loser;
        this.timer = (new Date()).getTime();
 
        victor.score++;
    },
 
    // Wait for a delay to have passed after each turn.
    _turnDelayIsOver: function() {
        return ((new Date()).getTime() - this.timer >= 1000);
    }

};
 
var Pong = Object.assign({}, Game);
Pong.initialize();

function resizeCanvas() {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
    var canvas = document.getElementById('wkwpong');
    if (canvas) {
        canvas.width = windowWidth;
        canvas.height = windowHeight;

        Pong = Object.assign({}, Game);
        Pong.initialize();
    }
}
window.addEventListener('resize', resizeCanvas);
