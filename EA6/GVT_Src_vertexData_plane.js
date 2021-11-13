var plane = ( function() {

	function createVertexData() {
        var n = 100;
        var m = 100;
		
		this.vertices = new Float32Array(3 * (n + 1) * (m + 1));
		var vertices = this.vertices;

		this.normals = new Float32Array(3 * (n + 1) * (m + 1));
		var normals = this.normals;
		
		this.indicesLines = new Uint16Array(2 * 2 * n * m);
		var indicesLines = this.indicesLines;
		this.indicesTris = new Uint16Array(3 * 2 * n * m);
		var indicesTris = this.indicesTris;

		var du = 20 / n;
        var dv = 20 / m;

		var iLines = 0;
		var iTris = 0;
        
        for(var i = 0, u = -10; i <= n; i++, u += du) {
            for(var j = 0, v = -10; j <= m; j++, v += dv) {
                var iVertex = i * (m + 1) + j;

                var x = u;
                var y = 0;
                var z = v;

                vertices[iVertex * 3] = x;
                vertices[iVertex * 3 + 1] = y;
                vertices[iVertex * 3 + 2] = z;

                normals[iVertex * 3] = 0;
                normals[iVertex * 3 + 1] = 1;
                normals[iVertex * 3 + 2] = 0;

				if(j > 0 && i > 0) {
					indicesLines[iLines++] = iVertex - 1;
					indicesLines[iLines++] = iVertex;
				}
				if(j > 0 && i > 0) {
					indicesLines[iLines++] = iVertex - (m + 1);
					indicesLines[iLines++] = iVertex;
				}
				if(j > 0 && i > 0) {
					indicesTris[iTris++] = iVertex;
					indicesTris[iTris++] = iVertex - 1;
					indicesTris[iTris++] = iVertex - (m + 1);
					
					indicesTris[iTris++] = iVertex - 1;
					indicesTris[iTris++] = iVertex - (m + 1) - 1;
					indicesTris[iTris++] = iVertex - (m + 1);
				}
			}
		}
	}
	return {
		createVertexData : createVertexData
	}
}());
