// Rotating cube, FixedFunction (FF) version.
//Music
import bgmFile from '../assets/music/rasputin_shortened.mp3'

import './style.css';
import { mat3, mat4, vec3 } from 'gl-matrix';
import { ATTRIB, createFixedFunction, LIGHTING } from './vendor/ff/ff';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CLEAR_COLOR,
  CUBE_INDICES,
  CUBE_VERTICES,
  SPHERE_INDICES,
  SPHERE_VERTICES,
  CYLINDER_VERTICES,
  CYLINDER_INDICES,
  ARROW_VERTICES,
  ARROW_INDICES,
  ZACARIAS_RUSSIAN_TANK_TRACK_VERTICES,
  ZACARIAS_RUSSIAN_TANK_TRACK_INDICES,
  NORMAL_OFFSET_BYTES,
  STRIDE_BYTES,
} from './constants';
import { TreeNode } from './treenode';

//MUSIC
const bgm = new Audio(bgmFile);
bgm.loop = true;
bgm.volume = 0.05;
const cannon_audio = new Audio ('../assets/music/cannon_sfx_shortened.mp3');
cannon_audio.loop = false;
cannon_audio.volume = 0.4;
const alien_dying_audio = new Audio ('../assets/music/alien_dying.mp3');
alien_dying_audio.loop = false;
alien_dying_audio.volume = 0.4;

function initAudioOnUserInteraction(): void {
  const startAudio = () => {
    bgm.play().then(() => {
      // Audio iniciado correctamente
      window.removeEventListener('keydown', startAudio);
      window.removeEventListener('click', startAudio);
    }).catch((err) => {
      console.warn('El reproductor fue bloqueado:', err);
    });
  };

  window.addEventListener('keydown', startAudio);
  window.addEventListener('click', startAudio);
}

// Llamar al arrancar la app
initAudioOnUserInteraction();


type FF = ReturnType<typeof createFixedFunction>;

const ROTATION_SPEED = 0.8; 
const MAX_DT = 0.1; // seconds

function getContext(canvas: HTMLCanvasElement): WebGL2RenderingContext {
  const gl = canvas.getContext('webgl2');
  if (!gl) throw new Error('WebGL2 is not available.');
  return gl;
}

function createVertexBuffer(gl: WebGL2RenderingContext, data: Float32Array): WebGLBuffer {
  const buffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
}

function createIndexBuffer(gl: WebGL2RenderingContext, data: Uint16Array): WebGLBuffer {
  const buffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
  return buffer;
}

function createVAO(gl: WebGL2RenderingContext, vertices: WebGLBuffer, indices: WebGLBuffer): WebGLVertexArrayObject {
  const vao = gl.createVertexArray()!;
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
  gl.enableVertexAttribArray(ATTRIB.POSITION);
  gl.vertexAttribPointer(ATTRIB.POSITION, 3, gl.FLOAT, false, STRIDE_BYTES, 0);
  gl.enableVertexAttribArray(ATTRIB.NORMAL);
  gl.vertexAttribPointer(ATTRIB.NORMAL, 3, gl.FLOAT, false, STRIDE_BYTES, NORMAL_OFFSET_BYTES);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
  gl.bindVertexArray(null);
  return vao;
}

function setupState(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement): void {
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(...CLEAR_COLOR);
  gl.enable(gl.DEPTH_TEST);
}

function setupScene(ff: FF): void {
  ff.enable(LIGHTING);
  ff.setGlobalAmbient([0.2, 0.2, 0.2, 1]);

  ff.setLight(0, { position: [1, 1, 0.5, 0], diffuse: [1, 1, 1, 1] });
  ff.enableLight(0);

  const view = mat4.lookAt(mat4.create(), [0, 2, 8], [0, 0, 0], [0, 1, 0]);
  ff.setViewMatrix(view);
  const projection = mat4.perspective(mat4.create(), Math.PI / 4, CANVAS_WIDTH / CANVAS_HEIGHT, 0.1, 100);
  ff.setProjectionMatrix(projection);
}

// -----------------------------------------------------------------------
// Model definition
// -----------------------------------------------------------------------

