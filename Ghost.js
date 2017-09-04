/**
 * Enemy class which roams the grid in search of pac-man
 */
function Ghost(xStart,yStart,color) {
	this.x = xStart;
	this.y = yStart;
	this.color = color;
	this.width = 20;
	this.height = 20;
}