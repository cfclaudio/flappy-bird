
var bird;
var pipes = [];
var score;
var background;
var goSound;


function startGame() {
	// set up game area and components
	myGameArea.start();
	bird = new component(10, 120, "images/star1.jpg", 30, 30, "image");
	score = new component(280, 40, "white", "30px", "Georgia", "text");
	background = new component(0, 0, "images/background1.jpg", 723, 280, "background");
	goSound = new sound("sounds/gameover.mp3");
}


// function that occurs every interval
function updateGameArea() {
	var x, height, gap, minHeight, maxHeight, minGap, maxGap;
	
	// Collision check with every pipe
	for (i=0; i<pipes.length; i+=1) {
		if(bird.crashWith(pipes[i])) {
			goSound.play();
			myGameArea.stop();

			var gameover = new component(myGameArea.canvas.width/2 - 80, myGameArea.canvas.height/2, "white", "30px", "Georgia", "text");
			gameover.text = "GAME OVER!";
			gameover.update();

			alert("GAME OVER!");
			return;
		}
	}

	myGameArea.clear();
	myGameArea.frameNo += 1;
	background.speedX = -1;
	background.newPos();
	background.update();
	

	// If it is the first frame, or 150th frame... create a new obstacle
	if(myGameArea.frameNo == 1 || everyInterval(150)) {
		
		// x coordinate of pipe will be right edge of canvas
		x = myGameArea.canvas.width; 
		
		// randomize the pipe height
		minHeight = 20;
		maxHeight = 200;
		height = Math.floor(Math.random()*(maxHeight-minHeight+1) + minHeight);

		// Randomize the gap
		minGap = 50;
		maxGap = 200;
		gap = Math.floor(Math.random()*(maxGap-minGap+1) + minGap);

		// Add new pipe to array
		pipes.push(new component(x, 0, "#404040", 10, height));				// Top pipe
		pipes.push(new component(x, height+gap, "#404040", 10, myGameArea.canvas.height-(height+gap)));	// Bottom pipe
	}

	// draw the pipes on canvas
	for(i=0; i<pipes.length; i++) {
		pipes[i].x += -1;
		pipes[i].update();
	}


	// birdy is moving
	bird.speedX = 0;
	bird.speedY = 0;
	if (myGameArea.keys && myGameArea.keys[37]) { bird.speedX += -1; } 		// move left
	if (myGameArea.keys && myGameArea.keys[39]) { bird.speedX += 1; }		// move right
	if (myGameArea.keys && myGameArea.keys[38]) { bird.speedY += -1; }		// move up
	if (myGameArea.keys && myGameArea.keys[40]) { bird.speedY += 1;}		// move down
	bird.newPos();
	bird.update();


	// Update score, draw last so its on top
	score.text = "SCORE: " + myGameArea.frameNo;
	score.update();
}



// myGameArea object with a canvas, start, and clear function
var myGameArea = {
	canvas: document.createElement("canvas"),
	
	start: function() {
		// Set up the canvas
		this.canvas.width = 480;
		this.canvas.height = 270;
		this.context = this.canvas.getContext("2d");
		
		// Add it to the html code
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		
		// property for counting frames
		this.frameNo = 0;

		// Add an interval to update the canvas
		this.interval = setInterval(updateGameArea, 20);
	
		// Keyboard listener
		window.addEventListener('keydown', function (e) {
			myGameArea.keys = (myGameArea.keys || []);
			myGameArea.keys[e.keyCode] = true;
		  })
		  window.addEventListener('keyup', function (e) {
			myGameArea.keys[e.keyCode] = false;
		  })
	},

	clear: function() {
		// Clear the canvas
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},

	stop: function() {
		clearInterval(this.interval);
	}
}



// game components
function component(x, y, color, width, height, type) {
	// Create the game component
	this.type = type;
	if(this.type == "image" || this.type == "background") {
		this.image = new Image();
		this.image.src = color;
	}
	this.color = color;
	this.width = width;
	this.height = height;
	this.speedX = 0;
	this.speedY = 0;
	this.x = x;
	this.y = y;

	// Update function for component
	this.update = function() {
		ctx = myGameArea.context;
		if(this.type == "text") {
			ctx.font = this.width + " " + this.height;
			ctx.fillStyle = this.color;
			ctx.fillText(this.text, this.x, this.y);
		}
		else if(this.type == "image" || this.type == "background") {
			ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
			
			// to loop background, draw second image
			if(this.type == "background") {
				ctx.drawImage(this.image, this.x+this.width, this.y, this.width, this.height);
			}
		}
		else {
			// ctx.fillStyle = "#FF3399";
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		}
	}

	// Update component location
	this.newPos = function() {
		this.x += this.speedX;
		this.y += this.speedY;

		if(this.type == "background") {
			if(this.x == -(this.width)) {
				this.x = 0;
			}
		}
		else {	// the bird, dont move out of bounds
			if(this.x < 0) 
				{ this.x=0; }
			else if(this.x + this.width > myGameArea.canvas.width)  
				{ this.x=myGameArea.canvas.width-this.width; }
			if(this.y < 0) 
				{ this.y=0; } 
			else if(this.y + this.height > myGameArea.canvas.height) 
				{ this.y=myGameArea.canvas.height-this.height; }
		}
	}

	// Collision check
	this.crashWith = function(otherObj) {
		myTop = this.y;
		myBottom = this.y + this.height;
		myLeft = this.x;
		myRight = this.x + this.width;

		otherTop = otherObj.y;
		otherBottom = otherObj.y + otherObj.height;
		otherLeft = otherObj.x;
		otherRight = otherObj.x + otherObj.width;

		var collision = false;

		// Collision detection algorithm
		if ((myBottom > otherTop) && (myTop < otherBottom) &&
			(myRight > otherLeft) && (myLeft < otherRight)) {
				collision = true;
		}
		return collision;
	}
}




// a method for executing something at a given frame rate
function everyInterval(n) {
	// returns true if the current framenumber corresponds with 
	// the given interval.	
	// change to % n?
	if((myGameArea.frameNo / n) % 1 == 0) { 
		return true; 
	}
	return false;
}


function sound(src) {
	this.sound = document.createElement("audio");
	this.sound.src = src;
	this.sound.setAttribute("preload", "auto");
	this.sound.setAttribute("controls", "none");
	this.sound.style.display = "none";
	document.body.appendChild(this.sound);
	this.play = function(){
	  this.sound.play();
	}
	this.stop = function(){
	  this.sound.pause();
	}
  }
