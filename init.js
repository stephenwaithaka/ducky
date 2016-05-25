var context;
var queue;
var WIDTH = 1024;
var HEIGHT = 768;
var mouseXPosition;
var mouseYPosition;
var duckImage;
var stage;
var animation;
var deathAnimation;
var spriteSheet;
var enemyXPos=100;
var enemyYPos=100;
var enemyXSpeed = 1.5;
var enemyYSpeed = 1.75;
var score = 0;
var scoreText;
var gameTime = 0;
var timerText;

window.onload = function()
{
    /*
     * Creating the canvas size and height which is the area of the game
     */
    var canvas = document.getElementById("myCanvas");
    context = canvas.getContext("2d");
    context.canvas.width = WIDTH;
    context.canvas.height = HEIGHT;
    stage = new createjs.Stage("myCanvas");

    /*
     *Pre-load contents including offereing alternative sound formats and all the contents
     *of the game
      */

    queue = new createjs.LoadQueue(false); // Force tag loading
    queue.installPlugin(createjs.Sound);
    queue.on("complete", queueLoaded, this);
    createjs.Sound.alternateExtensions = ["ogg"];

    /*
     *Create a load manifest for all the required assets
     */

    queue.loadManifest([
        //http://users.metropolia.fi/~stephenw/web-programming/ducky/
        {id : "backgroundImage", src: "assets/background.png"},
        {id : "aimSight", src: "assets/aimSight.png"},
        {id : "shot", src: "assets/shot.mp3"},
        {id : "background", src: "assets/countryside.mp3"},
        {id : "gameOverSound", src: "assets/gameOver.mp3"},
        {id : "tick", src: "assets/tick.mp3"},
        {id : "deathSound", src: "assets/die.mp3"},
        {id : "duckSpritesheet", src: "assets/duckSpritesheet.png"},
        {id : "duckDeath", src: "assets/duckDeath.png"},
        
    ]);
    queue.load(); 
    
    /*
     *Creating a timer that updates once per second
     */
    
    var gameTimer = setInterval(updateTime, 1000);
    
}
    
    
function queueLoaded(event)
{
    // Begin by loading the background image
    var backgroundImage = new createjs.Bitmap(queue.getResult("backgroundImage"))
    stage.addChild(backgroundImage);
    
    //Add score
    scoreText = new createjs.Text("U av: " + score.toString(), "26px Arial", "#FFF");
    scoreText.x = 10;
    scoreText.y = 10;
    stage.addChild(scoreText);
    
    //Add timer
    timerText = new createjs.Text("Time: " + gameTime.toString(), "26px Arial", "#FFF");
    timerText.x = 800;
    timerText.y = 10;
    stage.addChild(timerText);
    
    //Play background sound
    createjs.Sound.play("background", {loop: -1});
    
    /*creating the duck spritesheet:
     *A sprite sheet is a series of images (usually animation frames)
     *combined into a larger image (or images).
     *Here we define the images to use, the position of the individual frames
     *the animations to occur
     */
    
    spriteSheet = new createjs.SpriteSheet({
        "images": [queue.getResult('duckSpritesheet')],
        "frames": {"width": 198, "height": 117},
        "animations": {"flap": [0,4]}
        
    });
    
    duckDeathSpriteSheet = new createjs.SpriteSheet({
        "images": [queue.getResult('duckDeath')],
        "frames": {"width": 198, "height": 148},
        "animations": {"die": [0,7, false, 1]}
        
    });
    
    //create duck sprite
    
    createEnemy();
    
    //Creating aiming sights
    aimSight = new createjs.Bitmap(queue.getResult("aimSight"));
    stage.addChild(aimSight);
    
    /*Add ticker: It provides a centralized tick
     *or heartbeat broadcast at a set interval.
     */
    
    createjs.Ticker.setFPS(15);
    createjs.Ticker.addEventListener("tick", stage);
    createjs.Ticker.addEventListener("tick", tickEvent);
    
    //Set up events after the game is loaded
    
    window.onmousemove = handleMouseMove;
    window.onmousedown = handleMouseDown;
           
}
    
function createEnemy()
{
    animation = new createjs.Sprite(spriteSheet, "flap");
    animation.regX = 99;
    animation.regY = 58;
    animation.x = enemyXPos;
    animation.y = enemyYPos;
    animation.gotoAndPlay("flap");
    stage.addChildAt(animation,1);
            
}
    
function duckDeath()
{
    deathAnimation = new createjs.Sprite(duckDeathSpriteSheet, "die");
    deathAnimation.regX = 99;
    deathAnimation.regY = 58;
    deathAnimation.x = enemyXPos;
    deathAnimation.y = enemyYPos;
    deathAnimation.gotoAndPlay("die");
    stage.addChild(deathAnimation);
    
}
    
function tickEvent()
{
    // Guarantee that the enemy is within the game boundaries andthen move the duck
    if (enemyXPos < WIDTH && enemyXPos > 0)
    {
        enemyXPos += enemyXSpeed;
        
    } else
    {
        enemyXSpeed = enemyXSpeed * (-1);
        enemyXPos += enemyXSpeed;           
        
    }
    
    if (enemyYPos < HEIGHT && enemyYPos > 0)
    {
        enemyYPos += enemyYSpeed;
    }else
    {
        enemyYSpeed = enemyYSpeed * (-1);
        enemyYPos += enemyYSpeed;
    }
    
    animation.x = enemyXPos;
    animation.y = enemyYPos;
    
}
    
function handleMouseMove(event)
{
    aimSight.x = event.clientX-45;
    aimSight.y = event.clientY-45;
}

function handleMouseDown(event)
{
    //Gunshot sound
    createjs.Sound.play("shot");
    
    //Increasing speed of the enemy
    enemyXSpeed *= 1.05;
    enemyYSpeed *= 1.06;
    
    //Obtain shot position
    var shotX = Math.round(event.clientX);
    var shotY = Math.round(event.clientY);
    var spriteX = Math.round(animation.x);
    var spriteY = Math.round(animation.y);
    
    //Compute X and Y distance using the absolute value
    var distX = Math.abs(shotX - spriteX);
    var distY = Math.abs(shotY - spriteY);
    
    //If you hit the body or head then its a hit but the wings is a miss.
    if (distX < 30  && distY <59)
    {
        //Hit it
        stage.removeChild(animation);
        duckDeath();
        score+=100;
        scoreText.text = "U ave: " + score.toString();
        createjs.Sound.play("deathSound");
        
        //speed increase a bit more
        enemyYSpeed *= 1.25;
        enemyXSpeed *= 1.3;
        
        // a new enemy is created
        
        var timeToCreate = Math.floor((Math.random()* 3500)+ 1);
        setTimeout(createEnemy, timeToCreate);
        
    }else
    {
        //Miss
        score -= 10;
        scoreText.text = "U ave: " + score.toString();
        
    }
}
    
function updateTime()
{
    gameTime += 1;
    if (gameTime > 60)
    {
        // End game and clean up
        timerText.text = "GAME IS OVER";
        stage.removeChild(animation);
        stage.removeChild(aimSight);
        var si = createjs.Sound.play("gameOverSound");
        clearInterval(gameTimer);
        
    }
    else
    {
        timerText.text = "Time: " + gameTime
        createjs.Sound.play("tick");
    }
}
    
    
