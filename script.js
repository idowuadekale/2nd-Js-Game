let canvas = document.getElementById('myCanvas');
/** @type {CanvasRenderingContext2D}  */
let ctx = canvas.getContext("2d");

//Beginning of the code to create a cursor in a circle 

let mouseX = 0;
let mouseY = 0;
let posX = 0;
let posY = 0;
let alpha = 1;

const circle = document.querySelector(".circle");

addEventListener("mousemove", ({ clientX, clientY }) => {
    mouseX = clientX;
    mouseY = clientY;
    // arbitrary high value so that it takes a moment until it actually fades out.
    alpha = 5;
});

let prev = 0;
requestAnimationFrame(function render(now) {
    requestAnimationFrame(render);

    // expecting a 16ms frame interval, 
    // check how the current update interval compared to that
    const factor = (now - prev) / 16;
    prev = now;

    // how quickly to follow the cursor
    const speed = .125;

    // adjusted for differences in update interval.
    posX += factor * speed * (mouseX - posX);
    posY += factor * speed * (mouseY - posY);
    // fade out
    alpha *= Math.pow(.95, factor);

    circle.style.transform = `translate(${posX}px, ${posY}px)`;

    let opacity = Math.min(1, alpha);

    // round the value to closest 1/255 step
    // opacity ain't more precise and that way we don't set 
    // "new values" that compute to the same opacity.
    circle.style.opacity = Math.round(opacity * 255) / 255;
});

//Ending of the code to create a cursor in a circle

//globals
(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
    var cancvelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
})();
var animationID;

// ################################################################### load sprites
let spriteBase64 = "./images/sprite_.png";
const tank = new Image();
tank.src = spriteBase64;
const invader = new Image();
invader.src = spriteBase64;
var startScreenTimeout;
// ################################################################### tank and sprite

var frameCount = 0;
var armyPrevFrameCount = 0;
var framesInOneSec = 1000 / 16;
var spritUnitHeight = 35;
var spriteUnitWidth = 64;
var scoreBarHeight = 50;
var tank__bottomOffset = (spritUnitHeight / 2) + scoreBarHeight;
var tankX = canvas.width / 2;
var tankdX = 4;
var tankY = canvas.height - (tank__bottomOffset);
var tankWidth = spriteUnitWidth / 2;
var tankHeight = spritUnitHeight / 2
var keys = [];

// ################################################################### score and lives
var score = 0;
var allowedLives = 5;
var lives = allowedLives;
var hasLifeDecreased = false;
var gameRunning = false;
// ################################################################### Invaders rows columns
var invaderWidth = spriteUnitWidth / 2.5;
var invaderHeight = spritUnitHeight / 2.5;
var invaderSpriteHeight = spritUnitHeight;
var invaderSpriteHeightsArray = [
    [68, 102],
    [102, 134],
    [102, 134],
    [0, 34],
    [0, 34]
];
var spriteSelector = 0;
var armyRows = 5;
var armyColumns = 10;
var armyX = 60;
var armyY = 60;
var invaderLeftOffset = 15;
var invaderTopOffset = 20;
var armyDirection = "right";
var armyDx = 10;
var armyDy = 10;
var armySpeed = 50;
var armySpeed__decrement = 5;
let aliveInvaders = armyColumns * armyRows;
var armyInvaderBulletsSpeed = 7;
var armyArray = [];
// ################################################################### bullet
var bullet__height = 15;
var bullet__width = 3;
var tankBullet__x;
var tankBullet__y;
var shouldMoveTankBullet = false;
var tankBullet__dy = 12;

var invaderBulletsArray = [];
var invBullet_dy = 5;
var invBullet__prevFrameCount = 4;

// ################################################################### explosion variables
// Options
const background = '#FFF';
var particlesPerExplosion = 50;
const particlesMinSpeed = 1;
const particlesMaxSpeed = 6;
const particlesMinSize = 1;
var particlesMaxSize = 8;
const explosions = [];
var explosionColor = "white";
let fps = 60;
const interval = 1000 / fps;

