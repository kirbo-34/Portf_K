import * as THREE from 'https://cdn.skypack.dev/three@0.152.2';

let camera, scene, renderer, material, mesh;
let startTime = Date.now();
let mouse = { x: 0.5, y: 0.5 };
let resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
const renderScale = 0.7; // <== Reduz resolução real de renderização

// Vertex shader
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Fragment shader otimizado
const fragmentShader = `

#define PI 3.14159
#define TAU PI*2.
#define t iTime
#define STEPS 20. // <== Menos passos para mais performance
#define BIAS 0.001
#define DIST_MIN 0.01

uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;

varying vec2 vUv;

mat2 rot (float a) { float c=cos(a),s=sin(a);return mat2(c,-s,s,c); }

float sdSphere (vec3 p, float r) { return length(p)-r; }
float sdCylinder (vec2 p, float r) { return length(p)-r; }
float sdTorus( vec3 p, vec2 s ) {
  vec2 q = vec2(length(p.xz)-s.x,p.y);
  return length(q)-s.y;
}
float sdBox( vec3 p, vec3 b ) {
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}
float smin (float a, float b, float r) {
    float h = clamp(.5+.5*(b-a)/r,0.,1.);
    return mix(b,a,h)-r*h*(1.-h);
}
float rand(vec2 co) { return fract(sin(dot(co*0.123,vec2(12.9898,78.233))) * 43758.5453); }

vec3 moda (vec2 p, float count) {
    float an = TAU / count;
    float a = atan(p.y, p.x);
    float c = floor((a + an / 2.0) / an);
    a = fract(a / an) * an - an / 2.0;
    return vec3(vec2(cos(a), sin(a)) * length(p), c);
}
float getLocalWave (float x) { return sin(-t + x * 3.); }
float getWorldWave (float x) { return 1. - 0.1 * getLocalWave(x); }

vec3 camera(vec3 p) {
    p.yz *= rot((PI * (iMouse.y / iResolution.y - 0.5)));
    p.xz *= rot((PI * (iMouse.x / iResolution.x - 0.5)));
    return p;
}

vec3 posChain(vec3 p, float count) {
    float za = atan(p.z, p.x);
    vec3 dir = normalize(p);
    vec3 m = moda(p.xz, count);
    p.xz = m.xy;
    float lw = getLocalWave(m.z / PI);
    p.x -= 1. - 0.1 * lw;
    p.z *= 1. - clamp(0.03 / abs(p.z), 0., 1.);
    float r1 = lw * smoothstep(0.1, 0.5, lw);
    float r2 = lw * smoothstep(0.4, 0.6, lw);
    p += dir * mix(0., 0.3 * sin(floor(za * 3.)), r1);
    p += dir * mix(0., 0.8 * sin(floor(za * 60.)), r2);
    float a = lw * 0.3;
    p.xy *= rot(a);
    p.xz *= rot(a);
    return p;
}

float mapSpell(vec3 p) {
    float a = atan(p.z, p.x);
    float l = length(p);
    float lw = getLocalWave(a);
    p.z = l - 1. + 0.1 * lw;
    p.yz *= rot(t + a * 2.);
    float scene = sdBox(p, vec3(10., vec2(0.25 - 0.1 * lw)));
    scene = max(scene, -sdCylinder(p.zy, 0.3 - 0.2 * lw));
    return scene;
}

float mapChain(vec3 p) {
    float count = 21.;
    vec2 size = vec2(0.1, 0.02);
    float torus = sdTorus(posChain(p, count).yxz, size);
    float scene = smin(1., torus, 0.1);
    p.xz *= rot(PI / count);
    scene = min(scene, sdTorus(posChain(p, count).xyz, size));
    return scene;
}

vec3 posCore(vec3 p, float count) {
    vec3 m = moda(p.xz, count);
    p.xz = m.xy;
    float c = 0.2;
    p.x = mod(p.x, c) - c / 2.;
    return p;
}

float mapCore(vec3 p) {
    float count = 10.;
    p.xz *= rot(p.y * 6.);
    p.xz *= rot(t);
    p.xy *= rot(t * 0.5);
    p.yz *= rot(t * 1.5);
    vec3 p1 = posCore(p, count);
    float scene = sdTorus(p1.xzy * 1.5, vec2(0.1, 0.2));
    scene = max(-scene, sdSphere(p, 0.6));
    return scene;
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution.xy) / iResolution.y;
    vec3 eye = camera(vec3(uv, -1.5));
    vec3 ray = camera(normalize(vec3(uv, 1.)));
    vec3 pos = eye;

    vec2 seed = gl_FragCoord.xy / iResolution.xy + fract(iTime);
    float shade = 0.;

    for (float i = 0.; i < STEPS; ++i) {
        float distSpell = min(mapSpell(pos), mapCore(pos));
        float distChain = mapChain(pos);
        float dist = min(distSpell, distChain);

        if (dist < BIAS) {
            shade += 1.;
            if (distChain < distSpell) {
                shade = STEPS - i - 1.;
                break;
            }
        }

        dist = abs(dist) * (0.8 + 0.2 * rand(seed * vec2(i)));
        dist = max(DIST_MIN, dist);
        pos += ray * dist;
    }

    gl_FragColor = vec4(vec3(shade / (STEPS - 1.)), 1.0);
}
`;

function init() {
  scene = new THREE.Scene();
  camera = new THREE.Camera();

  const geometry = new THREE.PlaneGeometry(2, 2);
  material = new THREE.ShaderMaterial({
    uniforms: {
      iTime: { value: 0 },
      iResolution: { value: resolution.clone().multiplyScalar(renderScale) },
      iMouse: { value: new THREE.Vector2() },
    },
    vertexShader,
    fragmentShader,
  });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(resolution.x * renderScale, resolution.y * renderScale);
  renderer.domElement.style.width = `${window.innerWidth}px`;
  renderer.domElement.style.height = `${window.innerHeight}px`;
  document.getElementById('shader-container').appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('touchmove', onTouchMove, false); // ADICIONADO SUPORTE A TOQUE

  updateVH(); // AJUSTE INICIAL DE VH
  animate();
}

function onWindowResize() {
  resolution.set(window.innerWidth, window.innerHeight);
  material.uniforms.iResolution.value = resolution.clone().multiplyScalar(renderScale);
  renderer.setSize(resolution.x * renderScale, resolution.y * renderScale);
  renderer.domElement.style.width = `${window.innerWidth}px`; // NOVO
  renderer.domElement.style.height = `${window.innerHeight}px`; // NOVO

  updateVH(); // NOVO
}

function onMouseMove(e) {
  material.uniforms.iMouse.value.set(e.clientX, window.innerHeight - e.clientY);
}

function onTouchMove(e) {
  if (e.touches.length > 0) {
    const touch = e.touches[0];
    material.uniforms.iMouse.value.set(touch.clientX, window.innerHeight - touch.clientY);
  }
}

function animate() {
  requestAnimationFrame(animate);
  material.uniforms.iTime.value = (Date.now() - startTime) * 0.001;
  renderer.render(scene, camera);
}

// FUNÇÃO NOVA PARA corrigir viewport no mobile
function updateVH() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}

init();