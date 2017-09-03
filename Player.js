/*
 * update the Player object
 */
Player.prototype.update = function() {
	//poll for input to see if the player direction should change
	gridVal = grid[this.gridY][this.gridX];
	for (var i = 0; i < this.moveKeys.length; ++i) {
		if (keyStates[this.moveKeys[i]]) {
			//before setting the direction, check if our current grid space allows that movement
			if (gridVal == 3 || gridVal == (i % 2 ? 2 : 1)) {
				//movement is allowed, now check if we are trying to change between x and y movement
				if (i%2 == this.direction%2) {
					//we are not changing between x and y movement
					this.direction = i;
					this.wantDirection = i;
				}
				else {
					//we are changing between x and y movement, so set the desired flag
					this.wantDirection = i;
				}
			}
		}
	}
	
	//move the player based on their current direction
	if (!(this.direction % 2)) {
		//horizontal movement
		this.x -= Math.sign(this.direction-1) * deltaTime * this.speed;
	}
	else {
		//vertical movement
		this.y += Math.sign(this.direction - 2) * deltaTime * this.speed;
	}
	
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
				if (((this.x - this.gridX*gridWidth >= gridWidth/2) && (this.xPrev - this.gridX*gridWidth <= gridWidth/2)) ||
				((this.x - this.gridX*gridWidth <= gridWidth/2) && (this.xPrev - this.gridX*gridWidth >= gridWidth/2))) {
					//move to the center of the gridSpace, and change direction
					this.x -= (this.x - this.gridX*gridWidth - gridWidth/2);
					this.direction = this.wantDirection;
				}
			}
			else {
				//want to go from vertical to horizontal
				if (((this.y - this.gridY*gridHeight >= gridHeight/2) && (this.yPrev - this.gridY*gridHeight <= gridHeight/2)) ||
				((this.y - this.gridY*gridHeight <= gridHeight/2) && (this.yPrev - this.gridY*gridHeight >= gridHeight/2))) {
					//move to the center of the gridSpace, and change direction
					this.y -= (this.y - this.gridY*gridHeight - gridHeight/2);
					this.direction = this.wantDirection;
				}
			}
		}
	}
	
	//update our position on the grid based on our exact position
	this.gridX = Math.floor(this.x / gridWidth);
	this.gridY = Math.floor(this.y / gridHeight);
	
	//update our previous position vars to our new position
	this.xPrev = this.x;
	this.yPrev = this.y;
}

/**
 * Player class containing pac-man's location and orientation
 */
function Player() {
	this.gridX = 14;
	this.gridY = 26;
	this.speed = 100;
	this.width = 20;
	this.height = 20;
	this.x = this.gridX * gridWidth + this.width/2;
	this.y = this.gridY * gridHeight + this.height/2;
	this.xPrev = this.x;
	this.yPrev = this.y;
	
	//directions go counterclockwise from 0 (right) to 3 (down)
	this.direction = 2;
	this.wantDirection = 2;
	this.moveKeys = ["D","W","A","S"]
}