let now, delta;
let then = Date.now();

// Optimization for mobile devices
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    fps = 29;
}

// ##################################################################

// ################################################################### main game loop
window.addEventListener('load', function() {
    drawStartScreen();
})

function startGame() {
    clearInterval(startScreenTimeout);
    gameRunning = true;
    gameInit();
    constructArmy(armyX, armyY);
    gameLoop();
}

function gameInit() {
    invaderBulletsArray = [];
    armyArray = [];
    score = 0;
    lives = allowedLives;
    armyDirection = "right";
    aliveInvaders = armyColumns * armyRows;
    frameCount = 0;
    armyPrevFrameCount = 0;
    invBullet__prevFrameCount = 0;
    hasLifeDecreased = false;
    armySpeed = 40;
}

function gameLoop() {
    //game lost by losing lives
    if (lives <= 0 || !gameRunning) {
        gameRunning = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawScore();
        drawLives();
        drawGameOver("you lost");
        drawBottomHelper();
        return false;
    }
    //game won by killing invaders
    if (aliveInvaders == 0) {
        gameRunning = false;
        drawGameOver("you won");
        drawBottomHelper();
        return false;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    helperHandler();
    drawScoreSeprateLine();
    drawScore();
    drawLives();
    moveArmy();
    drawArmyOfInvaders();
    keyPressed();
    drawTank(tankX, tankY);
    if (shouldMoveTankBullet) {
        drawBullet(tankBullet__x, tankBullet__y);
        moveTankBullet();
    }
    invadersBulletHandler();
    animationID = requestAnimationFrame(gameLoop);
    frameCount++;
    //explosion
    now = Date.now();
    delta = now - then;
    if (delta > interval) {
        then = now - (delta % interval);
        drawExplosion();
    }
    //explosion

}
// ###################################################################







// ################################################################### event listeners
window.addEventListener("keydown", () => keys[event.keyCode] = true);
window.addEventListener("keyup", () => keys[event.keyCode] = false);
window.addEventListener("keypress", keypressedHandler);

function keyPressed() {
    if (keys[37]) {
        if (tankX - tankdX > 0) {
            tankX -= tankdX;
        }
    }
    if (keys[39]) {
        if (canvas.width - (tankX + tankWidth) > tankdX) {
            tankX += tankdX;
        }
    }
    if (keys[88] || keys[32]) {
        if (!shouldMoveTankBullet) fireTankBullet();
    }
}

function keypressedHandler() {
    if (event.keyCode == "13" && !gameRunning) {
        startGame();
    }
}

// ###################################################################


// ################################################################### handlers
function invadersBulletHandler() {
    if (invaderBulletsArray.length < 5 && frameCount - invBullet__prevFrameCount > (armySpeed * armyInvaderBulletsSpeed)) {
        generateInvaderRandomBullet();
        invBullet__prevFrameCount = frameCount;
    }
    moveInvaderBullets();

}

function generateInvaderRandomBullet() {
    // let randomInvaderR = genRandomNumber(armyRows); 
    // let randomInvaderC = genRandomNumber(armyColumns); 
    // let rInvader = armyArray[randomInvaderR][randomInvaderC];
    let aliveArmy = [];
    for (let i = 0; i < armyRows; i++) {
        for (let j = 0; j < armyColumns; j++) {
            let soldier = armyArray[i][j];
            if (soldier.status == 'alive')
                aliveArmy.push(armyArray[i][j]);
        }
    }

    let rInvader = aliveArmy[genRandomNumber(aliveArmy.length)];
    if (rInvader.status == 'alive') {
        let iBullet = {
            x: rInvader.x + invaderWidth / 2,
            y: rInvader.y + invaderHeight
        };
        invaderBulletsArray.push(iBullet);
        drawInvaderBullet(iBullet.x, iBullet.y);
    }


}

function genRandomNumber(rng) {
    return Math.floor(Math.random() * rng);
}

function moveInvaderBullets() {
    for (let i = 0; i < invaderBulletsArray.length; i++) {
        let iB = invaderBulletsArray[i];
        iB.y = iB.y + invBullet_dy;
        //check if bullet out of bounds
        if (iB.y > canvas.height) {
            invaderBulletsArray.splice(i, 1);
        }
        //check if game over by hit bullet
        if (
            iB.x > tankX &&
            iB.x < tankX + tankWidth &&
            iB.y > tankY &&
            iB.y < tankY + tankHeight
        ) {
            explosionColor = "#ff0000";
            particlesPerExplosion = 150;
            particlesMaxSize = 4;
            triggerExplosion(tankX + tankWidth / 2, tankY + tankHeight / 2);
            invaderBulletsArray.splice(i, 1);
            console.log("lost 1 life");
            lives--;
            hasLifeDecreased = true;
        }

        drawInvaderBullet(iB.x, iB.y);

    }
}

function helperHandler() {
    if (aliveInvaders == armyColumns * armyRows) {
        drawBottomMessage("press SPACE to fire bullet", 125);
    } else
    if (hasLifeDecreased) {
        drawBottomMessage(`HIT. Lives Left: ${lives}`, 150);
        setTimeout(() => {
            hasLifeDecreased = false;
            drawBottomMessage(``, 150);
        }, 2000);
    }

}

// ################################################################### draw functions
function drawInvader(x, y, sHeight) {
    ctx.beginPath();
    ctx.drawImage( // Image
        invader,
        // ---- Selection ----
        0, // sx
        sHeight, // sy
        spriteUnitWidth, // sWidth
        spritUnitHeight, // sHeight
        // ---- Drawing ----
        x, // dx
        y, // dy
        invaderWidth, // dWidth
        invaderHeight // dHeight 
    );
    ctx.closePath();
}


function drawTank(x, y) {
    ctx.beginPath();
    ctx.drawImage( // Image
        tank,
        // ---- Selection ----
        0, // sx
        tank.height - 50, // sy
        tank.width, // sWidth
        spritUnitHeight, // sHeight
        // ---- Drawing ----
        x, // dx
        y, // dy
        tankWidth, //42, // dWidth
        tankHeight //24 // dHeight 
    );
    ctx.closePath();
}


function moveArmy() {
    if (frameCount - armyPrevFrameCount > armySpeed) {
        armyPrevFrameCount = frameCount;
        invaderSpriteHeight = spritUnitHeight - invaderSpriteHeight;
        spriteSelector = 1 - spriteSelector;
    } else {
        return false;
    }
    let dx;
    let dy = 0;
    if (armyDirection == 'right') {
        if (canvas.width - (armyX + (invaderWidth + invaderLeftOffset) * (armyColumns - 1)) > invaderWidth) {
            dx = 1;
        } else {
            armyDirection = 'left';
            dx = -1;
            dy = armyDy;
        }

    } else
    if (armyDirection == 'left') {
        if (armyX - armyDx > 0) {
            dx = -1;
        } else {
            armyDirection = 'right';
            dx = 1;
            dy = armyDy;
        }

    }

    armyX += armyDx * (dx);
    updateArmy(dx * (armyDx), dy)
}


function constructArmy(aX, aY) {
    for (let i = 0; i < armyRows; i++) {
        armyArray[i] = [];
        for (let j = 0; j < armyColumns; j++) {
            armyArray[i][j] = {
                x: aX + j * (invaderWidth + invaderLeftOffset),
                y: aY + i * (invaderHeight + invaderTopOffset),
                status: "alive"
            };
        }
    }
}

function updateArmy(adx, ady) {
    for (let i = 0; i < armyRows; i++) {
        for (let j = 0; j < armyColumns; j++) {
            let soldier = armyArray[i][j];
            soldier.x = soldier.x + (adx);
            soldier.y = soldier.y + ady;

        }
    }
}

function drawArmyOfInvaders() {
    for (let i = 0; i < armyRows; i++) {
        for (let j = 0; j < armyColumns; j++) {
            let soldier = armyArray[i][j];
            if (soldier.status == 'alive') {
                // drawInvader(soldier.x,soldier.y,invaderSpriteHeight);
                drawInvader(soldier.x, soldier.y, invaderSpriteHeightsArray[i][spriteSelector]);
                //chekc if game over by collision
                if (soldier.y > tankY) {
                    gameRunning = false;
                }
            }

        }
    }
}


function drawBullet(bx, by) {
    ctx.beginPath();
    ctx.beginPath(); // Start a new path
    ctx.moveTo(bx, by); // Move the pen to (30, 50)
    ctx.lineTo(bx, by - bullet__height); // Draw a line to (150, 100)
    ctx.lineWidth = bullet__width + 5;
    ctx.strokeStyle = "firebrick";
    ctx.stroke();
}

function fireTankBullet() {
    tankBullet__x = tankX + tankWidth / 2;
    tankBullet__y = canvas.height - tank__bottomOffset;
    drawBullet(tankBullet__x, tankBullet__y);
    moveTankBullet();
    shouldMoveTankBullet = true;
}

function moveTankBullet() {
    if (tankBullet__y < 0) {
        shouldMoveTankBullet = false;
    }
    //check if a invader is hit by the bullet
    for (let i = 0; i < armyRows; i++) {
        for (let j = 0; j < armyColumns; j++) {
            let soldier = armyArray[i][j];
            if (
                tankBullet__x > soldier.x &&
                tankBullet__x < soldier.x + invaderWidth &&
                tankBullet__y > soldier.y &&
                tankBullet__y < soldier.y + invaderHeight &&
                soldier.status == 'alive'
            ) {
                soldier.status = 'dead';
                shouldMoveTankBullet = false;
                aliveInvaders--;
                score++;
                explosionColor = "darkorange";
                particlesPerExplosion = 50;
                particlesMaxSize = 3;
                triggerExplosion(soldier.x + invaderWidth / 2, soldier.y + invaderHeight / 2);
                //increase speed
                if ((aliveInvaders) % armyColumns == 0 && armySpeed > 10) {
                    armySpeed -= armySpeed__decrement;
                    console.log("speed increase: " + armySpeed);
                }
            }

        }
    }
    //check if a invader is hit by the bullet    

    tankBullet__y -= tankBullet__dy;
}

function drawScoreSeprateLine() {
    ctx.beginPath();
    ctx.beginPath(); // Start a new path
    ctx.moveTo(0, canvas.height - (scoreBarHeight - 15)); // Move the pen to (30, 50)
    ctx.lineTo(canvas.width, canvas.height - (scoreBarHeight - 15)); // Draw a line to (150, 100)
    ctx.lineWidth = 2;
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 1;
    ctx.shadowOffsetY = -1;
    ctx.shadowColor = "tomato";
    ctx.strokeStyle = "tomato";
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowOffsetY = 0;
}



function drawBottomMessage(message, sx) {
    ctx.beginPath();
    ctx.font = "20px Play";
    ctx.fillStyle = "silver";
    ctx.fillText(message, sx, canvas.height - 10);
    ctx.closePath();
}

function drawScore() {
    drawBottomMessage("Score: " + score, canvas.width - 90)
}

function drawLives() {
    drawBottomMessage("Lives: " + lives, 10)
}

function drawBottomHelper() {
    drawBottomMessage("Press enter to play", 150)
}


function drawInvaderBullet(ix, iy) {
    ctx.beginPath();
    ctx.beginPath(); // Start a new path
    ctx.moveTo(ix, iy); // Move the pen to (30, 50)
    ctx.lineTo(ix, iy + bullet__height); // Draw a line to (150, 100)
    ctx.lineWidth = bullet__width;
    ctx.strokeStyle = "#FF0000";
    ctx.stroke();
}

function drawGameOver(message) {
    drawBlinker(function() { drawScreen__line1("Game Over ") }, function() { drawScreen__line2(message) });
}


function drawBlinker(func1, func2) {
    let counter = 0;
    startScreenTimeout = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height - 50);
        func1();
        if (counter % 3 == 0) func2();
        counter++;
    }, 400);
}

