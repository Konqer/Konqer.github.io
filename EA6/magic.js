var app = ( function() {

	var gl;

	var prog;

	var models = [];

	var sphereAngle = 0;

	var interactiveModel;

	var torus;
	var sphere1;
	var sphere2;
	var sphere3;
	var sphere4;
	var sphere5;
	var sphere6;

	var toggleWireframeOn = true;

	var deltaRotate = Math.PI / 36;
	var deltaTranslate = 0.05;

	var camera = {
		// Initial position of the camera.
		eye : [0, 1, 4],
		// Point to look at.
		center : [0, 0, 0],
		// Roll and pitch of the camera.
		up : [0, 1, 0],
		// Opening angle given in radian.
		// radian = degree*2*PI/360.
		fovy : 60.0 * Math.PI / 180,
		// Camera near plane dimensions:
		// value for left right top bottom in projection.
		lrtb : 2.0,
		// View matrix.
		vMatrix : mat4.create(),
		// Projection matrix.
		pMatrix : mat4.create(),
        // Projection types: ortho, perspective, frustum.
        projectionType : "perspective",
		// Angle to Z-Axis for camera when orbiting the center
		// given in radian.
		zAngle : 0,
		// Distance in XZ-Plane from center when orbiting.
		distance : 4,
	};

	function start() {
		init();
		render();
	}

	function init() {
		initWebGL();
		initShaderProgram();
		initUniforms()
		initModels();
		initEventHandler();
		initPipline();
	}

	function initWebGL() {
		canvas = document.getElementById('canvas');
		gl = canvas.getContext('experimental-webgl');
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	}

	/**
	 * Init pipeline parameters that will not change again.
	 * If projection or viewport change, their setup must
	 * be in render function.
	 */
	function initPipline() {
		gl.clearColor(.80, .80, .90, 1);

		gl.frontFace(gl.CCW);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);

		gl.enable(gl.DEPTH_TEST);

		gl.enable(gl.POLYGON_OFFSET_FILL);
		gl.polygonOffset(0.5, 0);

		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

		camera.aspect = gl.viewportWidth / gl.viewportHeight;
	}

	function initShaderProgram() {
		var vs = initShader(gl.VERTEX_SHADER, "vertexshader");
		var fs = initShader(gl.FRAGMENT_SHADER, "fragmentshader");
		prog = gl.createProgram();
		gl.attachShader(prog, vs);
		gl.attachShader(prog, fs);
		gl.bindAttribLocation(prog, 0, "aPosition");
		gl.linkProgram(prog);
		gl.useProgram(prog);
	}

	/**
	 * Create and init shader from source.
	 * 
	 * @parameter shaderType: openGL shader type.
	 * @parameter SourceTagId: Id of HTML Tag with shader source.
	 * @returns shader object.
	 */
	function initShader(shaderType, SourceTagId) {
		var shader = gl.createShader(shaderType);
		var shaderSource = document.getElementById(SourceTagId).text;
		gl.shaderSource(shader, shaderSource);
		gl.compileShader(shader);
		if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.log(SourceTagId + ": " + gl.getShaderInfoLog(shader));
			return null;
		}
		return shader;
	}

	function initUniforms() {
		prog.pMatrixUniform = gl.getUniformLocation(prog, "uPMatrix");
		prog.mvMatrixUniform = gl.getUniformLocation(prog, "uMVMatrix");
		prog.colorUniform = gl.getUniformLocation(prog, "uColor");
		prog.nMatrixUniform = gl.getUniformLocation(prog, "uNMatrix");
	}

	function initModels() {
		var fs = "wireframefill";
        createModel("torus", fs, [ .25, .25, .25, 1], [ 0, 0, 0 ], [ 0, 0, 0 ], [1, 1, 1 ]);
		createModel("sphere", fs, [ .95, 0.1, 0.1, 1 ], [2, 0, 0],[ Math.PI *.5, 0, 0 ], [ .1, .1, .1 ]);
		createModel("sphere", fs, [ 0.1, .95, .1, 1 ], [2, 0, 0],[ Math.PI *.5, 0, 0 ], [ .1, .1, .1 ]);
		createModel("sphere", fs, [ .1, .1, .95, 1 ], [2, 0, 0],[ Math.PI *.5, 0, 0 ], [ .1, .1, .1 ]);
		createModel("sphere", fs, [ .95, .95, .1, 1 ], [-2, 0, 0],[ Math.PI *.5, 0, 0 ], [ .1, .1, .1 ]);
		createModel("sphere", fs, [ .1, .95, .95, 1 ], [-2, 0, 0],[ Math.PI *.5, 0, 0 ], [ .1, .1, .1 ]);
		createModel("sphere", fs, [ .95, 0.1, .95, 1 ], [ 0, 2, 0 ],[ Math.PI *.5, 0, 0 ], [ .1, .1, .1 ]);
		[
			torus,
			sphere1,
			sphere2,
			sphere3,
			sphere4,
			sphere5,
			sphere6
		  ] = models;

		sphereAngle = (sphereAngle + deltaRotate) % (2 * Math.PI);
		torus.rotate[1] += deltaRotate;

		const cosOffset = 1 + (Math.cos(sphereAngle));
		const sinOffset = Math.sin(sphereAngle);

		sphere1.translate[0] = cosOffset -2 ;
		sphere1.translate[2] = sinOffset ;

		sphere2.translate[0] = 1.3*(cosOffset  -1);
		sphere2.translate[2] = -1.3*(sinOffset -1);

		sphere3.translate[0] = (cosOffset -1)*2;
		sphere3.translate[2] = (-sinOffset -1)*2;

		sphere4.translate[0] = (-cosOffset)*1.5; 
		sphere4.translate[2] = sinOffset*1.5;	

		sphere5.translate[0] = (cosOffset)*1.5; 
		sphere5.translate[2] = (sinOffset+.25)*1.5;

		sphere6.translate[1] = cosOffset -1;
		sphere6.translate[2] = sinOffset;
	}

	/**
	 * Create model object, fill it and push it in models array.
	 * 
	 * @parameter geometryname: string with name of geometry.
	 * @parameter fillstyle: wireframe, fill, fillwireframe.
	 */
	 function createModel(geometryname, fillstyle, color, translate, rotate, scale) {
		var model = {};
		model.fillstyle = fillstyle;
		model.color = color;
		initDataAndBuffers(model, geometryname);
	    initTransformations(model, translate, rotate, scale);

		models.push(model);
	}


	function initTransformations(model, translate, rotate, scale) {
		model.translate = translate;
		model.rotate = rotate;
		model.scale = scale;
	
		model.mMatrix = mat4.create();
		model.mvMatrix = mat4.create();
		model.nMatrix = mat3.create();
	}


	/**
	 * Init data and buffers for model object.
	 * 
	 * @parameter model: a model object to augment with data.
	 * @parameter geometryname: string with name of geometry.
	 */
	function initDataAndBuffers(model, geometryname) {
		// Provide model object with vertex data arrays.
		// Fill data arrays for Vertex-Positions, Normals, Index data:
		// vertices, normals, indicesLines, indicesTris;
		// Pointer this refers to the window.
		this[geometryname]['createVertexData'].apply(model);


		model.vboPos = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
		gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW);
		prog.positionAttrib = gl.getAttribLocation(prog, 'aPosition');
		gl.enableVertexAttribArray(prog.positionAttrib);

		model.vboNormal = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
		gl.bufferData(gl.ARRAY_BUFFER, model.normals, gl.STATIC_DRAW);
		prog.normalAttrib = gl.getAttribLocation(prog, 'aNormal');
		gl.enableVertexAttribArray(prog.normalAttrib);

		model.iboLines = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesLines, gl.STATIC_DRAW);
		model.iboLines.numberOfElements = model.indicesLines.length;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		model.iboTris = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesTris, gl.STATIC_DRAW);
		model.iboTris.numberOfElements = model.indicesTris.length;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}

	function initEventHandler() {
		var deltaScale = 0.05;

		window.onkeydown = function(evt) {
            var sign = evt.shiftKey ? -1 : 1;
			var key = evt.which ? evt.which : evt.keyCode;
			var c = String.fromCharCode(key);

			switch(c) {
				case('O'):
					camera.projectionType = "ortho";
					camera.lrtb = 2;
					break;
				case('F'):
                    camera.projectionType = "frustum";
                    camera.lrtb = 1.2;
                    break;
                case('P'):
                    camera.projectionType = "perspective";
                    break;
				case('A'):
                    camera.zAngle += -1 * deltaRotate;
                    break;
				case('D'):
                    camera.zAngle += 1 * deltaRotate;
                    break;
				case('Q'):
                    camera.eye[1] += -1 * deltaTranslate;
                    break;
				case('E'):
                    camera.eye[1] += 1 * deltaTranslate;
                    break;
                case('W'):
					if (camera.distance >1) {
                    	camera.distance += -1 * deltaTranslate;
					} 
                    break;
				case('S'):
                    camera.distance += 1 * deltaTranslate;
                    break;
				case('Z'):
					if (sign >= 0) {
						if (camera.projectionType == "perspective") {
							camera.fovy -= (camera.fovy - 0) * 0.5;
						} else if (camera.projectionType == "ortho" || camera.projectionType == "frustum") {
							camera.lrtb -= camera.lrtb * 0.5;
						}
					} else {
						if (camera.projectionType == "perspective") {
							camera.fovy += ( 5 * Math.PI / 180) * (Math.PI - camera.fovy);
							console.log(camera.fovy);
						} else if (camera.projectionType == "ortho" || camera.projectionType == "frustum") {
							camera.lrtb += 0.1;
						}
					}
                    break;
				case('T'):
                    toggleWireframeOn = !toggleWireframeOn;
                    break;
				case('K'):
					sphereAngle = (sphereAngle + deltaRotate) % (2 * Math.PI);
					torus.rotate[1] += deltaRotate;

					const cosOffset = 1 + (Math.cos(sphereAngle));
					const sinOffset = Math.sin(sphereAngle);

					sphere1.translate[0] = cosOffset -2 ;
					sphere1.translate[2] = sinOffset ;

					sphere2.translate[0] = 1.3*(cosOffset  -1);
					sphere2.translate[2] = -1.3*(sinOffset -1);
				
					sphere3.translate[0] = (cosOffset -1)*2;
					sphere3.translate[2] = (-sinOffset -1)*2;
	
					sphere4.translate[0] = (-cosOffset)*1.5; 
					sphere4.translate[2] = sinOffset*1.5;	

					sphere5.translate[0] = (cosOffset)*1.5; 
					sphere5.translate[2] = (sinOffset+.25)*1.5;

					sphere6.translate[1] = cosOffset -1;
					sphere6.translate[2] = sinOffset;
                	break;
			}
			render();
		};
	}

	
	function render() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		setProjection();

        var x = 0, z = 2;
        camera.eye[x] = camera.center[x];
        camera.eye[z] = camera.center[z];
        camera.eye[x] += camera.distance * Math.sin(camera.zAngle);
        camera.eye[z] += camera.distance * Math.cos(camera.zAngle);

		mat4.lookAt(camera.vMatrix, camera.eye, camera.center, camera.up);

		for(var i = 0; i < models.length; i++) {
			updateTransformations(models[i]);

			gl.uniformMatrix4fv(prog.mvMatrixUniform, false, models[i].mvMatrix);

			gl.uniform4fv(prog.colorUniform, models[i].color);

			gl.uniformMatrix3fv(prog.nMatrixUniform, false, models[i].nMatrix);
			
			draw(models[i]);
		}
	}

	function updateTransformations(model) {
        var mMatrix = model.mMatrix;
        var mvMatrix = model.mvMatrix;
		
        mat4.identity(mMatrix);
        mat4.identity(mvMatrix);
        
		mat4.translate(mMatrix, mMatrix, model.translate);

		mat4.rotateX(mMatrix, mMatrix, model.rotate[0]);
		mat4.rotateY(mMatrix, mMatrix, model.rotate[1]);
		mat4.rotateZ(mMatrix, mMatrix, model.rotate[2]);

		mat4.scale(mMatrix, mMatrix, model.scale);
        
        mat4.multiply(mvMatrix, camera.vMatrix, mMatrix);

        mat3.normalFromMat4(model.nMatrix, mvMatrix);
	}

	function setProjection() {
		switch(camera.projectionType) {
			case("ortho"):
				var v = camera.lrtb;
				mat4.ortho(camera.pMatrix, -v, v, -v, v, -10, 10);
				break;
			case("frustum"):
                var v = camera.lrtb;
                mat4.frustum(camera.pMatrix, -v/2, v/2, -v/2, v/2, 1, 10);
                break;
            case("perspective"):
                mat4.perspective(camera.pMatrix, camera.fovy, 
                    camera.aspect, 1, 10);
                break;


		}
		gl.uniformMatrix4fv(prog.pMatrixUniform, false, camera.pMatrix);
	}

	function draw(model) {
		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
		gl.vertexAttribPointer(prog.positionAttrib,3,gl.FLOAT,false,0,0);

		gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
		gl.vertexAttribPointer(prog.normalAttrib,3,gl.FLOAT,false,0,0);

		var fill = (model.fillstyle.search(/fill/) != -1);
		if(fill) {
			gl.enableVertexAttribArray(prog.normalAttrib);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
			gl.drawElements(gl.TRIANGLES, model.iboTris.numberOfElements,
				gl.UNSIGNED_SHORT, 0);
		}

		var wireframe = (model.fillstyle.search(/wireframe/) != -1);
		if(wireframe && toggleWireframeOn) {
			gl.disableVertexAttribArray(prog.normalAttrib);
			gl.vertexAttrib3f(prog.normalAttrib, 0, 0, 0);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
			gl.drawElements(gl.LINES, model.iboLines.numberOfElements,
				gl.UNSIGNED_SHORT, 0);
		}
	}
	return {
		start : start
	}
}());