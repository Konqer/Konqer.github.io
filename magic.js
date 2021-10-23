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