function drawStartScreen() {
    drawBlinker(function() { drawScreen__line1("Space Invaders") }, function() { drawScreen__line2("press enter to play") });
}



function drawScreen__line1(message) {
    ctx.save();
    ctx.beginPath();
    ctx.font = "60px Play";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    ctx.closePath();
    ctx.restore();
}

function drawScreen__line2(message) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = "gold";
    ctx.textAlign = "center";
    ctx.font = "40px Play";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 60);
    ctx.closePath();
    ctx.restore();
}

// ###################################################################

// ################################################################### Explosion functions

// Draw explosion(s)
function drawExplosion() {

    if (explosions.length === 0) {
        return;
    }

    for (let i = 0; i < explosions.length; i++) {

        const explosion = explosions[i];
        const particles = explosion.particles;

        if (particles.length === 0) {
            explosions.splice(i, 1);
            return;
        }

        const particlesAfterRemoval = particles.slice();
        for (let ii = 0; ii < particles.length; ii++) {

            const particle = particles[ii];

            // Check particle size
            // If 0, remove
            if (particle.size <= 0) {
                particlesAfterRemoval.splice(ii, 1);
                continue;
            }

            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, Math.PI * 2, 0, false);
            ctx.closePath();
            //ctx.fillStyle = 'rgb(' + particle.r + ',' + particle.g + ',' + particle.b + ')';
            ctx.fillStyle = explosionColor;
            ctx.fill();

            // Update
            particle.x += particle.xv;
            particle.y += particle.yv;
            particle.size -= .1;
        }

        explosion.particles = particlesAfterRemoval;

    }

}


