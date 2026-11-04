// Scene constants: geometry, colors and canvas settings. main.ts holds the WebGL code and the game loop.

/** Background color #161919 as linear floats in [0, 1]. */
export const CLEAR_COLOR: readonly [number, number, number, number] = [0x16 / 255, 0x19 / 255, 0x19 / 255, 1];

/** Drawing buffer size in pixels, 4:3. CSS scales the canvas to fit the window; the buffer stays fixed. */
export const CANVAS_WIDTH = 1024;
export const CANVAS_HEIGHT = 768;

/** Cube colors, RGBA. Space cycles through them in this order. */
export const COLORS: readonly (readonly [number, number, number, number])[] = [
  [0, 1, 1, 1], // cyan
  [1, 0, 1, 1], // magenta
  [1, 1, 0, 1], // yellow
];

// 24 vertices (4 per face), not 8 corners. A corner is shared by 3 faces, but a vertex holds
// only one normal. Each face needs its own normal for flat lighting, so each face gets its own 4 vertices.
/** Interleaved vertex data: x, y, z, nx, ny, nz per vertex. Half-size 0.5, counter-clockwise seen from outside. */
export const CUBE_VERTICES = new Float32Array([
  //   x      y      z    nx  ny  nz
  // +Z face (front)
  -0.5, -0.5,  0.5,   0,  0,  1, // bottom left
   0.5, -0.5,  0.5,   0,  0,  1, // bottom right
   0.5,  0.5,  0.5,   0,  0,  1, // top right
  -0.5,  0.5,  0.5,   0,  0,  1, // top left
  // -Z face (back)
   0.5, -0.5, -0.5,   0,  0, -1,
  -0.5, -0.5, -0.5,   0,  0, -1,
  -0.5,  0.5, -0.5,   0,  0, -1,
   0.5,  0.5, -0.5,   0,  0, -1,
  // +X face (right)
   0.5, -0.5,  0.5,   1,  0,  0,
   0.5, -0.5, -0.5,   1,  0,  0,
   0.5,  0.5, -0.5,   1,  0,  0,
   0.5,  0.5,  0.5,   1,  0,  0,
  // -X face (left)
  -0.5, -0.5, -0.5,  -1,  0,  0,
  -0.5, -0.5,  0.5,  -1,  0,  0,
  -0.5,  0.5,  0.5,  -1,  0,  0,
  -0.5,  0.5, -0.5,  -1,  0,  0,
  // +Y face (top)
  -0.5,  0.5,  0.5,   0,  1,  0,
   0.5,  0.5,  0.5,   0,  1,  0,
   0.5,  0.5, -0.5,   0,  1,  0,
  -0.5,  0.5, -0.5,   0,  1,  0,
  // -Y face (bottom)
  -0.5, -0.5, -0.5,   0, -1,  0,
   0.5, -0.5, -0.5,   0, -1,  0,
   0.5, -0.5,  0.5,   0, -1,  0,
  -0.5, -0.5,  0.5,   0, -1,  0,
]);

/** Two triangles per face, 36 indices. Each face: (0, 1, 2) and (0, 2, 3), both counter-clockwise. */
export const CUBE_INDICES = new Uint16Array([
   0,  1,  2,   0,  2,  3, // +Z
   4,  5,  6,   4,  6,  7, // -Z
   8,  9, 10,   8, 10, 11, // +X
  12, 13, 14,  12, 14, 15, // -X
  16, 17, 18,  16, 18, 19, // +Y
  20, 21, 22,  20, 22, 23, // -Y
]);

export const STRIDE_BYTES = 6 * 4; // 4 bytes per float (Float32)
export const NORMAL_OFFSET_BYTES = 3 * 4;



