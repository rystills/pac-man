
/**
 * update the ghost's grid and previous locations to match our new final x,y pos
 */
Ghost.prototype.updatePositionalVars = function() {
	//update our position on the grid based on our exact position
	this.gridX = Math.floor(this.x / gridWidth);
	this.gridY = Math.floor(this.y / gridHeight);
	
	//update our previous position vars to our new position
	this.xPrev = this.x;
	this.yPrev = this.y;
}

/**
 * update the ghost
 */
Ghost.prototype.update = function() {
	this.move();
	this.updatePositionalVars();
} 

/**
 * move the ghost forward
 */
Ghost.prototype.move = function() {
	//move the ghost based on its current direction
	if (!(this.direction % 2)) {
		//horizontal movement
		this.x -= Math.sign(this.direction-1) * deltaTime * this.speed;
	}
	else {
		//vertical movement
		this.y += Math.sign(this.direction - 2) * deltaTime * this.speed;
	}
}

/**
 * Enemy class which roams the grid in search of pac-man
 */
function Ghost(gridX,gridY,color,direction) {
	this.gridX = gridX;
	this.gridY = gridY;
	this.x = this.gridX * gridWidth + gridWidth/2;
	this.y = this.gridY * gridHeight + gridHeight/2;
	this.xPrev = this.x;
	this.yPrev = this.y;
	this.color = color;
	this.width = 20;
	this.height = 20;
	this.speed = 85;
	this.direction = direction;
}