const POWER_LEVEL_ON  : readonly [number, number, number, number] = [1, 31 / 255, 31 / 255, 1];
const POWER_LEVEL_OFF : readonly [number, number, number, number] = [155 / 255, 53 / 255, 53 / 255, 1];

const root = new TreeNode('root', 'concept', {scale : [0.6,0.6,0.6], rotation : [0, 0, 0], translation : [0,-1,-2]});

const floor = root.addChild('floor', 'object', { color: [0.90, 0.90, 0.90, 1],
  dimensions: [24, 0.2, 48], rotation: [0, 0, 0], scale: [1, 1, 1], translation: [0,-0.2,0], position: [0,0,0]}, 
  "CUBE");

// --------- TANK ----

const tank = root.addChild('tank', 'concept', {scale : [1,1,1], rotation : [0, 0, 0], translation : [-5,0.355,2]});

const tank_body = tank.addChild('tank_body', 'concept', {scale : [1,1,1], rotation : [0,0,0], translation : [0,0,0]});

tank_body.addChild('tank_body_cube', 'object', { color: [0.1, 0.1, 0.1, 1],
  dimensions: [1, 0.7, 1], rotation: [0, 0, 0], scale: [1, 1, 1], translation: [0,0,0], position: [0,0,0]}, 
  "CUBE");

const tank_body_arrow_0 = tank_body.addChild('tank_body_arrow_0', 'object', { color: POWER_LEVEL_ON,
  dimensions: [0.5, 0.5, 0.5], rotation: [0, 0, 0], scale: [1, 1, 1], translation: [0,-0.20,0.55], position: [0,0,0]}, 
  "ARROW");

const tank_body_arrow_1 = tank_body.addChild('tank_body_arrow_1', 'object', { color: POWER_LEVEL_OFF,
  dimensions: [0.5, 0.5, 0.5], rotation: [0, 0, 0], scale: [1, 1, 1], translation: [0,-0.02,0.55], position: [0,0,0]}, 
  "ARROW");

const tank_body_arrow_2 = tank_body.addChild('tank_body_arrow_2', 'object', { color: POWER_LEVEL_OFF,
  dimensions: [0.5, 0.5, 0.5], rotation: [0, 0, 0], scale: [1, 1, 1], translation: [0,0.16,0.55], position: [0,0,0]}, 
  "ARROW");

tank_body.addChild('zacarias_russian_left_track', 'object', { color: [0.3, 0.3, 0.3, 1],
  dimensions: [0.2, 0.6, 0.6], rotation: [Math.PI / 2, 0, Math.PI], scale: [1, 1, 1], translation: [-0.65,-0.15,0], position: [0,0,0]}, 
  "ZACARIAS_RUSSIAN_TANK_TRACK");

tank_body.addChild('zacarias_russian_right_track', 'object', { color: [0.3, 0.3, 0.3, 1],
  dimensions: [0.2, 0.6, 0.6], rotation: [Math.PI / 2, 0, Math.PI], scale: [1, 1, 1], translation: [0.65,-0.15,0], position: [0,0,0]}, 
  "ZACARIAS_RUSSIAN_TANK_TRACK");

const tank_turret = tank.addChild('tank_turret', 'concept', {scale : [1,1,1], rotation : [- Math.PI / 4,0,0], translation : [0,0.40,0], position: [0,0,0]});

const cannon_turret = tank_turret.addChild('cannon_turret', 'object', { color: [59 / 255, 66 / 255, 33 / 255, 1],
  dimensions: [0.35, 0.35, 0.35], rotation: [0, 0, 0], scale: [1, 1, 1], translation: [0,0,0], position: [0,0,0]}, 
  "SPHERE");

const cannon = cannon_turret.addChild('cannon', 'object', { color: [59 / 255, 66 / 255, 33 / 255, 1],
  dimensions: [0.10, 1, 0.10], rotation: [0, 0, 0], scale: [1, 1, 1], translation: [0,cannon_turret.data.dimensions[1] * 2,0], position: [0,0,0]}, 
  "CYLINDER");

const cannon_ball = cannon.addChild('cannon_ball', 'object', { color : [0.15,0.15,0.15,1], 
  dimensions: [0.15, 0.15, 0.15], rotation: [0, 0, 0], scale: [1, 1, 1], translation: [0, cannon.data.dimensions[1] / 2,0], position: [0,0,0]},
  "SPHERE");

