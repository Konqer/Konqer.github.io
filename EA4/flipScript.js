 var canvas = document.getElementById('canvas');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const gl = canvas.getContext('experimental-webgl');

  gl.clearColor(0.1, 0.1, 0.1, 0);

  gl.frontFace(gl.CCW);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  gl.enable(gl.POLYGON_OFFSET_FILL);
  gl.polygonOffset(1.0, 1.0);

  const vsSource = ''
    + 'attribute vec3 pos;'
    + 'attribute vec4 col;'
    + 'varying vec4 color;'
    + 'void main(){'
    + 'color = col;'
    + 'gl_Position = vec4(pos * 0.1, 1);'
    + '}';

  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vsSource);
  gl.compileShader(vs);

  const fsSouce = 'precision mediump float;'
    + 'varying vec4 color;'
    + 'void main() {'
    + 'gl_FragColor = color;'
    + '}';

  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fsSouce);
  gl.compileShader(fs);

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, 'pos');
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const {verticesApple, indicesLinesApple, indicesTrianglesApple} = createAppleVertexData();

  const vboPosApple = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vboPosApple);
  gl.bufferData(gl.ARRAY_BUFFER, verticesApple, gl.STATIC_DRAW);

  const posAttribApple = gl.getAttribLocation(prog, 'pos');
  gl.vertexAttribPointer(posAttribApple, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(posAttribApple);

  const colAttribApple = gl.getAttribLocation(prog, 'col');

  const iboLinesApple = createIBO(indicesLinesApple);
  const iboTriangleApple = createIBO(indicesTrianglesApple);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const linesColorApple = {r: 0.9, g: 0.45, b: 0.88, a: 0};

  const triangleColorApple = {};

  setupIboRendering(colAttribApple, iboTriangleApple, gl.TRIANGLES, triangleColorApple);
  setupIboRendering(colAttribApple, iboLinesApple, gl.LINES, linesColorApple);

  const {verticesTorus, indicesLinesTorus, indicesTrianglesTorus} = createTorusVertexData();

  const vboPosTorus = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vboPosTorus);
  gl.bufferData(gl.ARRAY_BUFFER, verticesTorus, gl.STATIC_DRAW);

  const posAttribTorus = gl.getAttribLocation(prog, 'pos');
  gl.vertexAttribPointer(posAttribTorus, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(posAttribTorus);

  const colAttribTorus = gl.getAttribLocation(prog, 'col');
  const iboLinesTorus = createIBO(indicesLinesTorus);
  const iboTrianglesTorus = createIBO(indicesTrianglesTorus);

  const linesColorTorus = {r: 1, g: 1, b: 1, a: 1};

  const trianglesColorTorus = {};

  setupIboRendering(colAttribTorus, iboTrianglesTorus, gl.TRIANGLES, trianglesColorTorus);
  setupIboRendering(colAttribTorus, iboLinesTorus, gl.LINES, linesColorTorus);

  function createAppleVertexData() {
    const _vertices = [];
    const _indicesLines = [];
    const _indicesTriangles = [];

    const m = 32;
    const n = 32;

    const rangeU = { min: 0, max: 2 * Math.PI };
    const rangeV = { min: -Math.PI, max: Math.PI};

    const du = (rangeU.max - rangeU.min) / n;
    const dv = (rangeV.max - rangeV.min) / m;

    let counterLines = 0;
    let counterTriangles = 0;

    for (let u = rangeU.min, i = 0; i <= n; i++, u += du) {
      for (let v = rangeV.min, j = 0; j <= m; j++, v += dv) {
        const iVertex = i * (m + 1) + j;

        var x = Math.cos(u) * ( 4 + 3.8 * Math.cos(v)) * 1;
        var z = Math.sin(u) * ( 4 + 3.8 * Math.cos(v))*1;
        var y = (Math.cos(v) + Math.sin(v)-1) * (1+Math.sin(v)) * Math.log(1-Math.PI * v/10 )  + 7.5 * Math.sin(v)*1;

        _vertices[iVertex * 3] = x * 0.5;
        _vertices[iVertex * 3 + 1] = y * 0.5;
        _vertices[iVertex * 3 + 2] = z * 0.5;

        if (j > 0 && i > 0) {
          _indicesLines[counterLines++] = iVertex - 1;
          _indicesLines[counterLines++] = iVertex;
        }

        if (j > 0 && i > 0) {
          _indicesLines[counterLines++] = iVertex - (m + 1);
          _indicesLines[counterLines++] = iVertex;
        }

        if (j > 0 && i > 0) {
          _indicesTriangles[counterTriangles++] = iVertex;
          _indicesTriangles[counterTriangles++] = iVertex - 1;
          _indicesTriangles[counterTriangles++] = iVertex - (m + 1);

          _indicesTriangles[counterTriangles++] = iVertex - 1;
          _indicesTriangles[counterTriangles++] = iVertex - (m + 1) - 1;
          _indicesTriangles[counterTriangles++] = iVertex - (m + 1);
        }
      }
    }

    return {
      verticesApple: new Float32Array(_vertices),
      indicesLinesApple: new Uint16Array(_indicesLines),
      indicesTrianglesApple: new Uint16Array(_indicesTriangles),
    };
  }

  function createTorusVertexData() {
    const _vertices = [];
    const _indicesLines = [];
    const _indicesTriangles = [];

    const m = 30;
    const n = 30;

    const rangeU = { min: 0, max: (Math.PI * 2) };
    const rangeV = { min: 0, max: (Math.PI * 2) };

    const du = (rangeU.max - rangeU.min) / n;
    const dv = (rangeV.max - rangeV.min) / m;

    let counterLines = 0;
    let counterTriangles = 0;

    const r = 1;
    const R = 6;

    for (let u = rangeU.min, i = 0; i <= n; i++, u += du) {
      for (let v = rangeV.min, j = 0; j <= m; j++, v += dv) {
        const iVertex = i * (m + 1) + j;

        const x = (R + r * Math.cos(v)) * Math.cos(u);
        const z = (R + r * Math.cos(v)) * Math.sin(u);
        const y = r * Math.sin(v);

        _vertices[iVertex * 3] = x;
        _vertices[iVertex * 3 + 1] = y;
        _vertices[iVertex * 3 + 2] = z;

        if (j > 0 && i > 0) {
          _indicesLines[counterLines++] = iVertex - 1;
          _indicesLines[counterLines++] = iVertex;
        }

        if (j > 0 && i > 0) {
          _indicesLines[counterLines++] = iVertex - (m + 1);
          _indicesLines[counterLines++] = iVertex;
        }

        if (j > 0 && i > 0) {
          _indicesTriangles[counterTriangles++] = iVertex;
          _indicesTriangles[counterTriangles++] = iVertex - 1;
          _indicesTriangles[counterTriangles++] = iVertex - (m + 1);

          _indicesTriangles[counterTriangles++] = iVertex - 1;
          _indicesTriangles[counterTriangles++] = iVertex - (m + 1) - 1;
          _indicesTriangles[counterTriangles++] = iVertex - (m + 1);
        }
      }
    }

    return {
      verticesTorus: new Float32Array(_vertices),
      indicesLinesTorus: new Uint16Array(_indicesLines),
      indicesTrianglesTorus: new Uint16Array(_indicesTriangles),
    };
  }

  function setupIboRendering(colorAttribute, ibo, renderingType, color) {
    const {
      r, g, b, a,
    } = color;

    if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a) || ![gl.TRIANGLES, gl.LINES].includes(renderingType)) {
      console.error('Pay attention to the rendering attributes', color, renderingType);
      return;
    }

    gl.vertexAttrib4f(colorAttribute, r, g, b, a);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.drawElements(renderingType, ibo.numberOfElements, gl.UNSIGNED_SHORT, 0);
  }

  function createIBO(indices) {
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    ibo.numberOfElements = indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return ibo;
  }