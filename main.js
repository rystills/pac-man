/**
 * create a list of keystates, maintained by event listeners
 */
function setupKeyListeners() {
	keyStates = [];
	//add keydown and keyup events for all keys
	document.body.addEventListener("keydown", function (e) {
		keyStates[String.fromCharCode(e.keyCode)] = true;
	});
	document.body.addEventListener("keyup", function (e) {
		keyStates[String.fromCharCode(e.keyCode)] = false;
	});
	
	//mouse event listeners (down is triggered every frame, pressed is only triggered on the first frame)
	mouseDownLeft = false;
	mousePressedLeft = false;
	mouseDownRight = false;
	mousePressedRight = false;
	canvas.mousePos = {x:0,y:0};
	HUDLeft.mousePos = {x:0,y:0};
	HUDRight.mousePos = {x:0,y:0};
	
	document.body.addEventListener("mousemove", function (e) {
		var canvases = [canvas,HUDLeft,HUDRight];
		//store the relative mouse position for each canvas
		for (var i = 0; i < canvases.length; ++i) {
			canvases[i].mousePos = getMouseDocument(e,canvases[i]);
		}
	});
	document.body.addEventListener("mousedown", function (e) {
		if (e.button == 0) {
			//left click press detected
			mouseDownLeft = true;
			mousePressedLeft = true;
		}
		else if (e.button == 2) {
			//right click press detected
			mouseDownRight = true;
			mousePressedRight = true;
		}
	});
	document.body.addEventListener("mouseup", function (e) {
		if (e.button == 0) {
			//left click release detected
			mouseDownLeft = false;
		}
		else if (e.button == 2) {
			//right click release detected
			mouseDownRight = false;
		}
	});
}

/**
 * get the position of the mouse in the document
 * @param evt: the currently processing event
 * @param cnv: the canvas to check mouse position against
 * @returns an object containing the x,y coordinates of the mouse
 */
function getMouseDocument(evt,cnv) {
	 var rect = cnv.getBoundingClientRect();
	 return {x: evt.clientX - rect.left, y: evt.clientY - rect.top};	
}

/**
 * loads all the needed files, then calls startGame to begin the game
 */
function loadAssets() {	
	//global list of script assets and current script number
	scriptFiles = ["Button.js","levels.js","Player.js","Ghost.js","Pellet.js"];
	scriptNum = 0;
	
	//global list of script contents
	scripts = {}
	
	//quick and dirty way to store local text files as JS objects
	object = null;
	
	loadAsset(scriptFiles,0);
}

/**
 * load a single asset, setting onload to move on to the next asset
 */
function loadAsset() {
	//if the global object var contains a string, append it to the global scripts list
	if (object != null) {
		scripts[scriptFiles[scriptNum-1]] = object;
		object = null;
	}
	//once we've loaded all the objects, we are ready to start the game
	if (scriptNum >= scriptFiles.length) {
		return startGame();
	}
	
	//load the desired script file
	var elem = document.createElement('script');
	elem.type = 'text/javascript';
	elem.onload = loadAsset;
	elem.src = scriptFiles[scriptNum];
	
	//add the new script to the body and increment the script count
	document.body.appendChild(elem);
	++scriptNum;
}

/**
 * clear the entire screen to black, preparing it for a fresh render
 */
function clearScreen() {
	context.fillStyle="#000000";
	context.fillRect(0,0,canvas.width,canvas.height);
	HUDLeftContext.fillStyle="#000000";
	HUDLeftContext.fillRect(0,0,HUDLeft.width,HUDLeft.height);
	HUDRightContext.fillStyle="#000000";
	HUDRightContext.fillRect(0,0,HUDRight.width,HUDRight.height);
}

/**
 * draw a triangle connecting 3 points
 */
function drawTriangle(x1,y1,x2,y2,x3,y3) {
	//create our path
	context.beginPath();
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.lineTo(x3, y3);
    //fill the path (fill color should be set prior to calling this method)
	context.fill();
}

/**
 * begin the game, optionally resetting score and lives if this is a fresh start
 */