// --------- ALIEN 1 ------------

const alien1 = root.addChild('alien1', 'concept', {scale : [0.7,0.7,0.7], rotation : [0, 0, 0], translation : [0,3,-4]}, "", false);
const head_alien1 = alien1.addChild('head_alien1', 'object', { color : [0,0.8,0,1], dimensions: [0.8, 0.8, 0.8], rotation: [0, 0, 0], scale: [1, 1, 1], translation: [0,0,0], position: [0,0,0]}, "SPHERE");
alien1.addChild('left_eye_alien1', 'object', { color : [0,0,0,1], dimensions: [0.2, 0.35, 0.1], rotation: [0, 0, Math.PI / 4], scale: [1, 1, 1], translation: [-0.35,0.35,0.8], position: [0,0,0]}, "SPHERE");
alien1.addChild('right_eye_alien1', 'object', { color : [0,0,0,1], dimensions: [0.2, 0.35, 0.1], rotation: [0, 0, -Math.PI / 4], scale: [1, 1, 1], translation: [0.35,0.35,0.8], position: [0,0,0]}, "SPHERE");
alien1.addChild('mouth_alien1', 'object', { color : [0,0,0,1], dimensions: [0.2, 0.1, 0.2], rotation: [0, 0, 0], scale: [1, 1, 1], translation: [0,-0.2,0.8], position: [0,0,0]}, "SPHERE");

// --------- ALIEN 2 ----

const alien2 = root.addChild('alien2', 'concept', {scale : [0.7,0.7,0.7], rotation : [0, 0, 0], translation : [3,4,-8]}, "", false);
const head_alien2 = alien2.addChild('head_alien2', 'object', { color : [0,0.8,0,1], dimensions: [0.8, 0.8, 0.8], rotation: [0, 0, 0], scale: [1, 1, 1], translation: [0,0,0], position: [0,0,0]}, "SPHERE");
alien2.addChild('left_eye_alien2', 'object', { color : [0,0,0,1], dimensions: [0.2, 0.35, 0.1], rotation: [0, 0, Math.PI / 4], scale: [1, 1, 1], translation: [-0.35,0.35,0.8], position: [0,0,0]}, "SPHERE");
alien2.addChild('right_eye_alien2', 'object', { color : [0,0,0,1], dimensions: [0.2, 0.35, 0.1], rotation: [0, 0, -Math.PI / 4], scale: [1, 1, 1], translation: [0.35,0.35,0.8], position: [0,0,0]}, "SPHERE");
alien2.addChild('mouth_alien2', 'object', { color : [0,0,0,1], dimensions: [0.2, 0.1, 0.2], rotation: [0, 0, 0], scale: [1, 1, 1], translation: [0,-0.2,0.8], position: [0,0,0]}, "SPHERE");

// --------- ALIEN 3 ----

const alien3 = root.addChild('alien3', 'concept', {scale : [0.7,0.7,0.7], rotation : [0, 0, 0], translation : [-2,2.5,-3]}, "", false);
const head_alien3 = alien3.addChild('head_alien3', 'object', { color : [0,0.8,0,1], dimensions: [0.8, 0.8, 0.8], rotation: [0, 0, 0], scale: [1, 1, 1], translation: [0,0,0], position: [0,0,0]}, "SPHERE");
alien3.addChild('left_eye_alien3', 'object', { color : [0,0,0,1], dimensions: [0.2, 0.35, 0.1], rotation: [0, 0, Math.PI / 4], scale: [1, 1, 1], translation: [-0.35,0.35,0.8], position: [0,0,0]}, "SPHERE");
alien3.addChild('right_eye_alien3', 'object', { color : [0,0,0,1], dimensions: [0.2, 0.35, 0.1], rotation: [0, 0, -Math.PI / 4], scale: [1, 1, 1], translation: [0.35,0.35,0.8], position: [0,0,0]}, "SPHERE");
alien3.addChild('mouth_alien3', 'object', { color : [0,0,0,1], dimensions: [0.2, 0.1, 0.2], rotation: [0, 0, 0], scale: [1, 1, 1], translation: [0,-0.2,0.8], position: [0,0,0]}, "SPHERE");

