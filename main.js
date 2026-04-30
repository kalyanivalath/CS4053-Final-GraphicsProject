/*
Main entry point for WebGL application

Responsibilities:
- Get WebGL context from canvas
- Compile shaders (vertex + fragment)
- Create buffers (geometry data)
- Set up camera matrices (view + projection)
- Start render loop
- Call other modules (player, world, lighting, collision)
*/

import { Player } from "./js/player.js";
import {CreateImageTexture} from "./js/Functions.js";

const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl");
let score = 0;

if (!canvas) {
  throw new Error("Canvas #glCanvas not found");
}

if (!gl) {
  alert("WebGL not supported in this browser.");
  throw new Error("WebGL not supported");
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

gl.enable(gl.DEPTH_TEST);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

// =======================
// PLAYER
// =======================
const player = new Player();
player.setPosition(0, 0, 0);

// =======================
// SHADERS
// =======================
const vertexShaderSource = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

varying vec2 vTexCoord;

void main() {
  gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
  vTexCoord = aTexCoord;
}
`;

const fragmentShaderSource = `
precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D uTexture;
uniform vec4 uColor;
uniform bool uUseTexture;

void main() {
  if (uUseTexture) {
    gl_FragColor = texture2D(uTexture, vTexCoord);
  } else {
    gl_FragColor = uColor;
  }
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw new Error("Shader compile failed");
  }

  return shader;
}

function createProgram(gl, vsSource, fsSource) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    throw new Error("Program link failed");
  }

  return program;
}

const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
gl.useProgram(program);

// =======================
// ATTRIBUTES / UNIFORMS
// =======================
const aPosition = gl.getAttribLocation(program, "aPosition");
const aTexCoord = gl.getAttribLocation(program, "aTexCoord");

const uModel = gl.getUniformLocation(program, "uModel");
const uView = gl.getUniformLocation(program, "uView");
const uProjection = gl.getUniformLocation(program, "uProjection");
const uTexture = gl.getUniformLocation(program, "uTexture");
const uColor = gl.getUniformLocation(program, "uColor");
const uUseTexture = gl.getUniformLocation(program, "uUseTexture");

// =======================
// MATRIX HELPERS
// =======================
function getProjectionMatrix() {
  const fov = Math.PI / 4;
  const aspect = canvas.width / canvas.height;
  const near = 0.1;
  const far = 100.0;

  const f = 1.0 / Math.tan(fov / 2);
  const rangeInv = 1 / (near - far);

  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * rangeInv, -1,
    0, 0, near * far * rangeInv * 2, 0
  ]);
}

function normalize(v) {
  const len = Math.hypot(v[0], v[1], v[2]);
  if (len === 0) return [0, 0, 0];
  return [v[0] / len, v[1] / len, v[2] / len];
}

function subtract(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function lookAt(eye, target, up) {
  const zAxis = normalize(subtract(eye, target));
  const xAxis = normalize(cross(up, zAxis));
  const yAxis = cross(zAxis, xAxis);

  return new Float32Array([
    xAxis[0], yAxis[0], zAxis[0], 0,
    xAxis[1], yAxis[1], zAxis[1], 0,
    xAxis[2], yAxis[2], zAxis[2], 0,
    -dot(xAxis, eye), -dot(yAxis, eye), -dot(zAxis, eye), 1
  ]);
}

function getTranslationMatrix(x, y, z) {
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    x, y, z, 1
  ]);
}

// =======================
// TEXTURE
// =======================
function createGrassTexture(gl) {
  const size = 128;
  const texCanvas = document.createElement("canvas");
  texCanvas.width = size;
  texCanvas.height = size;
  const ctx = texCanvas.getContext("2d");

  // base grass
  ctx.fillStyle = "#4f9f3f";
  ctx.fillRect(0, 0, size, size);

  // darker patches
  for (let i = 0; i < 450; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const w = 2 + Math.random() * 4;
    const h = 2 + Math.random() * 4;
    ctx.fillStyle = Math.random() > 0.5 ? "#3f8a31" : "#6bbf4d";
    ctx.fillRect(x, y, w, h);
  }

  // grass blade streaks
  for (let i = 0; i < 180; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const len = 6 + Math.random() * 10;

    ctx.strokeStyle = Math.random() > 0.5 ? "#2f6f24" : "#7ed957";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.random() * 3 - 1.5, y - len);
    ctx.stroke();
  }

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    texCanvas
  );

  gl.generateMipmap(gl.TEXTURE_2D);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  return texture;
}

const grassTexture = createGrassTexture(gl);
const coins = [];
for (let i = 0; i < 5; i++) {
  coins.push({
    x: Math.random() * 20 - 10,
    y: 1.0,
    z: Math.random() * 20 - 10,
    rotation: 0,
    collected: false,

    getBoundingBox() {
    return {
      minX: this.x - 0.3,
      maxX: this.x + 0.3,
      minY: this.y - 0.3,
      maxY: this.y + 0.3,
      minZ: this.z - 0.3,
      maxZ: this.z + 0.3
    };
  }
  });
}

// =======================
// GEOMETRY
// =======================

// Ground with texture coordinates
const groundVertices = new Float32Array([
  // x,  y,  z,   u,  v
  -10, 0, -10,   0,  0,
   10, 0, -10,   8,  0,
   10, 0,  10,   8,  8,
  -10, 0,  10,   0,  8
]);

