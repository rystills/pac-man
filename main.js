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
	clearScreen();
}

/**
 * update the global deltaTime
 */
function updateTime() {
	var curTime = Date.now();
    deltaTime = curTime - prevTime;
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
	
	//set the game to call the 'update' method on each tick
	_intervalId = setInterval(update, 1000 / fps); //set refresh rate to desired fps
}

/**
 * loads all the needed files, then calls startGame to begin the game
 */
function loadAssets() {
	//get a reference to the document body, so we can append scripts to it
	var docBody = document.getElementsByTagName('body')[0];
	
	//global list of script assets to load
	var scripts = ["grid.txt"];
	loadAsset(scripts,0);
}

/**
 * load a single asset, setting onload to move on to the next asset
 * @param scripts: the list of script assets to load from
 * @param curNum: the index of the script to laod
 */
function loadAsset(scripts,curNum) {
	if (curNum >= scripts.length) {
		return startGame();
	}
	var elem = document.createElement('script');
	elem.type = 'text/javascript';
	elem.src = scripts[curNum]
	elem.onload = loadAsset(scripts,curNum+1);
}

loadAssets();