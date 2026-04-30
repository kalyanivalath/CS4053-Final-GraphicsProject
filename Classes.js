class Light{
	constructor(){
		//Light Properties
		this.lightPosition = [0.0, 0.0, 1.0, 1.0];
		this.lightAmbient =  [0.03, 0.03, 0.03, 1.0];
		this.lightDiffuse =  [1.0, 1.0, 1.0, 1.0];
		this.lightSpecular = [1.0, 1.0, 1.0, 1.0];

	}
	render(index = 0, count = index + 1){
		//Send information to the shader to be used
		setUniform1i(myWebGL, "uLightCount", count);
		setUniform4f(myWebGL, `LightPos[${index}]`,
			this.lightPosition[0], this.lightPosition[1], this.lightPosition[2], this.lightPosition[3]);

		setUniform4f(myWebGL, `ambientLight[${index}]`,
			this.lightAmbient[0], this.lightAmbient[1], this.lightAmbient[2], this.lightAmbient[3]);

		setUniform4f(myWebGL, `diffuseLight[${index}]`,
			this.lightDiffuse[0], this.lightDiffuse[1], this.lightDiffuse[2], this.lightDiffuse[3]);

		setUniform4f(myWebGL, `specularLight[${index}]`,
			this.lightSpecular[0], this.lightSpecular[1], this.lightSpecular[2], this.lightSpecular[3]);
	}
}

class CollisionDetection{
    constructor()
    {
        this.collisionArray=new Array();
    }
    AABBCollider(obj1,obj2,maxDist)
    {
        var distX=Math.abs(obj1[0]-obj2[0]);
        var distY=Math.abs(obj1[1]-obj2[1]);
        var distZ=Math.abs(obj1[2]-obj2[2]);

        if(distX<=maxDist && distY<=maxDist && distZ<=maxDist)
        {
            return true;
        }
        else
        {
            return false;
        }

    }
    SphereCollider(obj1,obj2,maxDist)
    {
        var dist= Math.sqrt(Math.pow(obj1[0]-obj2[0],2)+//x
                            Math.pow(obj1[1]-obj2[1],2)+//y
                            Math.pow(obj1[2]-obj2[2],2));//z
        //var maxDist=obj1radius+obj2radius;
        if (dist<=maxDist)
        {
            return true;
        }
        else
        {
            return false;
        }
    }
 }
 class Camera{
	constructor(){
        this.position=[0.0,0.0,0.0];
        this.rotation=[0.0,0.0,0.0];
        this.speed=0.02;
	}
	keyboardEvents(){
        //forward
		if(w){
			this.position[0]-=this.speed*Math.sin(this.rotation[1]);
			this.position[2]-=this.speed*Math.cos(this.rotation[1]);
		}
		//backward
		if (s){
			this.position[0]+=this.speed*Math.sin(this.rotation[1]);
			this.position[2]+=this.speed*Math.cos(this.rotation[1]);
		}
		//left
		if(a){
			this.position[0]-=this.speed*Math.cos(this.rotation[1]);
			this.position[2]+=this.speed*Math.sin(this.rotation[1]);
		}
		//right
		if(d){
			this.position[0]+=this.speed*Math.cos(this.rotation[1]);
			this.position[2]-=this.speed*Math.sin(this.rotation[1]);
		}
		//rotate y+
		if(q){
			this.rotation[1]+=this.speed;
		}
		//rotate y-
		if(e){
			this.rotation[1]-=this.speed;
		}
	}
	render(){
        this.keyboardEvents();
        var camera_position_matrix=Translate(myWebGL,this.position[0],this.position[1],this.position[2]);
		var camera_rotation_matrix=Rotate(myWebGL,this.rotation[1],'y');
        var view_matrix= Inverse(Multiply(camera_position_matrix,camera_rotation_matrix));
        setUniformMatrix4fv(myWebGL,'uView_matrix', view_matrix);
        setUniform3f(myWebGL, 'uCameraPosition', this.position[0], this.position[1], this.position[2]);
	}
}
 
