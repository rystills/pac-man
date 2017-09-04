
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
 * check if the wantDirection will lead up to an open space, or to a wall
 */
Ghost.prototype.checkDirectionIsLegal = function(wantDirection) {
	gridY2 = this.gridY;
	gridX2 = this.gridX;
	if (!(wantDirection % 2)) {
		gridX2 -= Math.sign(wantDirection-1);
	}
	else {
		gridY2 += Math.sign(wantDirection-2);
	}
	if (grid[gridY2][gridX2] != 0) {
		return true;
	}
	return false;
}

/**
 * choose a new direction and ensure that it is valid
 */
Ghost.prototype.chooseNewDirection = function() {
	//first calculate a list of directions we can move in 
	var legalDirections = [];
	for (var i = 0; i < 4; ++i) {
		if (this.checkDirectionIsLegal(i)) {
			legalDirections.push(i);
		}
	}
	
	//now choose a direction from the list, either algorithmically or randomly
	this.direction = legalDirections[getRandomInt(0,legalDirections.length)]
	this.changingDirection = false;
}

/**
 * check if we have passed the center of the current grid square, and try to change direction
 */
Ghost.prototype.checkChangeDirection = function() {
	//update the grid x and y immediately for use in calculations
	this.gridX = Math.floor(this.x / gridWidth);
	this.gridY = Math.floor(this.y / gridHeight);
	
	//if we crossed over the center of a gridspace, we can initiate a direction change
	if (!(this.direction%2)) {
		//want to go from horizontal to vertical
		if ((this.x == this.xPrev) || (((this.x - this.gridX*gridWidth >= gridWidth/2) && (this.xPrev - this.gridX*gridWidth < gridWidth/2)) ||
				((this.x - this.gridX*gridWidth <= gridWidth/2) && (this.xPrev - this.gridX*gridWidth > gridWidth/2)))) {
			//move to the center of the gridSpace, and change direction
			this.x -= (this.x - this.gridX*gridWidth - gridWidth/2);
			this.chooseNewDirection();
		}
	}
	else {
		//want to go from vertical to horizontal
		if ((this.y == this.yPrev) || (((this.y - this.gridY*gridHeight >= gridHeight/2) && (this.yPrev - this.gridY*gridHeight < gridHeight/2)) ||
				((this.y - this.gridY*gridHeight <= gridHeight/2) && (this.yPrev - this.gridY*gridHeight > gridHeight/2)))) {
			//move to the center of the gridSpace, and change direction
			this.y -= (this.y - this.gridY*gridHeight - gridHeight/2);
			this.chooseNewDirection();
		}
	}
}

/**
 * update the ghost
 */
Ghost.prototype.update = function() {
	this.move();	
	//check if we are at an intersection, and if so, attempt to choose a new direction
	if (grid[this.gridY][this.gridX] == 3) {
		//update the grid x and y immediately for use in calculations
		this.gridX = Math.floor(this.x / gridWidth);
		this.gridY = Math.floor(this.y / gridHeight);
		
		//don't allow changing direction if we just changed direction on this intersection
		if (!(this.changeGridX == this.gridX && this.changeGridY == this.gridY)) {
			this.changingDirection = true;
			this.changeGridX = this.gridX;
			this.changeGridY = this.gridY;
		}
	}
	else {
		this.changingDirection = false;
	}
	if (this.changingDirection) {
		this.checkChangeDirection();
	}
	
	this.updatePositionalVars();
} 

/**
 * return the ghost back to its initial position and direction
 */
Ghost.prototype.returnToStart = function() {
	this.x = this.startX;
	this.y = this.startY;
	this.direction = this.startDirection;
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
	this.changingDirection = false;
	this.changeGridX = 0;
	this.changeGridY = 0;
	
	//keep track of initial position and direction for restarting
	this.startX = this.x;
	this.startY = this.y;
	this.startDirection = this.direction;
}