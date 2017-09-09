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
	this.dirPrev = this.direction;
}

/**
 * move any remaining distance that may have been lost due to turning
 */
Ghost.prototype.moveRemainingDistance = function() {
	//distance will always be correct if we haven't changed our direction
	if (this.dirPrev != this.direction) {
		//calculate the distance moved this step
		var distX = this.x-this.xPrev;
		var distY = this.y-this.yPrev;
		var distMoved = Math.sqrt(distX*distX + distY*distY);
		//calculate the distance we should have moved
		var properDist = deltaTime * this.speed;
		if (properDist > distMoved) {
			//if there is a discrepancy in the distances, move the remaining amount in our new direction
			this.move(properDist-distMoved);
		}
	}
}

/**
 * move the ghost forward
 */
Ghost.prototype.move = function(distance,direction) {
	if (distance == null) {
		distance = this.speed * deltaTime ;
	}
	if (direction == null) {
		direction = this.direction;
	}
	//move the player based on their current direction
	if (!(direction % 2)) {
		//horizontal movement
		this.x -= Math.sign(direction-1) * distance;
	}
	else {
		//vertical movement
		this.y += Math.sign(direction - 2) * distance;
	}
}

/**
 * resolve collisions with other ghosts by moving out and changing direction
 */
Ghost.prototype.handleGhostCollisions = function() {
	for (var i = 0; i < ghosts.length; ++i) {
		var other = ghosts[i];
		//skip over ourselves when checking ghosts
		if (other == this) {
			continue;
		}
		if (collisionCheck(this,other)) {
			//flip our direction and move back out of the collision 1 unit at a time
			this.direction += (this.direction > 1 ? -2 : 2);
			while (collisionCheck(this,other)) {
				this.move(1,this.direction);
			}
			//if the other ghost's direction is the same as our flipped dir, flip theirs too
			if (other.direction == this.direction) {
				other.direction += (other.direction > 1 ? -2 : 2);
			}
		}
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
	this.handleGhostCollisions();
	
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
	
	this.moveRemainingDistance();
	
	this.updatePositionalVars();
} 

/**
 * return the ghost back to its initial position and direction
 */
Ghost.prototype.returnToStart = function() {
	this.x = this.startX;
	this.y = this.startY;
	this.direction = this.startDirection;
	this.changingDirection = false;
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
	this.width = 18;
	this.height = 18;
	this.speed = 85;
	this.direction = direction;
	this.changingDirection = false;
	this.dirPrev = this.direction;
	this.changeGridX = 0;
	this.changeGridY = 0;
	
	//keep track of initial position and direction for restarting
	this.startX = this.x;
	this.startY = this.y;
	this.startDirection = this.direction;
}