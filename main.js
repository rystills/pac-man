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
}

/**
 * clear the entire screen to black, preparing it for a fresh render
 */
function clearScreen() {
	context.fillStyle="#000000";
	context.fillRect(0,0,canvas.width,canvas.height);
	HUDContext.fillStyle="#000000";
	HUDContext.fillRect(0,0,HUD.width,HUD.height);
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
 * main game loop; update all aspects of the game in-order
 */
function update() {
	//update the deltaTime
	updateTime();
	
	//update all game objects
	player.update();
	for (var i = 0; i < ghosts.length; ++i) {
		ghosts[i].update();
	}
	
	//clear and re-render the screen
	clearScreen();
	
	//draw each grid piece from the level file
	context.fillStyle="#FFFFFF";
	for (var i = 0; i < grid.length; ++i) {
		for (var r = 0; r < grid[i].length; ++r) {
			//draw walls
			if (grid[i][r] == 0) {
				context.fillRect(r*gridWidth,i*gridHeight,gridWidth,gridHeight);
			}
		}
	}
		
	//draw the pellets
	context.fillStyle="#00FF00";
	for (var i = 0; i < pellets.length; ++i) {
		context.fillRect(pellets[i].x - pellets[i].width/2, pellets[i].y - pellets[i].height/2,pellets[i].width,pellets[i].height);
	}
	
	//draw the ghosts
	for (var i = 0; i < ghosts.length; ++i) {
		g = ghosts[i];
		context.fillStyle = g.color;
		//head (180 degree rotated semicircle)
		context.beginPath();
		context.arc(g.x, g.y, g.width/2, 1 * Math.PI, 2 * Math.PI, false);
		context.fill();
		//body (square minus a small amount from the height to leave room for bottom triangles)
		context.fillRect(g.x - g.width/2, g.y, g.width, g.height/2 - 4);
		//bottom (three triangles running across the width)
		var cornerX = g.x - g.width/2;
		var cornerY = g.y + g.height/2 - 4;
		for (var r = 0; r < 3; ++r) {
			leftX = cornerX + g.width/3 * r;
			rightX = cornerX + g.width/3 * (r+1);
			topY = cornerY;
			botY = cornerY + 4;
			drawTriangle(leftX,topY,rightX,topY,leftX + (rightX-leftX)/2,botY);
		}
		
	}

	//draw the player
	context.fillStyle = "#000000";
	var radius = player.width/2;
	var rot = Math.PI/2 * player.direction;
	//first half of body
	context.beginPath();
	context.arc(player.x, player.y, radius, -rot + 0.25 * Math.PI, -rot + 1.25 * Math.PI, false);
	context.fillStyle = "rgb(255, 255, 0)";
	context.fill();
	//second half of body
	context.beginPath();
	context.arc(player.x, player.y, radius, -rot + 0.75 * Math.PI, -rot + 1.75 * Math.PI, false);
	context.fill();
	//eye
	context.beginPath();
	context.arc(player.x - (player.direction % 2 ? radius*.5 : 0), 
			player.y - (player.direction % 2 ? 0 : radius*.5), radius*.1, 0, 2 * Math.PI, false);
	context.fillStyle = "rgb(0, 0, 0)";
	context.fill();
	
	//draw the HUD
	HUDContext.font = "30px Arial";
	HUDContext.fillStyle = "#FFFFFF";
	
	//left-pad the score with 0's 
	scoreString = score.toString();
	var scoreLen = scoreString.length;
	while (++scoreLen < 6) {
		scoreString = "0" + scoreString;
	}
	HUDContext.fillText("Score: "  + scoreString,10,35);
}

/**
 * update the global deltaTime
 */
function updateTime() {
	var curTime = Date.now();
	//divide by 1,000 to get deltaTime in milliseconds
    deltaTime = (curTime - prevTime) / 1000;
    prevTime = curTime;
}

/**
 * populate the list of ghosts (4 ghost instances, each of a different ai type)
 */
function createGhosts() {
	ghosts = [];
	ghosts.push(new Ghost(10,14,"#ffee35",2));
	ghosts.push(new Ghost(12,14,"#3dceff",2));
	ghosts.push(new Ghost(15,14,"#c9adff",0));
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
 * sets the fps and begins the main update loop; to be called after resource loading
 */
function startGame() {
	//keep a global fps flag for game-speed (although all speeds should use deltaTime)
	fps = 60;
	
	//init global time vars for delta time calculation
	prevTime = Date.now();
	deltaTime = 0;
	
	//init global game vars
	canvas = document.getElementById("canvas");
	HUD = document.getElementById("HUD");
	context = canvas.getContext("2d");
	HUDContext = HUD.getContext("2d");
	grid = scripts["levels.js"]["level1"];
	gridWidth = canvas.width / grid[0].length;
	gridHeight = canvas.height / grid.length;
	score = 0;
	
	//instantiate global game objects
	player = new Player();
	createPellets();
	createGhosts();
	
	//set the game to call the 'update' method on each tick
	_intervalId = setInterval(update, 1000 / fps); //set refresh rate to desired fps
}

/**
 * loads all the needed files, then calls startGame to begin the game
 */
function loadAssets() {	
	//global list of script assets and current script number
	scriptFiles = ["levels.js","Player.js","Ghost.js","Pellet.js"];
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

setupKeyListeners();
loadAssets();