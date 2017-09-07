/**
 * if we are overlapping a wall, move back out of if
 */
Player.prototype.stayWithinWalls = function() {
	//update the grid value and grid x and y immediately for use in calculations
	this.gridX = Math.floor(this.x / gridWidth);
	this.gridY = Math.floor(this.y / gridHeight);
	gridVal = grid[this.gridY][this.gridX];
	
	if (!(this.direction%2)) {
		//going horizontally
		if ((this.direction == 0 && (this.x - this.gridX*gridWidth >= gridWidth/2)) ||
		(this.direction == 2 && (this.x - this.gridX*gridWidth <= gridWidth/2))) {
			this.checkMoveOutsideWall();
		}
	}
	else {
		//going vertically
		if ((this.direction == 3 && (this.y - this.gridY*gridHeight >= gridHeight/2)) ||
		(this.direction == 1 && (this.y - this.gridY*gridHeight <= gridHeight/2))) {
			this.checkMoveOutsideWall();
		}
	}
}

/**
 * sub-method of stayWithinWalls; check for a wall collision
 */
Player.prototype.checkMoveOutsideWall = function() {
	gridY2 = this.gridY;
	gridX2 = this.gridX;
	if (!(this.direction % 2)) {
		gridX2 -= Math.sign(this.direction-1);
	}
	else {
		gridY2 += Math.sign(this.direction-2);
	}
	if (grid[gridY2][gridX2] == 0) {
		//we are moving into a wall, so back out to the center of this grid space
		this.x = this.gridX*gridWidth + gridWidth/2;
		this.y = this.gridY*gridHeight + gridHeight/2;
	}
}

/**
 * check if the wantDirection will lead up to an open space, or to a wall
 */
Player.prototype.checkDirectionIsLegal = function() {
	gridY2 = this.gridY;
	gridX2 = this.gridX;
	if (!(this.wantDirection % 2)) {
		gridX2 -= Math.sign(this.wantDirection-1);
	}
	else {
		gridY2 += Math.sign(this.wantDirection-2);
	}
	if (grid[gridY2][gridX2] != 0) {
		this.direction = this.wantDirection;
		return true;
	}
	return false;
}

/**
 * attempt to switch to the wantDirection
 */
Player.prototype.tryTakeWantDirection = function() {
	//check if we can resolve a discrepancy between the desired direction and the actual direction
	if (this.wantDirection != this.direction) {
		//update the grid value and grid x and y immediately for use in calculations
		this.gridX = Math.floor(this.x / gridWidth);
		this.gridY = Math.floor(this.y / gridHeight);
		gridVal = grid[this.gridY][this.gridX];
		
		//before setting the direction, check if our new grid space still allows that movement
		if (gridVal == 3 || gridVal == (this.wantDirection % 2 ? 2 : 1)) {
			//if we crossed over the center of a gridspace, we can initiate a direction change
			if (!(this.direction%2)) {
				//want to go from horizontal to vertical
				if ((this.x == this.xPrev) || (((this.x - this.gridX*gridWidth >= gridWidth/2) && (this.xPrev - this.gridX*gridWidth <= gridWidth/2)) ||
						((this.x - this.gridX*gridWidth <= gridWidth/2) && (this.xPrev - this.gridX*gridWidth >= gridWidth/2)))) {
					//move to the center of the gridSpace, and change direction
					if (this.checkDirectionIsLegal()) {
						this.x -= (this.x - this.gridX*gridWidth - gridWidth/2);
					}
				}
			}
			else {
				//want to go from vertical to horizontal
				if ((this.y == this.yPrev) || (((this.y - this.gridY*gridHeight >= gridHeight/2) && (this.yPrev - this.gridY*gridHeight <= gridHeight/2)) ||
						((this.y - this.gridY*gridHeight <= gridHeight/2) && (this.yPrev - this.gridY*gridHeight >= gridHeight/2)))) {
					//move to the center of the gridSpace, and change direction
					if (this.checkDirectionIsLegal()) {
						this.y -= (this.y - this.gridY*gridHeight - gridHeight/2);
					}
				}
			}
		}
	}
}

