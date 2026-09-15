var STEPFILENAMEQ = "steps/" + window.location.href.split('?f=')[1] + '.step';

const container = document.getElementById('canvas-container');
const loadingEl = document.getElementById('loading');
const loadingText = document.getElementById('loading-text');

const initW = container.clientWidth || window.innerWidth || 500;
const initH = container.clientHeight || window.innerHeight || 400;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, initW / initH, 0.1, 3000);
camera.position.set(90, 60, 110);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(initW, initH);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.enableZoom = false;
controls.enableRotate = true;
controls.target.set(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 0.85);
keyLight.position.set(150, 200, -150);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.45);
fillLight.position.set(-150, 100, 150);
scene.add(fillLight);

const topLight = new THREE.DirectionalLight(0xffffff, 0.3);
topLight.position.set(0, 250, 0);
scene.add(topLight);

const modelGroup = new THREE.Group();
scene.add(modelGroup);

let occtInstance = null;

async function initOcct() {
    if (occtInstance) return occtInstance;
    loadingText.textContent = 'Initializing CAD kernel...';
    occtInstance = await occtimportjs({
        locateFile: (path) => `https://cdn.jsdelivr.net/npm/occt-import-js@0.0.23/dist/${path}`
    });
    return occtInstance;
}

function updateSize() {
    const w = container.clientWidth || window.innerWidth || 500;
    const h = container.clientHeight || window.innerHeight || 400;
    if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }
}
window.addEventListener('resize', updateSize);
if (window.ResizeObserver) {
    new ResizeObserver(updateSize).observe(container);
}

async function loadStepFromArrayBuffer(buffer, fileName = 'Model') {
    try {
        loadingEl.style.display = 'flex';
        loadingText.textContent = 'Tessellating CAD geometry...';

        const occt = await initOcct();
        const fileBytes = new Uint8Array(buffer);
        const result = occt.ReadStepFile(fileBytes, null);

        if (!result || !result.success || !result.meshes || result.meshes.length === 0) {
            throw new Error(result?.error || 'No 3D meshes found in STEP file.');
        }

        while (modelGroup.children.length > 0) {
            const child = modelGroup.children[0];
            modelGroup.remove(child);
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                else child.material.dispose();
            }
        }

        result.meshes.forEach((m) => {
            if (!m.attributes || !m.attributes.position || !m.attributes.position.array) return;

            const geom = new THREE.BufferGeometry();
            const pos = new Float32Array(m.attributes.position.array);
            geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));

            if (m.attributes.normal && m.attributes.normal.array && m.attributes.normal.array.length > 0) {
                const norm = new Float32Array(m.attributes.normal.array);
                geom.setAttribute('normal', new THREE.BufferAttribute(norm, 3));
            } else {
                geom.computeVertexNormals();
            }

            if (m.index && m.index.array && m.index.array.length > 0) {
                const indices = new Uint32Array(m.index.array);
                geom.setIndex(new THREE.BufferAttribute(indices, 1));
            }

            const mat = new THREE.MeshStandardMaterial({
                color: "red",
                roughness: 0.5,
                metalness: 1,
                side: THREE.DoubleSide
            });

            const mesh = new THREE.Mesh(geom, mat);

            try {
                const edges = new THREE.EdgesGeometry(geom, 28);
                const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
                    color: "white",
                    linewidth: 10
                }));
                mesh.add(line);
            } catch (e) { }

            modelGroup.add(mesh);
        });

        const bbox = new THREE.Box3().setFromObject(modelGroup);
        const center = bbox.getCenter(new THREE.Vector3());
        const size = bbox.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const targetScale = 95 / maxDim;

        modelGroup.scale.set(targetScale, targetScale, targetScale);
        modelGroup.position.set(
            -center.x * targetScale,
            -center.y * targetScale,
            -center.z * targetScale
        );

        camera.position.set(70, 42, 85);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();

        updateSize();
        if (loadingEl) loadingEl.style.display = 'none';
    } catch (err) {
        console.error('Error loading STEP file:', err);
        if (loadingText) loadingText.textContent = 'Error: ' + (err.message || err);
    }
}

async function loadDefaultSample() {
    try {
        const response = await fetch(STEPFILENAMEQ);
        if (response.ok) {
            const buffer = await response.arrayBuffer();
            if (buffer.byteLength > 100) {
                return await loadStepFromArrayBuffer(buffer, STEPFILENAMEQ);
            }
        }
    } catch (e) {
        console.warn('Fetch step file failed, attempting embedded base64...', e);
    }

    if (window.__SAMPLE_STEP_B64__) {
        try {
            const binaryString = atob(window.__SAMPLE_STEP_B64__);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return await loadStepFromArrayBuffer(bytes.buffer, STEPFILENAMEQ);
        } catch (err) {
            console.error('Error decoding embedded fallback data:', err);
        }
    }

    if (loadingText) loadingText.textContent = 'Drop a .step file to view';
}

const fileInput = document.getElementById('file-input');
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => loadStepFromArrayBuffer(reader.result, file.name);
        reader.readAsArrayBuffer(file);
    });
}

window.addEventListener('dragover', (e) => e.preventDefault());
window.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            loadStepFromArrayBuffer(reader.result, file.name);
        };
        reader.readAsArrayBuffer(file);
    }
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('DOMContentLoaded', updateSize);
loadDefaultSample();