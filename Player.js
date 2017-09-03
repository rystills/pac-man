/*
 * update the Player object
 */
Player.prototype.update = function() {
	//poll for input to see if the player direction should change
	for (var i = 0; i < this.moveKeys.length; ++i) {
		if (keyStates[this.moveKeys[i]]) {
			this.direction = i;
		}
	}
	
	//move the player based on their current direction
	if (!(this.direction % 2)) {
		this.x -= Math.sign(this.direction-1) * deltaTime * this.speed;
	}
	else {
		this.y += Math.sign(this.direction - 2) * deltaTime * this.speed;
	}
}

/**
 * Player class containing pac-man's location and orientation
 */
function Player() {
	this.x = 300;
	this.y = 400;
	this.speed = 10;
	
	//directions go counterclockwise from 0 (right) to 3 (down)
	this.direction = 0;
	this.moveKeys = ["D","W","A","S"]
}