// --------- RUSSIAN FLAG ----



const flag = root.addChild('flag', 'concept', {scale : [1,1,1], rotation : [0, 0, 0], translation : [-10,2.5,-12]}, "", false);
const pole = flag.addChild('pole', 'object', { color: [70 / 255, 70 / 255, 70 / 255, 1],
  dimensions: [0.15, 5, 0.15], rotation: [0, 0, 0], scale: [1, 1, 1], translation: [0,0,0], position: [0,0,0]}, 
  "CYLINDER" );
const white_stripe = flag.addChild('white_stripe', 'object', { color: [1, 1, 1, 1],
  dimensions: [2, 0.5, 0.15], rotation: [0, 0, 0], scale: [1, 1, 1], translation: [1.15,2.25,0], position: [0,0,0]}, 
  "CUBE")
const blue_stripe = flag.addChild('blue_stripe', 'object', { color: [0, 54 / 255, 167 / 255, 1],
dimensions: [2, 0.5, 0.15], rotation: [0, 0, 0], scale: [1, 1, 1], translation: [1.15,1.75,0], position: [0,0,0]}, 
"CUBE")  
const red_stripe = flag.addChild('red_stripe', 'object', { color: [214 / 255, 39 / 255, 24 / 255, 1],
  dimensions: [2, 0.5, 0.15], rotation: [0, 0, 0], scale: [1, 1, 1], translation: [1.15,1.25,0], position: [0,0,0]}, 
  "CUBE")




// ---------------------------------------------------------------------------
// Game loop.
// ---------------------------------------------------------------------------
const POWER_LEVEL_STATES = [[true, false, false], [true, true, false], [true, true, true]];
const CAMERA_ANGLES = [0, Math.PI / 4, - Math.PI / 4, Math.PI];
const G = 10;

const state = { angle: 0, colorIndex: 0, rotating: true, moving_x: false, moving_mx: false, 
                tank_x_position: 0, power_state: [true,false,false],
                rotating_cannon_y: false, rotating_cannon_my : false, rotation_angular_velocity: 0.50,
                camera_index: 0, cannon_angle: Math.PI / 4, shoot_angle: 0, proyectile_velocity: 7,
                proyectile_velocity_z: 0, proyectile_velocity_y : 0, 
                just_shot: false, proyectile_shot: false, proyectile_z: 0, proyectile_y: 0, 
                fire_power_index : 0, fire_powers : [7, 10, 15], 
                moving_camera_x: false, moving_camera_mx: false, moving_camera_y: false, moving_camera_my: false, 
              };

const keysDown = new Set<string>();
const keysLastFrame = new Set<string>();

function setupInput(): void {
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') e.preventDefault();
    keysDown.add(e.code);
  });

  window.addEventListener('keyup', (e) => {
    keysDown.delete(e.code);
  });
}

function isJustPressed(code: string): boolean {
  return keysDown.has(code) && !keysLastFrame.has(code);
}

function isHeld(code: string): boolean {
  return keysDown.has(code);
}

