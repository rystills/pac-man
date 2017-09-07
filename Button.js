Button.prototype.update = function() {
	checkButtonLength();
	//do nothing if not in the correct context
	if ((!paused) || (pauseMenu != this.menu)) {
		this.visible = false;
		this.wasVisible = false;
		return;
	}
	else {
		this.visible = true;
	}

	//check mouse button status
	//check if mouse is on this button 
	if (position_meeting(mouse_x,mouse_y,this)) {
		//update menu vars accordingly
		selectedButton = this.id;
		//if mouse button was just pressed on us, toggle pressed on
		if (mouse_check_button_pressed(mb_left)) {
			this.pressed = true;
		}
		
		//if mouse button was just released on us, trigger a press 
		if (mouse_check_button_released(mb_left) && this.pressed) {
			//buttons marked as 'silent press' do not play a sound when pressed
			if (!this.silentPress) {
				audio_play_sound(snd_menuClick,0,0);
			}
			
			//run our function, optionally passing in our argument if it has been set
			if (this.arg == noone) {
				script_execute(this.function);
			}
			else {
				script_execute(this.function,this.arg);
			}
		}
		
		//play a hover sound, unless the mouse was already on us due to a menu switch
		if (this.state == "neutral" && this.wasVisible) {
			audio_play_sound(snd_menuSelect,0,0);
		}

	}
	this.state = "neutral";
	if (selectedButton == this.id) {
		if (keyboard_check_pressed(shootKey) || keyboard_check_pressed(vk_enter)) {
			this.keyboardPressed = true;
		}
		//set state based off of pressed
		if (this.keyboardPressed || (this.pressed && position_meeting(mouse_x,mouse_y,this))) {
			this.state = "press";
		}
		else {
			this.state = "hover";
		}
	}
	if (!(keyboard_check(shootKey) || keyboard_check(vk_enter))) {
		if (this.keyboardPressed && selectedButton == this.id) {
			//buttons marked as 'silent press' do not play a sound when pressed
			if (!this.silentPress) {
				audio_play_sound(snd_menuClick,0,0);
			}
			
			//run our function, optionally passing in our argument if it has been set
			if (this.arg == noone) {
				script_execute(this.function);
			}
			else {
				script_execute(this.function,this.arg);
			}
		}
		this.keyboardPressed = false;
	}

	//if mouse button is not held down, toggle pressed off
	if (!(mouse_check_button(mb_left) || ((keyboard_check(shootKey) || keyboard_check(vk_enter))&& selectedButton == this.id))) {
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
	image_blend = make_color_rgb(this.blendWhiteness,this.blendWhiteness,this.blendWhiteness);

	this.wasVisible = true;
}

function Button() {
	//initialize state
	self.state = "neutral";
	//whether or not the mouse butto nsi held on us
	self.pressed = false;
	//whether or not the keyboard button is hed on us
	self.keyboardPressed = false;
	//how brightly to blend our image (state dependent)
	self.blendWhiteness = 0;

	//default per-button properties
	self.text = "PLAY";
	//how big our button image is
	self.length = "large";
	//what function we run when pressed
	self.function = startGame;
	//argument to be passed into run function
	self.arg = noone;
	//whether or not we are tethered to the pause menu

	//what sub-menu we are tethered to
	self.menu = "main";
	//whether or not we were just visible
	self.wasVisible = false;
	//whether or not to play a sound on press
	self.silentPress = false;
	//whether or not this button is the default selection for its menu
	self.amDefault = false;
}