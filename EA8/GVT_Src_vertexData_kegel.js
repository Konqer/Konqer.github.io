var kegel = ( function() {

	function createVertexData() {
		var n = 16;
		var m = 1;

		this.vertices = new Float32Array(3 * (n+1) * (m+1));
		var vertices = this.vertices;
		
		this.normals = new Float32Array(3 * (n + 1) * (m + 1));
		var normals = this.normals;
		
		this.indicesLines = new Uint16Array(2 * 2 * n * m);
		var indicesLines = this.indicesLines;
		this.indicesTris = new Uint16Array(3 * 2 * n * m);
		var indicesTris = this.indicesTris;

		var du = 2*Math.PI/n;
        var dv = .25/m;

        var r = 0.3;
		
		var iLines = 0;
		var iTris = 0;
		
		var verschiebungY = 0;

		for(var i=0, u=-Math.PI; i <= n; i++, u += du) {
			for(var j=0, v=0; j <= m; j++, v += dv) {
				var iVertex = i * (m + 1) + j;

				var x = r*Math.cos(u); 
                var z = r*Math.sin(u); 
                var y = v + verschiebungY;

				vertices[iVertex * 3] = x;
				vertices[iVertex * 3 + 1] = y;
				vertices[iVertex * 3 + 2] = z;

				var nx = Math.cos(u) * Math.cos(v);
				var ny = Math.cos(u) * Math.sin(v);
				var nz = Math.sin(u);

				normals[iVertex * 3] = nx;
				normals[iVertex * 3 + 1] = ny;
				normals[iVertex * 3 + 2] = nz;

                if(j>0 && i>0){
                    indicesLines[iLines++] = iVertex - 1;
                    indicesLines[iLines++] = iVertex;
                }
				if(j>0 && i>0){
					indicesLines[iLines++] = iVertex - (m+1);                            
					indicesLines[iLines++] = iVertex;
				}  
                if(j>0 && i>0){
					indicesTris[iTris++] = iVertex;
                    indicesTris[iTris++] = iVertex - 1;
                    indicesTris[iTris++] = iVertex - (m+1);
                                                
                    indicesTris[iTris++] = iVertex - 1;
                    indicesTris[iTris++] = iVertex - (m+1) - 1;                            
                    indicesTris[iTris++] = iVertex - (m+1);                            
                }
			}
		}
	}
	return {
		createVertexData : createVertexData
	}
}());
