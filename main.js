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
	var c=document.getElementById("canvas");
	var ctx=c.getContext("2d");
	ctx.fillStyle="#000000";
	ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
}

/**
 * main game loop; update all aspects of the game in order
 */
function update() {
	updateTime();
	player.update();
	console.log(player.direction);
	clearScreen();
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
 * sets the fps and begins the main update loop; the be called after resource loading
 */
function startGame() {
	//keep a global fps flag for game-speed (although all speeds should use deltaTime)
	fps = 60;
	
	//init global time vars for delta time calculation
	prevTime = Date.now();
	deltaTime = 0;
	
	//instantiate global game objects
	player = new Player();
	
	//set the game to call the 'update' method on each tick
	_intervalId = setInterval(update, 1000 / fps); //set refresh rate to desired fps
}

/**
 * loads all the needed files, then calls startGame to begin the game
 */
function loadAssets() {	
	//global list of script assets and current script number
	scriptFiles = ["levels.js","Player.js"];
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