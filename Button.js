Button.prototype.update = function() {
	//check mouse button status
	//check if mouse is on this button 
	if (pointInRect(this.canvas.mousePos.x,this.canvas.mousePos.y,this)) {
		//if mouse button was just pressed on us, toggle pressed on
		if (mouseDownLeft) {
			this.pressed = true;
		}
		
		//if mouse button was just released on us, trigger a press 
		if (!mouseDownLeft && this.pressed) {
			//run our function, optionally passing in our argument if it has been set
			this.function(this.arg);
		}

	}
	
	this.state = "neutral";
	if (keyStates[String.fromCharCode(13)]) {
		this.keyboardPressed = true;
	}
	
	//set state based off of pressed
	if (this.keyboardPressed || (this.pressed && pointInRect(this.canvas.mousePos.x,this.canvas.mousePos.y,this))) {
		this.state = "press";
	}
	else {
		this.state = "hover";
	}
	
	if (!(keyStates[String.fromCharCode(13)])) {
		if (this.keyboardPressed) {
			//run our function, optionally passing in our argument if it has been set
			this.function(this.arg);
		}
		this.keyboardPressed = false;
	}

	//if mouse button is not held down, toggle pressed off
	if (!(mouseDownLeft || keyStates[String.fromCharCode(13)])) {
		this.pressed = false;
	}

	//color blend based off of state
	this.blendWhiteness = 180;
	if (this.state == "press") {
		this.blendWhiteness = 105;
	}
	else if (this.state == "hover") {
		this.blendWhiteness = 255;
	}
}

function Button(x,y,cnv, clickFunc,clickArg) {
	//initialize state
	this.state = "neutral";
	//whether or not the mouse button is held on us
	this.pressed = false;
	//whether or not the keyboard button is held on us
	this.keyboardPressed = false;
	//how brightly to blend our image (state dependent)
	this.blendWhiteness = 0;
	//default per-button properties
	this.text = "RESTART";
	//init position
	this.x = x;
	this.y = y;
	//store which canvas we belong to
	this.canvas = cnv;
	//what function we run when pressed
	this.function = clickFunc;
	//what argument we pass into our click function
	this.arg = clickArg;
}