// Clicked
function triggerExplosion(triggerX, triggerY) {

    let xPos, yPos;

    // if (e.offsetX) {
    //   xPos = e.offsetX;
    //   yPos = e.offsetY;
    // } else if (e.layerX) {
    //   xPos = e.layerX;
    //   yPos = e.layerY;
    // }

    xPos = triggerX;
    yPos = triggerY;
    explosions.push(
        new explosion(xPos, yPos)
    );

}

// Explosion
function explosion(x, y) {

    this.particles = [];

    for (let i = 0; i < particlesPerExplosion; i++) {
        this.particles.push(
            new particle(x, y)
        );
    }

}

// Particle
function particle(x, y) {
    this.x = x;
    this.y = y;
    this.xv = randInt(particlesMinSpeed, particlesMaxSpeed, false);
    this.yv = randInt(particlesMinSpeed, particlesMaxSpeed, false);
    this.size = randInt(particlesMinSize, particlesMaxSize, true);
    this.r = randInt(113, 222);
    this.g = '00';
    this.b = randInt(105, 255);
}

// Returns an random integer, positive or negative
// between the given value
function randInt(min, max, positive) {

    let num;
    if (positive === false) {
        num = Math.floor(Math.random() * max) - min;
        num *= Math.floor(Math.random() * 2) === 1 ? 1 : -1;
    } else {
        num = Math.floor(Math.random() * max) + min;
    }

    return num;

}




// ################################################################### Explosion functions

// ############################################################################## Github Function
function myFunction() {
    alert("You are going to Idowu Adekale Github");
}

// ############################################################################ Preloader/ Spinner
$(window).on('load', function() {
    $(".loadingDiv-parent").fadeOut("slow");
});
$(window).on('beforeunload', function() {
    $(".loadingDiv-parent").fadeIn(10);
});