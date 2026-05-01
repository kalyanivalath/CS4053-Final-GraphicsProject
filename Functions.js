// Helper functions by Dr. Demirel for the Computer Graphics Class


//---------------------------VAO---------------------------//
//create VAO
function setVAO(){
  _vao = gl.createVertexArray();
  bindVAO(_vao);
  return _vao;
}
//unbind VAO
function unbindVAO(){
  gl.bindVertexArray(null);
}
//bind VAO
function bindVAO(_name){
  gl.bindVertexArray(_name);
}
//---------------------------VAO---------------------------//

//---------------------------Buffers and Attributes---------------------------//
//Buffer
function SetBuffer(_data, _type) {
  var _Buffer = gl.createBuffer();
  if (_type === "index") {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _Buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(_data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  } else {
    gl.bindBuffer(gl.ARRAY_BUFFER, _Buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
  return _Buffer;
}

function SetBufferData(_data, _buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, _buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(_data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return _buffer;
}

//Attribute
function SetAttribute(webglHelper, _name, _size, _stride, _offset) {

  var _AttributeLocation = gl.getAttribLocation(webglHelper.program, _name);
	gl.enableVertexAttribArray(_AttributeLocation);
	var size = _size;
	var type = gl.FLOAT;
	var normalize = false;
	var stride = _stride * Float32Array.BYTES_PER_ELEMENT;
	var offset = _offset * Float32Array.BYTES_PER_ELEMENT;
	gl.vertexAttribPointer(_AttributeLocation, size, type, normalize, stride, offset);

  if (webglHelper.attribLocations[_name] !== undefined)
        return webglHelper.attribLocations[_name];
  webglHelper.attribLocations[_name] = _AttributeLocation;
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return _AttributeLocation;
}

//Buffer and Attribute
function SetBufferAndAttribute(webglHelper, _name,_data, _size, _stride, _offset) {

  var _Buffer=SetBuffer(_data);
	gl.bindBuffer(gl.ARRAY_BUFFER, _Buffer);
	SetAttribute(webglHelper, _name, _size, _stride, _offset);
  return _Buffer;
}

function SetIndexBuffer(_data) {
  var _Buffer=SetBuffer(_data,"index");
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, _Buffer);
}

 // Get and cache a uniform location by name
function getUniformLocation(webglHelper,_name) {
    if (webglHelper.uniformLocations[_name] !== undefined)
      return webglHelper.uniformLocations[_name];

    var loc = gl.getUniformLocation(webglHelper.program, _name);
    webglHelper.uniformLocations[_name] = loc;
    return loc;
  }

  // Convenience: set a float uniform (1f)
function setUniform1f(webglHelper,_name, x) {
    gl.uniform1f(getUniformLocation(webglHelper, _name), x);
  }

  // Convenience: set an int uniform (1i) (used for samplers and toggles)
function setUniform1i(webglHelper,_name, x) {
    gl.uniform1i(getUniformLocation(webglHelper, _name), x);
  }

  // Convenience: set a vec2 uniform (2f)
function setUniform2f(webglHelper,_name, x, y) {
    gl.uniform2f(getUniformLocation(webglHelper, _name), x, y);
  }

  // Convenience: set a vec3 uniform (3f)
function setUniform3f(webglHelper,_name, x, y, z) {
    gl.uniform3f(getUniformLocation(webglHelper, _name), x, y, z);
  }

  // Convenience: set a vec4 uniform (4f)
function setUniform4f(webglHelper, _name, x, y, z, w) {
    gl.uniform4f(getUniformLocation(webglHelper, _name), x, y, z, w);
  }

  // Convenience: set a mat4 uniform
function setUniformMatrix4fv(webglHelper,_name, mat4Array, transpose = false) {
    gl.uniformMatrix4fv(getUniformLocation(webglHelper, _name), transpose, mat4Array);
  }

function CalculateTangents(vertices, indices, textureCoords, normals) {
  var tangents = new Array(vertices.length).fill(0.0);
  var bitangents = new Array(vertices.length).fill(0.0);

  for (var i = 0; i < indices.length; i += 3) {
    var i0 = indices[i];
    var i1 = indices[i + 1];
    var i2 = indices[i + 2];

    var p0 = i0 * 3;
    var p1 = i1 * 3;
    var p2 = i2 * 3;
    var uv0 = i0 * 2;
    var uv1 = i1 * 2;
    var uv2 = i2 * 2;

    var x1 = vertices[p1] - vertices[p0];
    var y1 = vertices[p1 + 1] - vertices[p0 + 1];
    var z1 = vertices[p1 + 2] - vertices[p0 + 2];
    var x2 = vertices[p2] - vertices[p0];
    var y2 = vertices[p2 + 1] - vertices[p0 + 1];
    var z2 = vertices[p2 + 2] - vertices[p0 + 2];

    var s1 = textureCoords[uv1] - textureCoords[uv0];
    var t1 = textureCoords[uv1 + 1] - textureCoords[uv0 + 1];
    var s2 = textureCoords[uv2] - textureCoords[uv0];
    var t2 = textureCoords[uv2 + 1] - textureCoords[uv0 + 1];

    var denom = s1 * t2 - s2 * t1;
    if (Math.abs(denom) < 1e-6)
      continue;

    var r = 1.0 / denom;
    var tangent = [
      (x1 * t2 - x2 * t1) * r,
      (y1 * t2 - y2 * t1) * r,
      (z1 * t2 - z2 * t1) * r
    ];
    var bitangent = [
      (x2 * s1 - x1 * s2) * r,
      (y2 * s1 - y1 * s2) * r,
      (z2 * s1 - z1 * s2) * r
    ];

    for (var j = 0; j < 3; j++) {
      tangents[p0 + j] += tangent[j];
      tangents[p1 + j] += tangent[j];
      tangents[p2 + j] += tangent[j];
      bitangents[p0 + j] += bitangent[j];
      bitangents[p1 + j] += bitangent[j];
      bitangents[p2 + j] += bitangent[j];
    }
  }

  for (var k = 0; k < vertices.length; k += 3) {
    var nx = normals[k];
    var ny = normals[k + 1];
    var nz = normals[k + 2];

    var tx = tangents[k];
    var ty = tangents[k + 1];
    var tz = tangents[k + 2];
    var tDotN = tx * nx + ty * ny + tz * nz;
    tx -= nx * tDotN;
    ty -= ny * tDotN;
    tz -= nz * tDotN;
    var tLen = Math.hypot(tx, ty, tz);
    if (tLen > 1e-6) {
      tangents[k] = tx / tLen;
      tangents[k + 1] = ty / tLen;
      tangents[k + 2] = tz / tLen;
    } else {
      tangents[k] = 1.0;
      tangents[k + 1] = 0.0;
      tangents[k + 2] = 0.0;
    }

    var bx = bitangents[k];
    var by = bitangents[k + 1];
    var bz = bitangents[k + 2];
    var bDotN = bx * nx + by * ny + bz * nz;
    bx -= nx * bDotN;
    by -= ny * bDotN;
    bz -= nz * bDotN;
    var bLen = Math.hypot(bx, by, bz);
    if (bLen > 1e-6) {
      bitangents[k] = bx / bLen;
      bitangents[k + 1] = by / bLen;
      bitangents[k + 2] = bz / bLen;
    } else {
      bitangents[k] = 0.0;
      bitangents[k + 1] = 1.0;
      bitangents[k + 2] = 0.0;
    }
  }

  return { tangents: tangents, bitangents: bitangents };
}

//---------------------------Buffers and Attributes---------------------------//

//---------------------------Matricies---------------------------//
//Scale Matrix
function Scale(webglHelper, Sx, Sy, Sz) {
	var ScaleMatrix = new Float32Array([
		Sx, 0.0, 0.0, 0.0,
		0.0, Sy, 0.0, 0.0,
		0.0, 0.0, Sz, 0.0,
		0.0, 0.0, 0.0,1.0
	]);
	setUniformMatrix4fv(webglHelper,'uScale', ScaleMatrix);

	return ScaleMatrix;
}

//Translation
function Translate(webglHelper, Tx, Ty, Tz) {
	var TranslationMatrix = new Float32Array([
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		Tx,  Ty,  Tz,  1.0
	]);
	
  setUniformMatrix4fv(webglHelper,'uTranslate', TranslationMatrix);

	return TranslationMatrix;
}
//Rotation Matrices
function Rotate(webglHelper, radian, axis) {
	var c = Math.cos(radian);
	var s = Math.sin(radian);
	var RotationMatrix;
	if (axis == 'z') {
		RotationMatrix = new Float32Array([
			c, 		  s,   0.0, 0.0,
			-1.0 * s, c,   0.0, 0.0,
			0.0,      0.0, 1.0, 0.0,
			0.0,      0.0, 0.0, 1.0
		]);

	setUniformMatrix4fv(webglHelper,'uZRotate', RotationMatrix);
	}
	else if (axis == 'x') {
		RotationMatrix = new Float32Array([
			1.0, 0.0, 		0.0, 0.0,
			0.0, c,   		s, 0.0,
			0.0, -1.0 * s,  c, 0.0,
			0.0, 0.0, 		0.0, 1.0
		]);
		setUniformMatrix4fv(webglHelper,'uXRotate', RotationMatrix);

	}
	else if (axis == 'y') {
		RotationMatrix = new Float32Array([
			c,   0.0, -1.0 * s, 0.0,
			0.0, 1.0, 0.0, 		0.0,
			s,   0.0, c,   		0.0,
			0.0, 0.0, 0.0, 		1.0
		]);
		setUniformMatrix4fv(webglHelper,'uYRotate', RotationMatrix);
	}


	return RotationMatrix;
}
//---------------------------Matricies---------------------------//
//---------------------------Matrix Math---------------------------//

//Inverse Matrix Function
function Inverse(m) {
	var m00 = m[0 * 4 + 0];
	var m01 = m[0 * 4 + 1];
	var m02 = m[0 * 4 + 2];
	var m03 = m[0 * 4 + 3];
	var m10 = m[1 * 4 + 0];
	var m11 = m[1 * 4 + 1];
	var m12 = m[1 * 4 + 2];
	var m13 = m[1 * 4 + 3];
	var m20 = m[2 * 4 + 0];
	var m21 = m[2 * 4 + 1];
	var m22 = m[2 * 4 + 2];
	var m23 = m[2 * 4 + 3];
	var m30 = m[3 * 4 + 0];
	var m31 = m[3 * 4 + 1];
	var m32 = m[3 * 4 + 2];
	var m33 = m[3 * 4 + 3];
	var tmp_0 = m22 * m33;
	var tmp_1 = m32 * m23;
	var tmp_2 = m12 * m33;
	var tmp_3 = m32 * m13;
	var tmp_4 = m12 * m23;
	var tmp_5 = m22 * m13;
	var tmp_6 = m02 * m33;
	var tmp_7 = m32 * m03;
	var tmp_8 = m02 * m23;
	var tmp_9 = m22 * m03;
	var tmp_10 = m02 * m13;
	var tmp_11 = m12 * m03;
	var tmp_12 = m20 * m31;
	var tmp_13 = m30 * m21;
	var tmp_14 = m10 * m31;
	var tmp_15 = m30 * m11;
	var tmp_16 = m10 * m21;
	var tmp_17 = m20 * m11;
	var tmp_18 = m00 * m31;
	var tmp_19 = m30 * m01;
	var tmp_20 = m00 * m21;
	var tmp_21 = m20 * m01;
	var tmp_22 = m00 * m11;
	var tmp_23 = m10 * m01;

	var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
		(tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
	var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
		(tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
	var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
		(tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
	var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
		(tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

	var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

	return [
		d * t0,
		d * t1,
		d * t2,
		d * t3,
		d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
			(tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
		d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
			(tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
		d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
			(tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
		d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
			(tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
		d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
			(tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
		d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
			(tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
		d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
			(tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
		d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
			(tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
		d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
			(tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
		d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
			(tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
		d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
			(tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
		d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
			(tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
	];
}

//Matrix Multiplication Function
function Multiply(a, b) {
	var a00 = a[0 * 4 + 0];
	var a01 = a[0 * 4 + 1];
	var a02 = a[0 * 4 + 2];
	var a03 = a[0 * 4 + 3];
	var a10 = a[1 * 4 + 0];
	var a11 = a[1 * 4 + 1];
	var a12 = a[1 * 4 + 2];
	var a13 = a[1 * 4 + 3];
	var a20 = a[2 * 4 + 0];
	var a21 = a[2 * 4 + 1];
	var a22 = a[2 * 4 + 2];
	var a23 = a[2 * 4 + 3];
	var a30 = a[3 * 4 + 0];
	var a31 = a[3 * 4 + 1];
	var a32 = a[3 * 4 + 2];
	var a33 = a[3 * 4 + 3];
	var b00 = b[0 * 4 + 0];
	var b01 = b[0 * 4 + 1];
	var b02 = b[0 * 4 + 2];
	var b03 = b[0 * 4 + 3];
	var b10 = b[1 * 4 + 0];
	var b11 = b[1 * 4 + 1];
	var b12 = b[1 * 4 + 2];
	var b13 = b[1 * 4 + 3];
	var b20 = b[2 * 4 + 0];
	var b21 = b[2 * 4 + 1];
	var b22 = b[2 * 4 + 2];
	var b23 = b[2 * 4 + 3];
	var b30 = b[3 * 4 + 0];
	var b31 = b[3 * 4 + 1];
	var b32 = b[3 * 4 + 2];
	var b33 = b[3 * 4 + 3];
	return [
		b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
		b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
		b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
		b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
		b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
		b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
		b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
		b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
		b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
		b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
		b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
		b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
		b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
		b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
		b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
		b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
	];
}
//---------------------------Matrix Math---------------------------//
//---------------------------Math---------------------------//
//Radians to degrees conversion
function radians_to_degrees(radians) {
	var pi = Math.PI;
	return radians * (180 / pi);
}

//Degrees to radians conversion
function degrees_to_radians(degrees) {
	var pi = Math.PI;
	return degrees * (pi / 180);
}
//---------------------------Math---------------------------//
//---------------------------Perspective---------------------------//
function perspective(fovR, aspect, zNear, zFar){
	var ppm= new Float32Array(16);

	var f=Math.tan(0.5*fovR);
	var rangeInverse= -1.0/(zFar-zNear);

	ppm[0]=1/(aspect*f);
	ppm[1]=0.0;
	ppm[2]=0.0;
	ppm[3]=0.0;

	ppm[4]=0.0;
	ppm[5]=1/f;
	ppm[6]=0.0;
	ppm[7]=0.0;

	ppm[8]=0.0;
	ppm[9]=0.0;
	ppm[10]=(zFar+zNear)*rangeInverse;
	ppm[11]=-1.0;

	ppm[12]=0.0;
	ppm[13]=0.0;
	ppm[14]=2.0*zFar*zNear*rangeInverse;
	ppm[15]=0.0;


	return ppm;

}

function setPerspective(webglHelper){
	var aspect=canvas.width/canvas.height;
	var pers=perspective(0.5,aspect,1e-4,1e4);
	setUniformMatrix4fv(webglHelper,'uP_Matrix', pers);
}
//---------------------------Perspective---------------------------//
//---------------------------Interaction---------------------------//
var w=false;
var a=false;
var s=false;
var d=false;
var e=false;
var q=false;
var c=false;
//keydown
function KeyButtonDownEvent(event){
	switch (event.key.toLowerCase()){
		case 'w': //w
			w=true;
			//console.log(w);
		break;

		case 'a': //a
			a=true;
		break;

		case 's': //s
			s=true;
		break;

		case 'd': //d
			d=true;
		break;

		case 'e': //e
			e=true;
		break;

		case 'q': //q
			q=true;
		break;

		case 'c': //c
			c=true;
		break;

	}
}
window.addEventListener('keydown', KeyButtonDownEvent);

//keyup
function KeyButtonUpEvent(event){
	switch (event.key.toLowerCase()){
		case 'w': //w
			w=false;
			//console.log(w);
		break;

		case 'a': //a
			a=false;
		break;

		case 's': //s
			s=false;
		break;

		case 'd': //d
			d=false;
		break;

		case 'e': //e
			e=false;
		break;

		case 'q': //q
			q=false;
		break;

		case 'c': //c
			c=false;
		break;

	}
}

window.addEventListener('keyup', KeyButtonUpEvent);


var button0=false;
var button2=false;

function MouseButtonEvent(event){
    var x=event.clientX;
    var y=event.clientY;
    console.log("X: "+x+" ,Y: "+y);
    console.log("Button: "+event.button);

    if(event.button==0)
    	{
            button0=true;
        }

    if(event.button==2)
        {
            button2=true;
        }
}
window.addEventListener('mousedown', MouseButtonEvent);
//---------------------------Interaction---------------------------//
//---------------------------Texture---------------------------//
// Returns true when the chosen minification filter requires mipmap levels to exist.
function UsesMipmaps(_minFilter) {
	return _minFilter === gl.NEAREST_MIPMAP_NEAREST ||
		   _minFilter === gl.LINEAR_MIPMAP_NEAREST ||
		   _minFilter === gl.NEAREST_MIPMAP_LINEAR ||
		   _minFilter === gl.LINEAR_MIPMAP_LINEAR;
}

// Checks whether the requested minification filter is one of WebGL's valid min filters.
function IsValidMinFilter(_minFilter) {
	return _minFilter === gl.NEAREST ||
		   _minFilter === gl.LINEAR ||
		   UsesMipmaps(_minFilter);
}

// Checks whether the requested magnification filter is valid, since mag filters cannot use mipmap modes.
function IsValidMagFilter(_magFilter) {
	return _magFilter === gl.NEAREST ||
		   _magFilter === gl.LINEAR;
}

// Creates a 2D texture, applies the requested wrap and filter settings, and builds mipmaps when the min filter needs them.
function CreateEmptyTexture(_wrap, _minFilter, _magFilter, _type, _width, _height,_source){
	var texture=gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture); //bind the channel to this.texture

	if(!IsValidMinFilter(_minFilter))
		throw new Error("Invalid TEXTURE_MIN_FILTER.");

	if(!IsValidMagFilter(_magFilter))
		throw new Error("Invalid TEXTURE_MAG_FILTER. Use gl.NEAREST or gl.LINEAR.");
	
	//WRAP if the texture coordinates are over 1 or less than 0
	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,_wrap);
	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,_wrap);

	//Magnification, Minification
	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,_minFilter);
	gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,_magFilter);

	gl.texImage2D(gl.TEXTURE_2D, 0, _type, _width, _height, 0, _type, gl.UNSIGNED_BYTE, _source);
	if(UsesMipmaps(_minFilter))
		gl.generateMipmap(gl.TEXTURE_2D);
	return texture;
}

function CreateImageTexture(_source, _wrap, _minFilter, _magFilter, _placeholder = null) { // Load a 2D texture from an image file
	var texture = gl.createTexture(); // Create the texture object
	gl.bindTexture(gl.TEXTURE_2D, texture); // Bind the texture for setup
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, _wrap); // Horizontal wrap mode
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, _wrap); // Vertical wrap mode
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, _minFilter); // Minification filter
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, _magFilter); // Magnification filter
	var placeholder = _placeholder || new Uint8Array([128, 128, 128, 255]);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, placeholder);
	var image = new Image(); 
	image.onload = function(){ // Upload the image once it finishes loading
		gl.bindTexture(gl.TEXTURE_2D, texture); // Rebind the texture before upload
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // WebGL images load top-down, so flip them for standard UVs
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image); // Copy the image into GPU memory
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); // Reset global unpack state so other uploads are unaffected
		if (UsesMipmaps(_minFilter))
			gl.generateMipmap(gl.TEXTURE_2D); // Build mipmaps only when the chosen filter needs them
	}; 
	image.onerror = function() {
		console.error("Failed to load image texture:", _source);
	};
	image.src = _source; // Start loading the requested file
	return texture; 
} 

function CreateCubeMap(_faceSources){
	var texture = gl.createTexture();
	var faceTargetInfo = [
		{ target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, source: _faceSources.posx },
		{ target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, source: _faceSources.negx },
		{ target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, source: _faceSources.posy },
		{ target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, source: _faceSources.negy },
		{ target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, source: _faceSources.posz },
		{ target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, source: _faceSources.negz }
	];
	var loadedFaceCount = 0;

	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);


	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	for (var i = 0; i < faceTargetInfo.length; i++) {
		(function(faceInfo){
			gl.texImage2D(
				faceInfo.target,
				0,
				gl.RGBA,
				1,
				1,
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE,
				new Uint8Array([0, 0, 0, 255])
			);

			var image = new Image();
			image.onload = function(){
				gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
				gl.texImage2D(faceInfo.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
				loadedFaceCount++;

				if (loadedFaceCount === faceTargetInfo.length && UsesMipmaps(gl.LINEAR)) {
					gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
				}
			};
			image.src = faceInfo.source;
		})(faceTargetInfo[i]);
	}

	return texture;
}

function ActivateTexture(_enum,_type, _name)
{
	gl.activeTexture(_enum);
    gl.bindTexture(_type, _name);
}


function Checker(texelSize,numCheckers){
	var imagedata = new Uint8Array(4* texelSize * texelSize);
	for (var i = 0; i < texelSize; i++)
	{
		for (var j = 0; j < texelSize; j++)
		{
			var x = Math.floor(i / (texelSize / numCheckers));
			var y = Math.floor(j / (texelSize / numCheckers));
			var pixelIndex = 4 * (i * texelSize + j);
			if (x % 2 == y % 2) {
				imagedata[pixelIndex] = 255;//R
				imagedata[pixelIndex + 1] = 0;//G
				imagedata[pixelIndex + 2] = 0;//B
				imagedata[pixelIndex + 3] = 255;//A
			}
			else 
			{
				imagedata[pixelIndex] = 0;//R
				imagedata[pixelIndex + 1] = 0;//G
				imagedata[pixelIndex + 2] = 0;//B
				imagedata[pixelIndex + 3] = 255;//A
			}
		}
	}
	return imagedata;

}
//---------------------------Texture---------------------------//

//---------------------------Coins---------------------------//
function createCoin(x, z) {
    var coin = new ReflectiveShape(
        coinVertices,
        coinIndices,
        coinTexCoords,
        coinNormals,
        CoinTexture,
        CoinNormal
    );

    coin.position = [x, 0.5, z];
    coin.size = [1.5, 1.5, 1.5];
    coin.rotation = [Math.PI / 2, 0, 0]; // lay flat
    coin.bumpStrength = 2.0;

    return coin;
}

function collectCoins() {
    // only run when C is pressed
    if (!keys["c"]) return;

    for (let i = 0; i < coins.length; i++) {
        if (!coins[i].active) continue;

        let coinPos = coins[i].object.position;
        let playerPos = PlayerCube.position;

        let hit = collision.SphereCollider(playerPos, coinPos, 2.5);

        if (hit) {
            coins[i].active = false;
            console.log("Coin collected!");
        }
    }
}
//---------------------------Coins---------------------------//

//---------------------------Trees---------------------------//
function createTree(x, z) {

    // TRUNK
    var trunk = new ReflectiveShape(
        cubeVertices,
        cubeIndices,
        cubeTextureCoordinates,
        cubeNormals,
        BarkTexture,
        BarkNormal
    );

    trunk.position = [x, -0.6, z];
    trunk.size = [1.5, 10, 1.5];
	trunk.bumpStrength = 2.5;

    // LEAVES
    var leaves = new ReflectiveShape(
        cubeVertices,
        cubeIndices,
        cubeTextureCoordinates,
        cubeNormals,
        LeafTexture,
        LeafNormal
    );

    leaves.position = [x, 1.5, z];
    leaves.size = [5.5, 5.5, 1.5];
	leaves.bumpStrength = 1.0;


    return {
        trunk: trunk,
        leaves: leaves
    };
}
//---------------------------Trees---------------------------//