export function generateSphere(
  radius: number = 1, 
  sectorCount: number = 36, 
  stackCount: number = 18): { vertices : Float32Array; indexes : Uint16Array} {
  const vertices : number[] = [];
  const indexes : number[] = [];

  const sectorStep = (2 * Math.PI) / sectorCount;
  const stackStep = Math.PI / stackCount;

  for (let i = 0; i <= stackCount; ++i) {

    const phi = Math.PI / 2 - i * stackStep;
    const xy = radius * Math.cos(phi);
    const z = radius * Math.sin(phi);

    const nz = Math.sin(phi);
    const nxy = Math.cos(phi);

    for (let j = 0; j <= sectorCount; ++j) {

      const theta = j * sectorStep;

      const x = xy * Math.cos(theta);
      const y = xy * Math.sin(theta);

      const nx = nxy * Math.cos(theta);
      const ny = nxy * Math.sin(theta);

      vertices.push(x, y, z, nx, ny, nz);

    }

  }

  for (let i = 0; i < stackCount; ++i) {
    let k1 = i * (sectorCount + 1);
    let k2 = k1 + sectorCount + 1;

    for (let j = 0; j < sectorCount; ++j, ++k1, ++k2) {
      // Triángulo superior del quad (se omite en el polo superior para evitar bugs)
      if (i !== 0) {
        indexes.push(k1, k2, k1 + 1);
      }

      // Triángulo inferior del quad (se omite en el polo inferior)
      if (i !== stackCount - 1) {
        indexes.push(k1 + 1, k2, k2 + 1);
      }
    }
  }


  return {
    vertices: new Float32Array(vertices),
    indexes: new Uint16Array(indexes),
  };
}

const sphere = generateSphere(1, 36, 18);
export const SPHERE_VERTICES = sphere.vertices;
export const SPHERE_INDICES = sphere.indexes;













export function generateCylinder(
  radius: number = 1,
  height: number = 1.0,
  sectorCount: number = 36,
  stackCount: number = 1
): { vertices: Float32Array; indices: Uint16Array } {
  const vertices: number[] = [];
  const indices: number[] = [];

  const sectorStep = (2 * Math.PI) / sectorCount;
  const stackStep = height / stackCount;
  const halfH = height / 2;

  
  // PARED LATERAL (Vértices + Normales laterales)
  for (let i = 0; i <= stackCount; ++i) {
    const y = halfH - i * stackStep;

    for (let j = 0; j <= sectorCount; ++j) {
      const theta = j * sectorStep;

      const x = radius * Math.cos(theta);
      const z = radius * Math.sin(theta);

      // Normal apuntando hacia afuera en el plano XZ
      const nx = Math.cos(theta);
      const ny = 0;
      const nz = Math.sin(theta);

      vertices.push(x, y, z, nx, ny, nz);
    }
  }

  for (let i = 0; i < stackCount; ++i) {
    let k1 = i * (sectorCount + 1);
    let k2 = k1 + sectorCount + 1;

    for (let j = 0; j < sectorCount; ++j, ++k1, ++k2) {
      indices.push(k1, k2, k1 + 1);
      indices.push(k1 + 1, k2, k2 + 1);
    }
  }

  const topCenterIndex = vertices.length / 6;
  vertices.push(0, halfH, 0, 0, 1, 0);

  for (let j = 0; j <= sectorCount; ++j) {
    const theta = j * sectorStep;
    vertices.push(radius * Math.cos(theta), halfH, radius * Math.sin(theta), 0, 1, 0);
  }

  for (let j = 0; j < sectorCount; ++j) {
    const current = topCenterIndex + 1 + j;
    const next = current + 1;
    indices.push(topCenterIndex, current, next);
  }

  // TAPA INFERIOR
  const bottomCenterIndex = vertices.length / 6;
  vertices.push(0, -halfH, 0, 0, -1, 0);

  for (let j = 0; j <= sectorCount; ++j) {
    const theta = j * sectorStep;
    vertices.push(radius * Math.cos(theta), -halfH, radius * Math.sin(theta), 0, -1, 0);
  }

  for (let j = 0; j < sectorCount; ++j) {
    const current = bottomCenterIndex + 1 + j;
    const next = current + 1;
    indices.push(bottomCenterIndex, next, current);
  }

  return {
    vertices: new Float32Array(vertices),
    indices: new Uint16Array(indices),
  };
}

// Exportación lista para usar
const cylinder = generateCylinder(1, 1, 36, 1);
export const CYLINDER_VERTICES = cylinder.vertices;
export const CYLINDER_INDICES = cylinder.indices;