const groundIndices = new Uint16Array([
  0, 1, 2,
  0, 2, 3
]);

// Player cube
const playerVertices = new Float32Array([
  // front
  -0.3, 0.0,  0.3,  0, 0,
   0.3, 0.0,  0.3,  1, 0,
   0.3, 0.8,  0.3,  1, 1,
  -0.3, 0.8,  0.3,  0, 1,

  // back
  -0.3, 0.0, -0.3,  0, 0,
   0.3, 0.0, -0.3,  1, 0,
   0.3, 0.8, -0.3,  1, 1,
  -0.3, 0.8, -0.3,  0, 1
]);

const playerIndices = new Uint16Array([
  0, 1, 2,  0, 2, 3,
  1, 5, 6,  1, 6, 2,
  5, 4, 7,  5, 7, 6,
  4, 0, 3,  4, 3, 7,
  3, 2, 6,  3, 6, 7,
  4, 5, 1,  4, 1, 0
]);


/*
const coinVertices = new Float32Array([
  -0.5, 0, -0.5,  0, 0,
   0.5, 0, -0.5,  1, 0,
   0.5, 0,  0.5,  1, 1,
  -0.5, 0,  0.5,  0, 1
]);
*/
const coinVertices = new Float32Array([
  -0.5, -0.5, 0,   0, 0,
   0.5, -0.5, 0,   1, 0,
   0.5,  0.5, 0,   1, 1,
  -0.5,  0.5, 0,   0, 1
]);


const coinIndices = new Uint16Array([
  0, 1, 2,
  0, 2, 3
]);

const coinMesh = createMesh(coinVertices, coinIndices);
const coinTexture = CreateImageTexture(gl, "Textures/coin-bg.png", gl.CLAMP_TO_EDGE, gl.LINEAR, gl.LINEAR)
const coinNormal = CreateImageTexture(gl, "Textures/coin-bg_normal.png", gl.CLAMP_TO_EDGE, gl.LINEAR, gl.LINEAR);

function createMesh(vertices, indices) {
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return {
    vertexBuffer,
    indexBuffer,
    indexCount: indices.length
  };
}

const groundMesh = createMesh(groundVertices, groundIndices);
const playerMesh = createMesh(playerVertices, playerIndices);

// =======================
// DRAW HELPERS
// =======================
function bindMesh(mesh) {
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);

  const stride = 5 * Float32Array.BYTES_PER_ELEMENT;

  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, stride, 0);

  gl.enableVertexAttribArray(aTexCoord);
  gl.vertexAttribPointer(
    aTexCoord,
    2,
    gl.FLOAT,
    false,
    stride,
    3 * Float32Array.BYTES_PER_ELEMENT
  );

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
}

function drawGround() {
  bindMesh(groundMesh);

  gl.uniformMatrix4fv(uModel, false, getTranslationMatrix(0, 0, 0));
  gl.uniform1i(uUseTexture, 1);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, grassTexture);
  gl.uniform1i(uTexture, 0);

  gl.drawElements(gl.TRIANGLES, groundMesh.indexCount, gl.UNSIGNED_SHORT, 0);
}

function drawPlayer() {
  bindMesh(playerMesh);

  gl.uniformMatrix4fv(
    uModel,
    false,
    getTranslationMatrix(player.position.x, player.position.y, player.position.z)
  );

  gl.uniform1i(uUseTexture, 0);
  gl.uniform4fv(uColor, [1.0, 0.5, 0.2, 1.0]);

  gl.drawElements(gl.TRIANGLES, playerMesh.indexCount, gl.UNSIGNED_SHORT, 0);
}

function drawCoin(coin) {
  bindMesh(coinMesh);

  // move coin
  const model = getTranslationMatrix(coin.x, coin.y, coin.z);
  gl.uniformMatrix4fv(uModel, false, model);

  // enable texture
  gl.uniform1i(uUseTexture, 1);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, coinTexture);
  gl.uniform1i(uTexture, 0);

  gl.drawElements(gl.TRIANGLES, coinMesh.indexCount, gl.UNSIGNED_SHORT, 0);
}

// =======================
// RENDER LOOP
// =======================
function render() {
  player.update([]);
  const collected = player.checkCollectibles(coins);

  const cameraPos = player.getCameraPosition();
  const cameraTarget = player.getCameraTarget();

  const projectionMatrix = getProjectionMatrix();
  const viewMatrix = lookAt(
    [cameraPos.x, cameraPos.y, cameraPos.z],
    [cameraTarget.x, cameraTarget.y, cameraTarget.z],
    [0, 1, 0]
  );

  gl.clearColor(0.5, 0.7, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.useProgram(program);
  gl.uniformMatrix4fv(uProjection, false, projectionMatrix);
  gl.uniformMatrix4fv(uView, false, viewMatrix);

  drawGround();
  drawPlayer();
  for (let coin of coins) {
    coin.y = 0.5;
    coin.rotation += 0.05;
  }
  for (let coin of coins) {
    if (!coin.collected) {
      drawCoin(coin);
    }
  }
  if (collected.length > 0) {
    score += collected.length;
    document.getElementById("score").innerText = "Score: " + score;
  }

  requestAnimationFrame(render);
}

render();