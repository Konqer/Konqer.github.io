var wheelNumber = 1;

var autoRotate = false;

var animationInterval;
var cloudInterval;

function loadScene() {
	moveClouds();
	loadWheel("wheelRed1.png");
}

function loadWheel(filename) {
	var imageObj = new Image();
	imageObj.onload = function() {
		var wheelBack = document.getElementById('wheelBack');
		var wheelFront = document.getElementById('wheelFront');
		wheelBack.setAttribute('src', this.src);
		wheelFront.setAttribute('src', this.src);
	};
	imageObj.src = "pics/" + filename;
}

window.onkeydown = function(event) {
	var key = event.which || event.keyCode;
	var keyString = String.fromCharCode(key);
	switch (keyString) {
		case ('R'):
			autoRotate = false;
			stopRotateWheel();
			rotateWheel(1);
			break;
		case ('L'):
			autoRotate = false;
			stopRotateWheel();
			rotateWheel(-1);
			break;
		case ('A'):
			if (!autoRotate)  {
				autoRotate = true;
				rotateWheelAutomatic();
			}
			break;
		case ('S'):
			autoRotate = false;
			stopRotateWheel();
			break;
	}
}

function rotateWheel(tmp) {
	wheelNumber += tmp;
	if (wheelNumber > 18) wheelNumber = 1;
	if (wheelNumber < 1) wheelNumber = 18;

	var wheelBack = document.getElementById('wheelBack');
	var wheelFront = document.getElementById('wheelFront');
	wheelBack.setAttribute('src', '../pics/WheelRed' + wheelNumber + '.png');
	wheelFront.setAttribute('src', '../pics/WheelRed' + wheelNumber + '.png');
}

function rotateWheelAutomatic() {
	animationInterval = setInterval(rotateWheel, 100, 1);
}

function stopRotateWheel() {
	clearInterval(animationInterval);
}

function moveClouds() {
	var cloud = document.getElementById('clouds');
	var pos = -500;
	clearInterval(cloudInterval);
	cloudInterval = setInterval(frame, 10);
	function frame() {
		if (pos == 1500) pos = -500;
		else {
			pos++;
			cloud.style.left = pos + 'px';
		}
	}
}