class Shape
            {
                constructor(vertices, indices = null, textureCoords = null)
                {
                    // Store vertex positions array (x, y, z per vertex)
                    this.vertices = vertices;

                    // Store vertex colors array (r, g, b per vertex)
                    this.indices = indices;
                    this.textureCoords = textureCoords || this.generateTextureCoords(vertices);
                    this.size = [1.0, 1.0, 1.0];
                    this.position = [0.0, 0.0, 0];
                    this.rotation = [0.0, 0.0, 0.0];


                    // --- Create ONE VAO for this shape ---
                    this.vao=setVAO();

                    this.vertexBuffer = SetBufferAndAttribute(myWebGL, "coordinates",this.vertices, 3, 0, 0);
                    this.textureBuffer = SetBufferAndAttribute(myWebGL, "textureCoordinates", this.textureCoords, 2, 0, 0);
                    SetIndexBuffer(this.indices);

                    this.artificialTexture= Checker(128,64);//Create our artificial texture
                    this.texture=CreateTexture(gl.CLAMP_TO_EDGE, gl.LINEAR_MIPMAP_LINEAR, gl.LINEAR, gl.RGBA, 128, 128, this.artificialTexture);

		            
                    unbindVAO();
                }

                generateTextureCoords(vertices)
                {
                    var textureCoords = [];

                    for (var i = 0; i < vertices.length; i += 3) {
                        var x = vertices[i];
                        var y = vertices[i + 1];

                        textureCoords.push((x + 0.5), (y + 0.5));
                    }

                    return textureCoords;
                }


                render()
                {
                    Scale(myWebGL, this.size[0], this.size[1], this.size[2]);
                    Translate(myWebGL, this.position[0], this.position[1], this.position[2]);
                    Rotate(myWebGL, this.rotation[0], 'x');
                    Rotate(myWebGL, this.rotation[1], 'y');
                    Rotate(myWebGL, this.rotation[2], 'z');
                    // Bind THIS shape's VAO and draw
                    bindVAO(this.vao);
                    ActivateTexture(gl.TEXTURE0, gl.TEXTURE_2D, this.texture); //Bind 2D Texture

                    setUniform1i(myWebGL, "uTexture", 0); //2D texture sampler unit
                    setUniform1i(myWebGL, "uUseSkybox", 0); //Disable skybox
                    setUniform1i(myWebGL, "uUseReflectionMap", 0); //Disable reflection map
                    setUniform1i(myWebGL, "uUseBlendMap", 0); //Disable blend map
                    setUniform1i(myWebGL, "uNormalMap", 0); //Point the normal-map sampler at the base texture unit
                    setUniform1f(myWebGL, "uBumpStrength", 0.0); //Disable bump mapping for plain shapes
                    setUniform1f(myWebGL, "uBlendFactor", 0.0); //blend factor set to 0
                    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);//draw shape

                    unbindVAO();
                }
            }

class Skybox
            {
                constructor(vertices, indices, textureCoords, cubeMapTexture)
                {
                    this.vertices = vertices;
                    this.indices = indices;
                    this.textureCoords = textureCoords;
                    this.size = [20.0, 20.0, 20.0];
                    this.position = [0.0, 0.0, 0.0];
                    this.rotation = [0.0, 0.0, 0.0];

                    this.vao = setVAO();

                    this.vertexBuffer = SetBufferAndAttribute(myWebGL, "coordinates", this.vertices, 3, 0, 0);
                    this.textureBuffer = SetBufferAndAttribute(myWebGL, "textureCoordinates", this.textureCoords, 2, 0, 0);
                    SetIndexBuffer(this.indices);

                    this.texture = cubeMapTexture;

                    unbindVAO();
                }

                render(_camera)
                {
                    this.position[0] = _camera.position[0];
                    this.position[1] = _camera.position[1];
                    this.position[2] = _camera.position[2];
                    
                    
                    Scale(myWebGL, this.size[0], this.size[1], this.size[2]);
                    Translate(myWebGL, this.position[0], this.position[1], this.position[2]);
                    Rotate(myWebGL, this.rotation[0], 'x');
                    Rotate(myWebGL, this.rotation[1], 'y');
                    Rotate(myWebGL, this.rotation[2], 'z');

                    bindVAO(this.vao);
                    gl.depthMask(false); // Disable depth writes
                    gl.depthFunc(gl.LEQUAL); // Depth test mode
                    gl.cullFace(gl.FRONT); // Cull front faces
                    ActivateTexture(gl.TEXTURE1, gl.TEXTURE_CUBE_MAP, this.texture); // Bind cubemap texture - This value needs to match the Texture unit in TEXTURE1

                    setUniform1i(myWebGL, "uCubeMap", 1); // Cubemap sampler unit
                    setUniform1i(myWebGL, "uUseSkybox", 1); // Enable skybox
                    setUniform1i(myWebGL, "uUseReflectionMap", 0); // Disable reflection map
                    setUniform1i(myWebGL, "uUseBlendMap", 0); // Disable blend map
                    setUniform1f(myWebGL, "uBlendFactor", 0.0); // Blend factor
                    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0); // Draw skybox
                    setUniform1i(myWebGL, "uUseSkybox", 0); // Disable skybox

                    gl.cullFace(gl.BACK); // Cull back faces
                    gl.depthFunc(gl.LESS); // Default depth test
                    gl.depthMask(true); // Enable depth writes
                    unbindVAO();
                }
            }