function processInput(): void {
  if (isJustPressed('Space') && !state.proyectile_shot) {
    state.just_shot = true;
    state.proyectile_shot = true;      

    cannon_audio.play();
  }

  if (isJustPressed('KeyM')){
    bgm.volume = (bgm.volume == 0 ) ? 0.05 : 0.0;
  }

  if (isJustPressed('Digit1')){
    state.power_state = POWER_LEVEL_STATES[0];
    state.fire_power_index = 0;
  }

  if (isJustPressed('Digit2')){
    state.power_state = POWER_LEVEL_STATES[1];
    state.fire_power_index = 1;
  }

  if (isJustPressed('Digit3')){
    state.power_state = POWER_LEVEL_STATES[2];
    state.fire_power_index = 2;
  }



  if(isJustPressed('KeyF')){
    state.fire_power_index = (state.fire_power_index + 1) % 3;
    state.power_state = POWER_LEVEL_STATES[state.fire_power_index];
  }

  if(isJustPressed('KeyC')){
    state.camera_index = (state.camera_index + 1) % 4;
    root.data.rotation[1] = CAMERA_ANGLES[state.camera_index];
  }

  const heads_concept = [alien1, alien2, alien3];

  if(isJustPressed('KeyR')){
    tank.data.translation[0] = 0; 
    tank_body.data.rotation[1] = 0;
    tank_turret.data.rotation[0] = - Math.PI / 4;

    state.proyectile_shot = false;
    state.proyectile_y = 0;
    state.proyectile_z = 0;

    tank_turret.data.rotation[0] = - Math.PI / 4;
    state.cannon_angle = Math.PI / 4;


    state.fire_power_index = 0;
    state.power_state = POWER_LEVEL_STATES[0];

    for(var i = 0; i < 3; i += 1){
      heads_concept[i].disabled = false;
    }
  }

  state.moving_x = isHeld('ArrowRight');
  state.moving_mx = isHeld('ArrowLeft');

  state.moving_camera_x = isHeld('Numpad6');
  state.moving_camera_mx = isHeld('Numpad4');

  state.moving_camera_y = isHeld('Numpad8');
  state.moving_camera_my = isHeld('Numpad2');


  state.rotating_cannon_y = isHeld('ArrowUp');
  state.rotating_cannon_my = isHeld('ArrowDown');

  keysLastFrame.clear();
  keysDown.forEach((key) => keysLastFrame.add(key));
}