const ARROW_X = 0.2;
const ARROW_TOP_Y = 0.25;
const ARROW_BOTTOM_Y = 0.08;
const ARROW_Z = 0.04;

export const ARROW_VERTICES = new Float32Array([
  //   x      y      z    nx  ny  nz
    0,    0,   ARROW_Z,                   0,  0,  1,  // center - front
    0,  ARROW_TOP_Y,   ARROW_Z,           0,  0,  1,  // top - front
  -ARROW_X, -ARROW_BOTTOM_Y,  ARROW_Z,    0,  0,  1,  // bottom-left - front
   ARROW_X, -ARROW_BOTTOM_Y,  ARROW_Z,    0,  0,  1,  // bottom-right - front

    0,    0,   -ARROW_Z,                  0,  0, -1, // center - back
    0,  ARROW_TOP_Y,   -ARROW_Z,          0,  0, -1, // top - back
  -ARROW_X, -ARROW_BOTTOM_Y,  -ARROW_Z,   0,  0, -1, // bottom-left - back
   ARROW_X, -ARROW_BOTTOM_Y,  -ARROW_Z,   0,  0, -1, // bottom-right - back

    0, ARROW_TOP_Y,   ARROW_Z,            (ARROW_BOTTOM_Y - ARROW_TOP_Y) * (2 * ARROW_Z),   2 * ARROW_X * ARROW_Z,  0,  // top - front
  -ARROW_X, -ARROW_BOTTOM_Y,  ARROW_Z,    (ARROW_BOTTOM_Y - ARROW_TOP_Y) * (2 * ARROW_Z),   2 * ARROW_X * ARROW_Z,  0,  // bottom-left - front
    0,  ARROW_TOP_Y,   -ARROW_Z,          (ARROW_BOTTOM_Y - ARROW_TOP_Y) * (2 * ARROW_Z),   2 * ARROW_X * ARROW_Z,  0, // top - back
  -ARROW_X, -ARROW_BOTTOM_Y,  -ARROW_Z,   (ARROW_BOTTOM_Y - ARROW_TOP_Y) * (2 * ARROW_Z),   2 * ARROW_X * ARROW_Z,  0, // bottom-left - back

    0,  ARROW_TOP_Y,   ARROW_Z,           (ARROW_BOTTOM_Y - ARROW_TOP_Y) * (-2 * ARROW_Z),  2 * ARROW_X * ARROW_Z,  0,  // top - front
   ARROW_X, -ARROW_BOTTOM_Y,  ARROW_Z,    (ARROW_BOTTOM_Y - ARROW_TOP_Y) * (-2 * ARROW_Z),  2 * ARROW_X * ARROW_Z,  0,  // bottom-right - front
    0,  ARROW_TOP_Y,   -ARROW_Z,          (ARROW_BOTTOM_Y - ARROW_TOP_Y) * (-2 * ARROW_Z),  2 * ARROW_X * ARROW_Z,  0, // top - back
   ARROW_X, -ARROW_BOTTOM_Y,  -ARROW_Z,   (ARROW_BOTTOM_Y - ARROW_TOP_Y) * (-2 * ARROW_Z),  2 * ARROW_X * ARROW_Z,  0, // bottom-right - back

   0,    0,   ARROW_Z,                    -2 * ARROW_X * ARROW_BOTTOM_Y,  -2 * ARROW_Z * ARROW_X,  0,  // center - front
   0,    0,   -ARROW_Z,                   -2 * ARROW_X * ARROW_BOTTOM_Y,  -2 * ARROW_Z * ARROW_X,  0, // center - back
   ARROW_X, -ARROW_BOTTOM_Y,  ARROW_Z,    -2 * ARROW_X * ARROW_BOTTOM_Y,  -2 * ARROW_Z * ARROW_X,  0,  // bottom-right - front
   ARROW_X, -ARROW_BOTTOM_Y,  -ARROW_Z,   -2 * ARROW_X * ARROW_BOTTOM_Y,  -2 * ARROW_Z * ARROW_X,  0, // bottom-right - back

   0,    0,   ARROW_Z,                    2 * ARROW_X * ARROW_BOTTOM_Y,  -2 * ARROW_Z * ARROW_X,  0,  // center - front
   0,    0,   -ARROW_Z,                   2 * ARROW_X * ARROW_BOTTOM_Y,  -2 * ARROW_Z * ARROW_X,  0, // center - back
   -ARROW_X, -ARROW_BOTTOM_Y,  ARROW_Z,   2 * ARROW_X * ARROW_BOTTOM_Y,  -2 * ARROW_Z * ARROW_X,  0,  // bottom-left - front
   -ARROW_X, -ARROW_BOTTOM_Y,  -ARROW_Z,  2 * ARROW_X * ARROW_BOTTOM_Y,  -2 * ARROW_Z * ARROW_X,  0, // bottom-left - back

]);





