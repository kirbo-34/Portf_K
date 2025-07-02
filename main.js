import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js';

async function loadShader(url) {
  const res = await fetch(url);
  return await res.text();
}

async function main() {
  const shaderCode = await loadShader('shader.frag');

  // Cria o canvas antes de usar
  const canvas = document.createElement('canvas');

  // Agora adiciona o canvas ao container
  const container = document.getElementById('shader-container');
  container.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
  });
  
  renderer.setClearColor(0x000000, 0); // fundo transparente
  
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    iTime: { value: 0.0 }
  };

  const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader: shaderCode,
  uniforms
});


  const geometry = new THREE.PlaneGeometry(2, 2);
  scene.add(new THREE.Mesh(geometry, material));

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
  });
  function animate(time) {
    uniforms.iTime.value = time * 0.001;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
  renderer.setSize(window.innerWidth, window.innerHeight);
}
const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

main();