/**
 * grab directional input from the keyboard and try to update direction accordingly 
 */
Player.prototype.checkDirectionalInput = function() {
	//poll for input to see if the player direction should change
	gridVal = grid[this.gridY][this.gridX];
	for (var i = 0; i < this.moveKeys.length; ++i) {
		if (keyStates[this.moveKeys[i]]) {
			//before setting the direction, check if our current grid space allows that movement
			if (gridVal == 3 || gridVal == (i % 2 ? 2 : 1)) {
				//movement is allowed, now check if we are trying to change between x and y movement
				this.wantDirection = i;
				if (i%2 == this.direction%2) {
					//we are not changing between x and y movement
					this.direction = this.wantDirection;
				}
			}
		}
	}
}

/**
 * move any remaining distance that may have been lost due to turning
 */
Player.prototype.moveRemainingDistance = function() {
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
 * move the player forward
 */
Player.prototype.move = function(distance) {
	if (distance == null) {
		distance = this.speed * deltaTime ;
	}
	//move the player based on their current direction
	if (!(this.direction % 2)) {
		//horizontal movement
		this.x -= Math.sign(this.direction-1) * distance;
	}
	else {
		//vertical movement
		this.y += Math.sign(this.direction - 2) * distance;
	}
}

/**
 * update the player's grid and previous locations to match our new final x,y pos
 */
Player.prototype.updatePositionalVars = function() {
	//update our position on the grid based on our exact position
	this.gridX = Math.floor(this.x / gridWidth);
	this.gridY = Math.floor(this.y / gridHeight);
	
	//update our previous position vars to our new position
	this.xPrev = this.x;
	this.yPrev = this.y;
	this.dirPrev = this.direction;
}

/**
 * check if we are colliding with a pellet and should eat it
 */
Player.prototype.checkEatPellet = function() {
	for (var i = 0; i < pellets.length; ++i) {
		if (collisionCheck(this,pellets[i])) {
			//pellet collision detected; reomove the pellet and increment score by 1
			pellets.splice(i,1);
			--i;
			score+=1;
		}
	}
	//check for a live update of the highscore
	if (score > bestScore) {
		bestScore = score;
	}
}

/**
 * if the player is colliding with a ghost, subtract a life and reset
 */
Player.prototype.checkHitGhost = function() {
	for (var i = 0; i < ghosts.length; ++i) {
		if (collisionCheck(this,ghosts[i])) {
			subtractLife();
		}
	}
}

/**
 * update the Player object
 */
Player.prototype.update = function() {
	this.checkDirectionalInput();
	
	this.move();
	
	this.stayWithinWalls();
	
	this.tryTakeWantDirection();
	
	this.checkEatPellet();
	
	this.moveRemainingDistance();
	
	this.updatePositionalVars();
	
	this.checkHitGhost();
}

/**
 * return the player back to their initial position and direction
 */
Player.prototype.returnToStart = function() {
	this.x = this.startX;
	this.y = this.startY;
	this.direction = this.startDirection;
	this.wantDirection = this.direction;
}

/**
 * Player class containing pac-man's location and orientation
 */
function Player() {
	this.gridX = 14;
	this.gridY = 26;
	this.speed = 100;
	this.width = 18;
	this.height = 18;
	this.x = this.gridX * gridWidth + this.width/2;
	this.y = this.gridY * gridHeight + this.height/2+1;
	this.xPrev = this.x;
	this.yPrev = this.y;
	
	//directions go counterclockwise from 0 (right) to 3 (down)
	this.direction = 2;
	this.wantDirection = 2;
	this.moveKeys = ["D","W","A","S"];
	this.dirPrev = this.direction;
	
	//keep track of initial position and direction for restarting
	this.startX = this.x;
	this.startY = this.y;
	this.startDirection = this.direction;
}