/** Two triangles per face, 36 indices. Each face: (0, 1, 2) and (0, 2, 3), both counter-clockwise. */
export const ARROW_INDICES = new Uint16Array([
   0,  1,  2,   0,  1,  3,
   4,  5,  6,   4,  5,  7,
   8,  9, 11,   10, 11, 8,
   12, 13, 15,  14, 15, 12,
   16, 17, 18,  17, 18, 19,
   20, 21, 22,  21, 22, 23
]);



export const ZACARIAS_RUSSIAN_TANK_TRACK_VERTICES = new Float32Array([

  1, -1.25, 0.25, 1,  0,  0,       // 0
  1, -1, 0.35, 1,  0,  0,        
  1, 1, 0.60, 1,  0,  0,       
  1, 1.30, 0.50, 1,  0,  0,  
  1, 1.50, 0.40, 1,  0,  0,  
  1, 1.50, 0, 1,  0,  0,  
  1, 1.29, -0.20, 1,  0,  0,  
  1, 0.80, -0.50, 1,  0,  0,  
  1, -1, -0.5, 1,  0,  0,  
  1, -1.30, -0.3, 1,  0,  0,  
  1, -1.5, 0, 1,  0,  0,              // 10


  1, -1.16, 0.13, 1,  0,  0,  
  1, -0.93, 0.21, 1,  0,  0,  
  1, 0.94, 0.45, 1,  0,  0,  
  1, 1.20, 0.37, 1,  0,  0,  
  1, 1.33, 0.31, 1,  0,  0,  
  1, 1.32, 0.03, 1,  0,  0,  
  1, 1.17, -0.10, 1,  0,  0,  
  1, 0.73, -0.36, 1,  0,  0,  
  1, -0.93, -0.36, 1,  0,  0,  
  1, -1.2, -0.2, 1,  0,  0,  
  1, -1.31, 0, 1,  0,  0,  




  -1, -1.25, 0.25, -1,  0,  0,         // 0
  -1, -1, 0.35, -1,  0,  0,      
  -1, 1, 0.60, -1,  0,  0,      
  -1, 1.30, 0.50, -1,  0,  0,
  -1, 1.50, 0.40, -1,  0,  0,
  -1, 1.50, 0, -1,  0,  0,
  -1, 1.29, -0.20, -1,  0,  0,
  -1, 0.80, -0.50, -1,  0,  0,
  -1, -1, -0.5, -1,  0,  0,
  -1, -1.30, -0.3, -1,  0,  0,
  -1, -1.5, 0, -1,  0,  0,            // 10


  -1, -1.16, 0.13,-1,  0,  0,
  -1, -0.93, 0.21, -1,  0,  0,
  -1, 0.94, 0.45, -1,  0,  0,
  -1, 1.20, 0.37, -1,  0,  0,
  -1, 1.33, 0.31, -1,  0,  0,
  -1, 1.32, 0.03, -1,  0,  0,
  -1, 1.17, -0.10, -1,  0,  0,
  -1, 0.73, -0.36, -1,  0,  0,
  -1, -0.93, -0.36, -1,  0,  0,
  -1, -1.2, -0.2, -1,  0,  0,
  -1, -1.31, 0, -1,  0,  0,


  // --------- Tapas ---------

  1, -1.25, 0.25, 0,  -1,  1,      
  1, -1, 0.35, 0,  -1,  1,        
  -1, -1.25, 0.25, 0,  -1,  1,        
  -1, -1, 0.35, 0,  -1,  1,      

  1, -1, 0.35, 0,  0,  1,        
  1, 1, 0.60, 0,  0,  1,
  -1, -1, 0.35, 0,  0,  1,      
  -1, 1, 0.60, 0,  0,  1,

  1, 1, 0.60, 0,  1,  1,       
  1, 1.30, 0.50, 1,  1,  1,
  -1, 1, 0.60, 0,  1,  1,      
  -1, 1.30, 0.50, 0,  1,  1,

  1, 1.30, 0.50, 0,  1,  1,    
  1, 1.50, 0.40, 0,  1,  1,    
  -1, 1.30, 0.50, 0,  1,  1,    
  -1, 1.50, 0.40, 0,  1,  1,    

  1, 1.50, 0.40, 0,  1,  0,  
  1, 1.50, 0, 0,  1,  0,  
  -1, 1.50, 0.40, 0,  1,  0,
  -1, 1.50, 0, 0,  1,  0,

  1, 1.50, 0, -1,  1,  0,  
  1, 1.29, -0.20, -1,  1,  0, 
  -1, 1.50, 0, -1,  1,  0,
  -1, 1.29, -0.20, -1,  1,  0,

  1, 1.29, -0.20, -1,  0,  0,  
  1, 0.80, -0.50, -1,  0,  0,
  -1, 1.29, -0.20, -1,  0,  0,
  -1, 0.80, -0.50, -1,  0,  0,

  1, 0.80, -0.50, -1,  0,  0,  
  1, -1, -0.5, -1,  0,  0,
  -1, 0.80, -0.50, -1,  0,  0,
  -1, -1, -0.5, -1,  0,  0,

  1, -1, -0.5, 1,  0,  0,  
  1, -1.30, -0.3, 1,  0,  0,
  -1, -1, -0.5, -1,  0,  0,
  -1, -1.30, -0.3, -1,  0,  0,

  1, -1.30, -0.3, 1,  0,  0,  
  1, -1.5, 0, 1,  0,  0,
  -1, -1.30, -0.3, -1,  0,  0,
  -1, -1.5, 0, -1,  0,  0,

  1, -1.5, 0, 1,  0,  0,
  1, -1.25, 0.25, 1,  0,  0,
  -1, -1.5, 0, -1,  0,  0,
  -1, -1.25, 0.25, -1,  0,  0,


]);


