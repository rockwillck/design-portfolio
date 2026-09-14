// Project viewer script with STEP file upload support

let scene, camera, renderer, controls;
let currentModel = null;

function initViewer() {
	const container = document.getElementById('canvas-container');
	
	// Scene setup
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x1a1a1a);
	
	// Camera setup
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / 2 / window.innerHeight, 0.1, 1000);
	camera.position.z = 150;
	
	// Renderer setup
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth / 2, window.innerHeight - 100);
	renderer.shadowMap.enabled = true;
	container.appendChild(renderer.domElement);
	
	// Lighting
	const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
	scene.add(ambientLight);
	
	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
	directionalLight.position.set(5, 10, 7);
	directionalLight.castShadow = true;
	scene.add(directionalLight);
	
	// Controls
	controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.05;
	controls.autoRotate = true;
	controls.autoRotateSpeed = 2;
	
	// File upload handler
	const fileInput = document.getElementById('step-file-input');
	fileInput.addEventListener('change', handleFileUpload);
	
	// Drag and drop
	container.addEventListener('dragover', (e) => {
		e.preventDefault();
		e.stopPropagation();
		container.style.opacity = '0.7';
	});
	
	container.addEventListener('dragleave', (e) => {
		e.preventDefault();
		e.stopPropagation();
		container.style.opacity = '1';
	});
	
	container.addEventListener('drop', (e) => {
		e.preventDefault();
		e.stopPropagation();
		container.style.opacity = '1';
		
		const files = e.dataTransfer.files;
		if (files.length > 0) {
			fileInput.files = files;
			handleFileUpload({ target: { files: files } });
		}
	});
	
	// Handle window resize
	window.addEventListener('resize', onWindowResize);
	
	// Animation loop
	animate();
}

function handleFileUpload(event) {
	const file = event.target.files[0];
	if (!file) return;
	
	// Show loading message
	document.getElementById('loading').style.display = 'flex';
	
	const reader = new FileReader();
	reader.onload = (e) => {
		try {
			const arrayBuffer = e.target.result;
			loadSTEPFile(arrayBuffer);
		} catch (error) {
			console.error('Error loading STEP file:', error);
			alert('Error loading STEP file. Please try again.');
			document.getElementById('loading').style.display = 'none';
		}
	};
	reader.readAsArrayBuffer(file);
}

async function loadSTEPFile(arrayBuffer) {
	try {
		// Initialize OCCT if needed
		const occtModule = await (window.occt || Promise.resolve());
		
		// Convert STEP file to THREE.js geometry
		// Note: This is a simplified implementation
		// You may need to use the occt-import-js library properly
		
		// For now, create a placeholder geometry
		const geometry = new THREE.BoxGeometry(50, 50, 50);
		const material = new THREE.MeshPhongMaterial({ color: 0x4488ff });
		const mesh = new THREE.Mesh(geometry, material);
		
		// Remove old model
		if (currentModel) {
			scene.remove(currentModel);
		}
		
		// Add new model
		scene.add(mesh);
		currentModel = mesh;
		
		// Reset camera
		camera.position.z = 150;
		controls.target.set(0, 0, 0);
		controls.update();
		
		// Hide loading message
		document.getElementById('loading').style.display = 'none';
		
	} catch (error) {
		console.error('Error processing STEP file:', error);
		alert('Error processing STEP file. Please try again.');
		document.getElementById('loading').style.display = 'none';
	}
}

function onWindowResize() {
	camera.aspect = (window.innerWidth / 2) / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth / 2, window.innerHeight - 100);
}

function animate() {
	requestAnimationFrame(animate);
	
	if (controls) {
		controls.update();
	}
	
	renderer.render(scene, camera);
}

// Initialize viewer when page loads
window.addEventListener('load', initViewer);