function restartGame(freshStart) {
	if (freshStart == null) {
		freshStart = true;
	}
	//reset game vares for a fresh run
	if (freshStart) {
		gameActive = true;
		score = 0;	
		lives = 3;
	}
	pellets = []
	createPellets();
	
	//add an extra life and subtract it to reset player and ghost positions
	++lives;
	subtractLife();

	
}

/**
 * main game loop; update all aspects of the game in-order
 */
function update() {
	//update the deltaTime
	updateTime();
	
	//update player first
	if (gameActive) {
		player.update();	
	}
	
	//next update ghosts
	for (var i = 0; i < ghosts.length; ++i) {
		ghosts[i].update();
	}
	
	//restart if all pellets have been collected
	if (pellets.length == 0) {
		restartGame(false);
	}
	
	//update GUI elements
	for (var i = 0; i < buttons.length; ++i) {
		buttons[i].update();	
	}
	
	//once all updates are out of the way, render the frame
	render();
	
	//toggle off any one-frame event indicators at the end of the update tick
	mousePressedLeft = false;
	mousePressedRight = false;
}

/**
 * draw the grid located in levels.js
 */
function drawGrid() {
	//draw each grid piece from the level file
	context.fillStyle="#4444FF";
	for (var i = 0; i < grid.length; ++i) {
		for (var r = 0; r < grid[i].length; ++r) {
			//draw walls (use 1 pixel vertical overlap to account for HTML canvas rounding issues)
			if (grid[i][r] == 0) {
				context.fillRect(r*gridWidth,i*gridHeight-1,gridWidth,gridHeight+2);
			}
		}
	}
}

/**
 * draw each pellet remaining on the stage (layout located in levels.js)
 */
function drawPellets() {
	//draw the pellets
	context.fillStyle="#BBFF00";
	for (var i = 0; i < pellets.length; ++i) {
		context.fillRect(pellets[i].x - pellets[i].width/2, pellets[i].y - pellets[i].height/2,pellets[i].width,pellets[i].height);
	}
}

/**
 * draw each ghost using the color stored in Ghost.js
 */
function drawGhosts() {
	//draw the ghosts (use 1 pixel vertical overlap to account for HTML canvas rounding issues)
	for (var i = 0; i < ghosts.length; ++i) {
		g = ghosts[i];
		context.fillStyle = g.color;
		//head (180 degree rotated semicircle)
		context.beginPath();
		context.arc(g.x, g.y, g.width/2, 1 * Math.PI, 2 * Math.PI, false);
		context.fill();
		//body (square minus a small amount from the height to leave room for bottom triangles)
		context.fillRect(g.x - g.width/2, g.y-1, g.width, g.height/2 - 3);
		//bottom (three triangles running across the width)
		var cornerX = g.x - g.width/2;
		var cornerY = g.y + g.height/2 - 5;
		for (var r = 0; r < 3; ++r) {
			leftX = cornerX + g.width/3 * r;
			rightX = cornerX + g.width/3 * (r+1);
			topY = cornerY;
			botY = cornerY + 5;
			drawTriangle(leftX,topY,rightX,topY,leftX + (rightX-leftX)/2,botY);
		}
	}
}

/**
 * draw the player with a dynamically moving mouth
 * @param posX; custom render x coordinate (defaults to player position)
 * @param posY; custom render y coordinate (defaults to player position)
 * @param ctx; custom context to draw the player on (defaults to main context)
 * @param staticOrientation; optional flag to ignore player orientation and draw facing right
 */
function drawPlayer(posX,posY,ctx,staticOrientation) {
	//set the default state for all of the optional args
	if (posY == null) {
		posX = player.x;
		posY = player.y;
	}
	if (ctx == null) {
		ctx= context;
	}
	if (staticOrientation != null) {
		dir = 0;
	}
	else {
		dir = player.direction;
	}
	
	//draw the player, only if the game is active
	if (gameActive) {
		ctx.fillStyle = "#000000";
		var radius = player.width/2;
		var rot = Math.PI/2 * dir;
		//first half of body
		ctx.beginPath();
		ctx.arc(posX, posY, radius, 
				-rot + Math.PI  * (.2 - Math.sin(totalTime*10)/5), 
				-rot + 1.25 * Math.PI, 
				false);
		ctx.fillStyle = "rgb(255, 255, 0)";
		ctx.fill();
		//second half of body
		ctx.beginPath();
		ctx.arc(posX, posY, radius, 
				-rot + 0.75 * Math.PI, 
				-rot + Math.PI * (1.8 + Math.sin(totalTime*10)/5), 
				false);
		ctx.fillStyle = "rgb(255, 255, 0)";
		ctx.fill();
		//eye
		ctx.beginPath();
		ctx.arc(posX - (dir % 2 ? radius*.5 : 0), 
				posY - (dir % 2 ? 0 : radius*.5), radius*.1, 0, 2 * Math.PI, false);
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fill();
	}
}