export const ZACARIAS_RUSSIAN_TANK_TRACK_INDICES = new Uint16Array([

  // Lateral

  0, 11,  12,   0,  1,  12,
  1, 12, 13,  1, 2, 13,
  2, 13, 14,  2, 3, 14,
  3, 14, 15,  3, 4, 15,
  4, 15, 16,  4, 5, 16,
  5, 16, 17,  5, 6, 17,
  6, 17, 18,  6, 7, 18,
  7, 18, 19,  7, 8, 19,
  8, 19, 20,  8, 9, 20,
  9, 20, 21,  9, 10, 21,
  10, 21, 11,  10, 11, 0,

  // Lateral 
  22, 33, 34,  22, 23, 34,
  23, 34, 35,  23, 24, 35,
  24, 35, 36,  24, 25, 36,
  25, 36, 37,  25, 26, 37,
  26, 37, 38,  26, 27, 38,
  27, 38, 39,  27, 28, 39,
  28, 39, 40,  28, 29, 40,
  29, 40, 41,  29, 30, 41,
  30, 41, 42,  30, 31, 42,
  31, 42, 43,  31, 32, 43,
  32, 43, 33,  32, 33, 22,

  // Tapa
  44, 45, 46,  45, 46, 47,
  48, 49, 50,  49, 50, 51,
  52, 53, 54,  53, 54, 55,
  56, 57, 58,  57, 58, 59,
  60, 61, 62,  61, 62, 63,
  64, 65, 66,  65, 66, 67,
  68, 69, 70,  69, 70, 71,
  72, 73, 74,  73, 74, 75,
  76, 77, 78,  77, 78, 79,
  80, 81, 82,  81, 82, 83,
  84, 85, 86,  85, 86, 87,

  

]);