class ReflectiveShape
            {
                constructor(vertices, indices, textureCoords, normals, colorTexture=null, normalTexture = null) // Accept an optional color and normal map texture
                {
                    this.vertices = vertices;
                    this.indices = indices;
                    this.textureCoords = textureCoords;
                    this.normals = normals;
                    var tangentFrame = CalculateTangents(this.vertices, this.indices, this.textureCoords, this.normals);
                    this.cubeMapTexture; //cubeMapTexture;
                    this.colorTexture = colorTexture || CreateEmptyTexture(gl.CLAMP_TO_EDGE, gl.LINEAR, gl.LINEAR, gl.RGBA, 1, 1, new Uint8Array([255, 255, 255, 255]));
                    this.normalTexture = normalTexture || CreateEmptyTexture(gl.CLAMP_TO_EDGE, gl.LINEAR, gl.LINEAR, gl.RGBA, 1, 1, new Uint8Array([128, 128, 255, 255])); // Fall back to a flat normal map
                    this.size = [1.0, 1.0, 1.0];
                    this.position = [0.0, 0.0, 0.0];
                    this.rotation = [0.0, 0.0, 0.0];
                    this.blendFactor = 1.0;
                    this.bumpStrength = 2.0; // Control how strongly the normal map perturbs the surface

                    //Material Properties
                    this.AmbientMaterial=[1.0, 1.0, 1.0, 1.0];
		            this.DiffuseMaterial=[1.0, 1.0, 1.0, 1.0];
		            this.SpecularMaterial=[1.0,1.0,1.0,1.0];
		            this.Shininess=200.0;

                    this.vao = setVAO();

                    this.vertexBuffer = SetBufferAndAttribute(myWebGL, "coordinates", this.vertices, 3, 0, 0);
                    this.textureBuffer = SetBufferAndAttribute(myWebGL, "textureCoordinates", this.textureCoords, 2, 0, 0);
                    this.normalBuffer = SetBufferAndAttribute(myWebGL, "normal", this.normals, 3, 0, 0);
                    this.tangentBuffer = SetBufferAndAttribute(myWebGL, "tangent", tangentFrame.tangents, 3, 0, 0);
                    this.bitangentBuffer = SetBufferAndAttribute(myWebGL, "bitangent", tangentFrame.bitangents, 3, 0, 0);
                    SetIndexBuffer(this.indices);

                    unbindVAO();
                }

                render()
                {
                    Scale(myWebGL, this.size[0], this.size[1], this.size[2]);
                    Translate(myWebGL, this.position[0], this.position[1], this.position[2]);
                    Rotate(myWebGL, this.rotation[0], 'x');
                    Rotate(myWebGL, this.rotation[1], 'y');
                    Rotate(myWebGL, this.rotation[2], 'z');

                    bindVAO(this.vao);

                    //Send information to the shader to be used
		            setUniform4f(myWebGL, "ambientMat",
		            	this.AmbientMaterial[0], this.AmbientMaterial[1], this.AmbientMaterial[2], this.AmbientMaterial[3]);
		            setUniform4f(myWebGL, "diffuseMat",
		            	this.DiffuseMaterial[0], this.DiffuseMaterial[1], this.DiffuseMaterial[2], this.DiffuseMaterial[3]);
		            setUniform4f(myWebGL, "specularMat",
		            	this.SpecularMaterial[0], this.SpecularMaterial[1], this.SpecularMaterial[2], this.SpecularMaterial[3]);
		            setUniform1f(myWebGL, "shininess", this.Shininess);

                    ActivateTexture(gl.TEXTURE0, gl.TEXTURE_2D, this.colorTexture); // Bind 2D texture
                    ActivateTexture(gl.TEXTURE1, gl.TEXTURE_CUBE_MAP, this.cubeMapTexture); // Bind cubemap texture
                    ActivateTexture(gl.TEXTURE2, gl.TEXTURE_2D, this.normalTexture); // Bind the normal map texture

                    setUniform1i(myWebGL, "uTexture", 0); // 2D texture sampler unit - This value needs to match the Texture unit in TEXTURE0
                    setUniform1i(myWebGL, "uCubeMap", 1); // Cubemap sampler unit - This value needs to match the Texture unit in TEXTURE1
                    setUniform1i(myWebGL, "uNormalMap", 2); // Normal-map sampler unit - This value needs to match the Texture unit in TEXTURE2
                    setUniform1i(myWebGL, "uUseSkybox", 0); // Disable skybox
                    setUniform1f(myWebGL, "uBumpStrength", this.bumpStrength); // Send the bump intensity to the shader
                    setUniform1f(myWebGL, "uBlendFactor", this.blendFactor); // Blend factor

                    if(this.blendFactor >= 1.0)
                    {
                        setUniform1i(myWebGL, "uUseReflectionMap", 1);
                        setUniform1i(myWebGL, "uUseBlendMap", 0);
                    }
                    else if(this.blendFactor > 0.0)
                    {
                        setUniform1i(myWebGL, "uUseReflectionMap", 0);
                        setUniform1i(myWebGL, "uUseBlendMap", 1);
                    }
                    else
                    {
                        setUniform1i(myWebGL, "uUseReflectionMap", 0);
                        setUniform1i(myWebGL, "uUseBlendMap", 0);
                    }

                    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
                    setUniform1i(myWebGL, "uUseReflectionMap", 0);
                    setUniform1i(myWebGL, "uUseBlendMap", 0);
                    setUniform1f(myWebGL, "uBumpStrength", 0.0); // Reset bump strength after drawing
                    setUniform1f(myWebGL, "uBlendFactor", 0.0);

                    unbindVAO();
                }
            }
 
 // Shape class that stores vertex + color data in separate buffers and renders it using WebGL
            // WebGL2 best practice: ONE VAO per shape (mesh). The VAO remembers attribute layout + buffer bindings.
            class ShapeWithColor
            {
                constructor(vertices, colors, indices = null)
                {
                    // Store vertex positions array (x, y, z per vertex)
                    this.vertices = vertices;

                    // Store vertex colors array (r, g, b per vertex)
                    this.colors = colors;
                    this.indices = indices;
                    this.size = [1.0, 1.0, 1.0];
                    this.position = [0.0, 0.0, 0];
                    this.rotation = [0.0, 0.0, 0.0];


                    // --- Create ONE VAO for this shape ---
                    this.vao=setVAO();

                    this.vertexBuffer = SetBufferAndAttribute(myWebGL, "coordinates",this.vertices, 3, 0, 0);
                    this.colorBuffer = SetBufferAndAttribute(myWebGL, "color",this.colors, 3, 0, 0);
                    SetIndexBuffer(this.indices);
                }

                setSolidColor(color)
                {
                    if (this.colors[0] === color[0] && this.colors[1] === color[1] && this.colors[2] === color[2]) {
                        return;
                    }

                    var updatedColors = [];

                    for (var i = 0; i < this.colors.length; i += 3) {
                        updatedColors.push(color[0], color[1], color[2]);
                    }

                    this.colors = updatedColors;
                    bindVAO(this.vao);
                    SetBufferData(this.colors,this.colorBuffer);
                    unbindVAO();
                }

                render()
                {
                    //this.size = [GlobalScale, GlobalScale, GlobalScale];
                    Scale(myWebGL, this.size[0], this.size[1], this.size[2]);
                    Translate(myWebGL, this.position[0], this.position[1], this.position[2]);
                    Rotate(myWebGL, this.rotation[0], 'x');
                    Rotate(myWebGL, this.rotation[1], 'y');
                    Rotate(myWebGL, this.rotation[2], 'z');
                    // Bind THIS shape's VAO and draw
                    bindVAO(this.vao);
                    setUniform1i(myWebGL, "uUseSkybox", 0);
                    setUniform1i(myWebGL, "uUseReflectionMap", 0);
                    setUniform1i(myWebGL, "uUseBlendMap", 0);
                    setUniform1f(myWebGL, "uBlendFactor", 0.0);
                    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);

                    unbindVAO();
                }
            }