/**
 * draw the player's lives as a series of pac-man icons
 */
function drawLives() {
	//draw each life as a replica of the player with a fixed rotation
	var posX = HUDLeft.width/2;
	var posY = 400;
	for (var i = 0; i < lives-1; ++i) {
		drawPlayer(posX,posY + 50*i,HUDLeftContext,true);
	}
}

/**
 * render a dimming rect over the screen if the game is not active
 */
function checkDimScreen() {
	//dim the screen and show game over text if the game is not active
	if (!gameActive) {
		//dim screen with semi-transparent black rectangle
		context.fillStyle = "rgba(0,0,0,.5)";
		context.fillRect(0,0,canvas.width,canvas.height);

		//show game-over text
		context.fillStyle = "rgba(255,255,255,1)";
		
		//figure out the dimensions of the string so that we can properly center it
		var startInstructions = "PRESS ENTER TO PLAY";
		context.font = "46px Arial";
	    textWidth = context.measureText(startInstructions).width;
	    //height is roughly equivalent to the text size
	    textHeight = 46;
		context.fillText(startInstructions,canvas.width/2 - textWidth/2,canvas.height/2 + textHeight/2);
	}
}

/**
 * draw a score value vertically from top to bottom
 * @param title: the first part of the score title
 * @param cnv: the canvas to render to
 * @param scr: the score value to display
 */
function drawVerticalScore(title,cnv,scr) {
	var ctx = cnv.getContext("2d");
	//set the title font
	ctx.font = "30px Arial";
	
	//draw the score
	ctx.fillStyle = "#ffAFF8";
	//left-pad the score with 0's 
	var scoreString = scr.toString();
	var scoreLen = scoreString.length;
	while (++scoreLen < 6) {
		scoreString = "0" + scoreString;
	}
	//draw score string in vertical slices
	var scoreStringA = title;
    var textWidth = ctx.measureText(scoreStringA).width;
    //height is roughly equivalent to the text size
    var textHeight = 30;
	ctx.fillText(scoreStringA,cnv.width/2 - textWidth/2, textHeight*2);
	
	var scoreStringB = "SCORE"
    textWidth = ctx.measureText(scoreStringB).width;
    //height is roughly equivalent to the text size
	ctx.fillText(scoreStringB,cnv.width/2 - textWidth/2, textHeight*3);
	
	textWidth = ctx.measureText("0").width;
	ctx.fillStyle = "#FFFFFF";
	for (var i = 0; i < 5; ++i) {
		ctx.fillText(scoreString[i],cnv.width/2 - textWidth/2,textHeight * (5+i));
	}
}

/**
 * render all buttons to their respective canvases
 */
function drawButtons() {
	for (var i = 0; i < buttons.length; ++i) {
		var ctx = buttons[i].canvas.getContext("2d");
		ctx.font = buttons[i].fontSize + "px Arial";
		ctx.fillStyle = "rgb(" + buttons[i].blendWhiteness + ", " + buttons[i].blendWhiteness + ", " + buttons[i].blendWhiteness + ")";
		ctx.fillText(buttons[i].text,buttons[i].x - buttons[i].width/2, buttons[i].y + buttons[i].height/2);
	}
}

/**
 * render all objects and HUD elements
 */
function render() {
	//clear all canvases for a fresh render
	clearScreen();
	
	//draw grid
	drawGrid();
	
	//draw all objects
	drawPellets();
	drawGhosts();
	drawPlayer();
	
	//draw gui elements
	drawVerticalScore("GAME",HUDLeft,score);
	drawVerticalScore("HIGH",HUDRight,bestScore);
	drawLives();
	drawButtons();
	
	//dim the screen if the game is not active
	checkDimScreen();
}

