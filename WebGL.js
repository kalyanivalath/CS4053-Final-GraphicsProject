// A simple helper class to set up shaders and a WebGL program by Dr. Demirel for the Computer Graphics Class
class WebGL {
  constructor() {

    // Read vertex shader source from the HTML script tag
    this.vertexShaderSource = document.getElementById("vertex-shader").textContent.trimStart();

    // Read fragment shader source from the HTML script tag
    this.fragmentShaderSource = document.getElementById("fragment-shader").textContent.trimStart();

    // Compile the vertex shader
    this.vertexShader = this.createShader(gl.VERTEX_SHADER, this.vertexShaderSource);

    // Compile the fragment shader
    this.fragmentShader = this.createShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource);

    // Link both shaders into a WebGL program
    this.program = this.createProgram(this.vertexShader, this.fragmentShader);
    
    // Set the viewport to match the canvas size
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
    // Set the clear color to white
    gl.clearColor(1, 1, 1, 1);

    // Clear the color and depth buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Enable depth testing for correct 3D rendering
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Tell WebGL to use this shader program
    gl.useProgram(this.program);

    // Cache for attribute locations (optional convenience)
    this.attribLocations = {};

    // Cache for uniform locations (optional convenience)
    this.uniformLocations = {};
  }
  
  createShader(type, source) {
    // Create a new shader object (vertex or fragment)
    var shader = gl.createShader(type);

    // Attach GLSL source code to the shader
    gl.shaderSource(shader, source);

    // Compile the shader
    gl.compileShader(shader);

    // Check whether compilation succeeded
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

    // If successful, return the compiled shader
    if (success)
      return shader;

    // Otherwise, log the error message
    console.warn(gl.getShaderInfoLog(shader));

    // Clean up the failed shader
    gl.deleteShader(shader);
    return null;
  }
  
  createProgram(vs, fs) {
    if (!vs || !fs) {
      throw new Error("Shader compilation failed. Check the GLSL source above.");
    }

    // Create a new WebGL program
    var program = gl.createProgram();

    // Attach the vertex shader
    gl.attachShader(program, vs);

    // Attach the fragment shader
    gl.attachShader(program, fs);

    // Link the shaders into a runnable program
    gl.linkProgram(program);

    // Check whether linking succeeded
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);

    // If successful, we can detach and delete shaders (the program keeps its own linked copy)
    if (success) {
      // Detach shaders from the program
      gl.detachShader(program, vs);
      gl.detachShader(program, fs);

      // Delete shader objects to free GPU resources
      gl.deleteShader(vs);
      gl.deleteShader(fs);

      // Return the linked program
      return program;
    }

    // Otherwise, log the linking error
    console.error(gl.getProgramInfoLog(program));

    // Clean up the failed program
    gl.deleteProgram(program);
    return null;
  }
  // Make this program the active one
  use() {
    gl.useProgram(this.program);
  }
}