function update(dt: number): void {
  if (state.rotating) state.angle += ROTATION_SPEED * dt;
  if (state.moving_x) state.tank_x_position += 1.5 * dt;
  if (state.moving_mx) state.tank_x_position -= 1.5 * dt;

  tank_body_arrow_0.data.color = (state.power_state[0] ? POWER_LEVEL_ON : POWER_LEVEL_OFF);
  tank_body_arrow_1.data.color = (state.power_state[1] ? POWER_LEVEL_ON : POWER_LEVEL_OFF);
  tank_body_arrow_2.data.color = (state.power_state[2] ? POWER_LEVEL_ON : POWER_LEVEL_OFF);

  if(state.moving_x){
    tank.data.translation[0] += 3 * dt; 
    tank_body.data.rotation[1] = -Math.PI / 100;
  }

  if(state.moving_mx){
    tank.data.translation[0] -= 3 * dt; 
    tank_body.data.rotation[1] = Math.PI / 100;
  }

  if(state.moving_camera_x){
    root.data.rotation[1] -=  (Math.PI / 11)  * dt; 
  }

  if(state.moving_camera_mx){
    root.data.rotation[1] += (Math.PI / 11) * dt; 
  }

  if(state.moving_camera_y){
    root.data.rotation[0] +=  (Math.PI / 11)  * dt; 
  }

  if(state.moving_camera_my){
    root.data.rotation[0] -= (Math.PI / 11) * dt; 
  }


  if(state.rotating_cannon_y && - Math.PI / 2 + (5 / 180) * Math.PI <= tank_turret.data.rotation[0] && tank_turret.data.rotation[0] <= 0){
    tank_turret.data.rotation[0] += state.rotation_angular_velocity * (Math.PI * dt);
    state.cannon_angle += state.rotation_angular_velocity * (Math.PI * dt);
    tank_turret.data.rotation[0] = Math.min(tank_turret.data.rotation[0], 0);
    state.cannon_angle = Math.min(state.cannon_angle, Math.PI / 2);
  }

  if(state.rotating_cannon_my && - Math.PI / 2 + (5 / 180) * Math.PI <= tank_turret.data.rotation[0] && tank_turret.data.rotation[0] <= 0){
    tank_turret.data.rotation[0] -= state.rotation_angular_velocity * (Math.PI * dt);
    state.cannon_angle -= state.rotation_angular_velocity * (Math.PI * dt);
    tank_turret.data.rotation[0] = Math.max(tank_turret.data.rotation[0], - Math.PI / 2 + (5 / 180) * Math.PI);
    state.cannon_angle = Math.max(state.cannon_angle, 0 + (5 / 180) * Math.PI);
  }

  if(state.just_shot){
    state.shoot_angle = state.cannon_angle;
    state.proyectile_velocity_y = state.fire_powers[state.fire_power_index] * Math.sin(state.shoot_angle);
    state.proyectile_velocity_z = -state.fire_powers[state.fire_power_index] * Math.cos(state.shoot_angle);
  }

  if(!state.just_shot && state.proyectile_shot){
    state.proyectile_velocity_y -= G * dt;

    state.proyectile_z += state.proyectile_velocity_z * dt;
    state.proyectile_y += state.proyectile_velocity_y * dt;

    if(cannon_ball.data.position[1] - cannon_ball.data.dimensions[0] < 0){
      state.proyectile_shot = false;
      state.proyectile_y = 0;
      state.proyectile_z = 0;
    }

    const heads_array = [head_alien1, head_alien2, head_alien3];
    const heads_concept = [alien1, alien2, alien3];
    for(var i = 0; i < 3; i += 1){
      const left_term = (cannon_ball.data.position[0] - heads_array[i].data.position[0])**2 + 
      (cannon_ball.data.position[1] - heads_array[i].data.position[1])**2 + 
      (cannon_ball.data.position[2] - heads_array[i].data.position[2])**2;

      const right_term = (cannon_ball.data.dimensions[0] + 
        heads_array[i].data.dimensions[0] * heads_array[i].data.scale[0]) ** 2;
      
      if(left_term < right_term){
        heads_concept[i].disabled = true;
        state.proyectile_shot = false;
        state.proyectile_y = 0;
        state.proyectile_z = 0;
        alien_dying_audio.play();
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Renderizado de Trayectoria
// ---------------------------------------------------------------------------
const trajectoryModel = mat4.create();
const pointTranslation = mat4.create();
const dotScaling = mat4.create();
mat4.fromScaling(dotScaling, [0.25, 0.25, 0.25]); 

function renderTrajectoryPreview(
  gl: WebGL2RenderingContext,
  ff: FF,
  sphereVao: WebGLVertexArrayObject,
  baseLaunchModel: mat4,
  rootData: { scale: number[]; rotation: number[]; translation: number[] }
): void {
  const v0 = state.fire_powers[state.fire_power_index];
  const angle = state.cannon_angle;
  
  const vy0 = v0 * Math.sin(angle);
  const vz0 = -v0 * Math.cos(angle);
  
  const h = Math.max(0, cannon_ball.data.position[1]);

  const discriminant = (vy0 ** 2) + (2 * G * h);
  const totalTime = (vy0 + Math.sqrt(discriminant)) / G;


  // const totalTime = (2 * vy0) / G;
  const steps = 20; 
  const dtStep = totalTime / steps;

  const dotColor: readonly [number, number, number, number] = [1, 0.1, 0.1, 1];
  ff.setMaterial({ ambient: dotColor, diffuse: dotColor });
  gl.bindVertexArray(sphereVao);

  for (let i = 1; i <= steps; i++) {
    const t = i * dtStep;
    
    const relY = (vy0 * t) - (0.5 * G * (t ** 2));
    const relZ = vz0 * t;

    // Desplazamiento parabólico sobre la matriz base del cañón
    mat4.fromTranslation(pointTranslation, [0, relY, relZ]);
    mat4.multiply(trajectoryModel, pointTranslation, baseLaunchModel);
    
    // Escala pequeña para los puntos
    mat4.multiply(trajectoryModel, trajectoryModel, dotScaling);

    // root
    mat4.fromScaling(parent_scaling, [rootData.scale[0], rootData.scale[1], rootData.scale[2]]);
    mat4.multiply(trajectoryModel, parent_scaling, trajectoryModel);
  
    mat4.fromXRotation(rotationX, rootData.rotation[0]);
    mat4.fromYRotation(rotationY, rootData.rotation[1]);
    mat4.fromZRotation(rotationZ, rootData.rotation[2]);
    mat4.multiply(rotation, rotationY, rotationX);
    mat4.multiply(rotation, rotationZ, rotation);
    mat4.multiply(trajectoryModel, rotation, trajectoryModel);

    mat4.fromTranslation(translation, [rootData.translation[0], rootData.translation[1], rootData.translation[2]]);
    mat4.multiply(trajectoryModel, translation, trajectoryModel);

    // Dibujar esfera
    ff.setModelMatrix(trajectoryModel);
    ff.setNormalMatrix(mat3.normalFromMat4(normalMatrix, trajectoryModel));
    ff.drawElements(gl.TRIANGLES, SPHERE_INDICES.length, gl.UNSIGNED_SHORT, 0);
  }
}

// ---------------------------------------------------------------------------
// Loop Phase 3: Render
// ---------------------------------------------------------------------------
const model = mat4.create();
const normalMatrix = mat3.create();

const rotation = mat4.create();
const rotationX = mat4.create();
const rotationY = mat4.create();
const rotationZ = mat4.create();

const scaling = mat4.create();
const parent_scaling = mat4.create();
const translation = mat4.create();

var proyectile_model = mat4.create();

function render(gl: WebGL2RenderingContext, ff: FF, 
  cubeVao: WebGLVertexArrayObject, vao: WebGLVertexArrayObject,
  cylinderVao : WebGLVertexArrayObject, 
  arrowVao: WebGLVertexArrayObject, 
  zacariasTrackVAO: WebGLVertexArrayObject): void {
  
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  var stack_scale : number[][] = [];
  var stack_rotation : number[][] = [];
  var stack_translation : number[][] = [];

  root.traverse((node : TreeNode, depth: number, stack_scale: number[][], stack_rotation: number[][], stack_translation: number[][]) => {

    const data = node.data;

    if(node.type == "object"){

      mat4.fromScaling(scaling, [data.dimensions[0], data.dimensions[1], data.dimensions[2]]);

      // Local rotation
      mat4.fromXRotation(rotationX, data.rotation[0]);
      mat4.fromYRotation(rotationY, data.rotation[1]);
      mat4.fromZRotation(rotationZ, data.rotation[2]);
      mat4.multiply(rotation, rotationY, rotationX);
      mat4.multiply(rotation, rotationZ, rotation);
      mat4.multiply(model, rotation, scaling);

      // Local translation
      mat4.fromTranslation(translation, [data.translation[0], data.translation[1], data.translation[2]]);
      mat4.multiply(model, translation, model);

      const transformations_number = stack_scale.length;
      for (let i = transformations_number - 1; i >= 0; i--) {
        
        // Parent scaling
        mat4.fromScaling(parent_scaling, [stack_scale[i][0], stack_scale[i][1], stack_scale[i][2]]);
        mat4.multiply(model, parent_scaling, model);

        // Parent rotation
        mat4.fromXRotation(rotationX, stack_rotation[i][0]);
        mat4.fromYRotation(rotationY, stack_rotation[i][1]);
        mat4.fromZRotation(rotationZ, stack_rotation[i][2]);
        mat4.multiply(rotation, rotationY, rotationX);
        mat4.multiply(rotation, rotationZ, rotation);
        mat4.multiply(model, rotation, model);

        // Parent translation
        mat4.fromTranslation(translation, [stack_translation[i][0], stack_translation[i][1], stack_translation[i][2]]);
        mat4.multiply(model, translation, model);

        if(i == 1){
          const origin_to_position = vec3.fromValues(0, 0, 0);

          vec3.transformMat4(origin_to_position, origin_to_position, model);

          node.data.position[0] = origin_to_position[0];
          node.data.position[1] = origin_to_position[1];
          node.data.position[2] = origin_to_position[2];

          if(node.id === "cannon_ball" && (!state.proyectile_shot || state.just_shot)){
            proyectile_model = mat4.clone(model);
          }
        }
      }

      // Dibujar vista previa de trayectoria si la pelota no ha sido lanzada
      if (node.id === "cannon_ball" && !state.proyectile_shot) {
        renderTrajectoryPreview(gl, ff, vao, proyectile_model, root.data);
      }

      // Se lanza la pelota
      if(node.id == "cannon_ball" && state.just_shot){
        state.just_shot = false;

      } else if(node.id == "cannon_ball" && state.proyectile_shot){

        mat4.fromTranslation(translation, [0, state.proyectile_y, state.proyectile_z]);
        mat4.multiply(model, translation, proyectile_model);

        const origin_to_position = vec3.fromValues(0, 0, 0);

        vec3.transformMat4(origin_to_position, origin_to_position, model);
        node.data.position[0] = origin_to_position[0];
        node.data.position[1] = origin_to_position[1];
        node.data.position[2] = origin_to_position[2];

        mat4.fromScaling(parent_scaling, [stack_scale[0][0], stack_scale[0][1], stack_scale[0][2]]);
        mat4.multiply(model, parent_scaling, model);

        // Parent rotation
        mat4.fromXRotation(rotationX, stack_rotation[0][0]);
        mat4.fromYRotation(rotationY, stack_rotation[0][1]);
        mat4.fromZRotation(rotationZ, stack_rotation[0][2]);
        mat4.multiply(rotation, rotationY, rotationX);
        mat4.multiply(rotation, rotationZ, rotation);
        mat4.multiply(model, rotation, model);

        // Parent translation
        mat4.fromTranslation(translation, [stack_translation[0][0], stack_translation[0][1], stack_translation[0][2]]);
        mat4.multiply(model, translation, model);
      }

      ff.setModelMatrix(model);
      ff.setNormalMatrix(mat3.normalFromMat4(normalMatrix, model));

      ff.setMaterial({ ambient: data.color, diffuse: data.color });

      var currentVao = vao;
      var currentIndices = SPHERE_INDICES;

      switch(node.figure){
        case "SPHERE":
          currentVao = vao;
          currentIndices = SPHERE_INDICES;
          break;
        case "CYLINDER":
          currentVao = cylinderVao;
          currentIndices = CYLINDER_INDICES;
          break;
        case "CUBE":
          currentVao = cubeVao;
          currentIndices = CUBE_INDICES;
          break;
        case "ARROW":
          currentVao = arrowVao;
          currentIndices = ARROW_INDICES;
          break;
        case "ZACARIAS_RUSSIAN_TANK_TRACK":
          currentVao = zacariasTrackVAO;
          currentIndices = ZACARIAS_RUSSIAN_TANK_TRACK_INDICES;
          break;
      }

      gl.bindVertexArray(currentVao);
      ff.drawElements(gl.TRIANGLES, currentIndices.length, gl.UNSIGNED_SHORT, 0);
    }

    stack_scale.push(data.scale);
    stack_rotation.push(data.rotation);
    stack_translation.push(data.translation);

  }, 0, stack_scale, stack_rotation, stack_translation);
}

function run(canvas: HTMLCanvasElement): void {
  const gl = getContext(canvas);
  const ff = createFixedFunction(gl, { debug: true });

  const cube_vertices = createVertexBuffer(gl, CUBE_VERTICES);
  const cube_indices = createIndexBuffer(gl, CUBE_INDICES);
  const cube_vao = createVAO(gl, cube_vertices, cube_indices);

  const vertices = createVertexBuffer(gl, SPHERE_VERTICES);
  const indices = createIndexBuffer(gl, SPHERE_INDICES);
  const vao = createVAO(gl, vertices, indices);

  const cylinder_vertices = createVertexBuffer(gl, CYLINDER_VERTICES);
  const cylinder_indices = createIndexBuffer(gl, CYLINDER_INDICES);
  const cylinder_vao = createVAO(gl, cylinder_vertices, cylinder_indices);

  const arrow_vertices = createVertexBuffer(gl, ARROW_VERTICES);
  const arrow_indices = createIndexBuffer(gl, ARROW_INDICES);
  const arrow_vao = createVAO(gl, arrow_vertices, arrow_indices);

  const zacarias_track_vertices = createVertexBuffer(gl, ZACARIAS_RUSSIAN_TANK_TRACK_VERTICES); 
  const zacarias_track_indices = createIndexBuffer(gl, ZACARIAS_RUSSIAN_TANK_TRACK_INDICES); 
  const zacarias_track_vao = createVAO(gl, zacarias_track_vertices, zacarias_track_indices);

  setupState(gl, canvas);
  setupScene(ff);
  setupInput();

  state.colorIndex = 2;
  let last: number | null = null;
  function frame(now: number): void {
    if (last === null) last = now;
    const dt = Math.min((now - last) / 1000, MAX_DT);
    last = now;
    processInput();
    update(dt);
    render(gl, ff, cube_vao, vao, cylinder_vao, arrow_vao, zacarias_track_vao);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

const canvas = document.createElement('canvas');
document.getElementById('stage')!.append(canvas);
run(canvas);