/**
 * remove a life from the player, ending the game if lives have reached 0
 */
function subtractLife() {
	if (--lives == 0) {
		//game is over; no need to reset ghost or player positions
		gameActive = false;
	}
	else {
		//reset player and ghost positions
		player.returnToStart();
		for (var i = 0; i < ghosts.length; ++i) {
			ghosts[i].returnToStart();
		}
	}
}

/**
 * update the global deltaTime
 */
function updateTime() {
	var curTime = Date.now();
	//divide by 1,000 to get deltaTime in seconds
    deltaTime = (curTime - prevTime) / 1000;
    //cap deltaTime at ~15 ticks/sec as below this threshhold collisions may not be properly detected
    if (deltaTime > .067) {
    	deltaTime = .067;
    }
    prevTime = curTime;
    totalTime += deltaTime;
}

/**
 * get a random integer between min (inclusive) and max (exclusive)
 * @param min: the inclusive minimum integer value
 * @param max: the exclusive maximum integer value
 * @returns the randomly generated integer between min and max
 */
function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * populate the list of ghosts (4 ghost instances, each with a different body color)
 */
function createGhosts() {
	ghosts = [];
	ghosts.push(new Ghost(10,14,"#ffAA35",2));
	ghosts.push(new Ghost(12,14,"#3dceff",2));
	ghosts.push(new Ghost(15,14,"#fda3ff",0));
	ghosts.push(new Ghost(17,14,"#e20047",0));
}

/**
 * populate the list of pellets corresponding to the level file
 */
function createPellets() {
	pellets = [];
	for (var i = 0; i < grid.length; ++i) {
		for (var r = 0; r < grid[i].length; ++r) {
			if (scripts["levels.js"]["pellets1"][i][r] == 1) {
				pellets.push(new Pellet(gridWidth * r + gridWidth/2, gridHeight * i + gridHeight/2));
			}
		}
	}
}

/**
 * check for a collision between objects a and b
 * @param a: the first collision object
 * @param b: the second collision object
 * @returns whether there is a collision between the objects (true) or not (false)
 */
function collisionCheck(a,b) {
	return (Math.abs(a.x - b.x) * 2 < (a.width + b.width)) &&
    (Math.abs(a.y - b.y) * 2 < (a.height + b.height));
}

/**
 * check for a collision between a point and a rect
 * @param px: the x coordinate of our point
 * @param py: the y coordinate of our point
 * @param obj: the object whose rect we check for contained point
 * @returns whether the point (px,py) is contained in obj's rect (true) or not (false)
 */
function pointInRect(px,py,obj) {
	return (px > obj.x - obj.width/2 && px < obj.x + obj.width/2
	&& py > obj.y - obj.height/2 && py < obj.y + obj.height/2); 
}

/**
 * sets the fps and begins the main update loop; to be called after resource loading
 */
function startGame() {
	//keep a global fps flag for game-speed (although all speeds should use deltaTime)
	fps = 60;
	
	//init global time vars for delta time calculation
	prevTime = Date.now();
	deltaTime = 0;
	totalTime = 0;
	
	//init global game vars
	canvas = document.getElementById("canvas");
	HUDLeft = document.getElementById("HUDLeft");
	HUDRight = document.getElementById("HUDRight");
	context = canvas.getContext("2d");
	HUDLeftContext = HUDLeft.getContext("2d");
	HUDRightContext = HUDRight.getContext("2d");
	grid = scripts["levels.js"]["level1"];
	gridWidth = canvas.width / grid[0].length;
	gridHeight = canvas.height / grid.length;
	bestScore = 0;
	score = 0;
	lives = 3;
	gameActive = false;
	
	//instantiate global game objects
	player = new Player();
	createPellets();
	createGhosts();
	
	//instantiuate GUI objects
	buttons = [new Button(65,600,HUDLeft,"RESTART",24,restartGame,true)];
	
	//set the game to call the 'update' method on each tick
	_intervalId = setInterval(update, 1000 / fps);
}

setupKeyListeners();
loadAssets();