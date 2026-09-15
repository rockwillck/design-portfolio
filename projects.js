// Projects data - synced with GitHub
let projects = [
	{
		id: 'project-1',
		title: 'Stub Shafts',
		thumbnail: 'stubshaft.jpg',
		stepFile: 'sample.step',
		photos: ['stubshaft.jpg']
	},
	{
		id: 'project-2',
		title: 'Welding Projects',
		thumbnail: 'mewelding_photo.jpg',
		stepFile: 'sample.step',
		photos: ['mewelding_photo.jpg']
	},
	{
		id: 'project-3',
		title: 'Jacking Point',
		thumbnail: 'orion_back.JPG',
		stepFile: 'sample.step',
		photos: ['orion_back.JPG']
	}
];

const GITHUB_OWNER = 'shepherdgabriella';
const GITHUB_REPO = 'design-portfolio';
const GITHUB_BRANCH = 'main';
const DATA_FILE = 'projects-data.json';
let GITHUB_TOKEN = null; // Will be set by user

// Load projects gallery on page load
document.addEventListener('DOMContentLoaded', () => {
	loadProjectsFromGitHub();
});

async function loadProjectsFromGitHub() {
	try {
		const response = await fetch(
			`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_FILE}?ref=${GITHUB_BRANCH}`
		);
		
		if (response.ok) {
			const data = await response.json();
			const content = atob(data.content); // Decode base64
			projects = JSON.parse(content);
		}
	} catch (error) {
		console.log('Using default projects (GitHub sync not available)');
	}
	
	loadProjectsGallery();
}

function loadProjectsGallery() {
	const gallery = document.getElementById('projectsGallery');
	gallery.innerHTML = '';

	projects.forEach(project => {
		const card = createProjectCard(project);
		gallery.appendChild(card);
	});
}

function createProjectCard(project) {
	const card = document.createElement('div');
	card.className = 'project-card';
	card.onclick = () => navigateToProject(project.id);

	if (project.thumbnail) {
		const img = document.createElement('img');
		img.src = project.thumbnail;
		img.alt = project.title;
		card.appendChild(img);
	} else {
		const placeholder = document.createElement('div');
		placeholder.className = 'project-card-placeholder';
		placeholder.innerHTML = `<div>${project.title}<br><small>No image yet</small></div>`;
		card.appendChild(placeholder);
	}

	// Add overlay with project name
	const overlay = document.createElement('div');
	overlay.className = 'project-card-overlay';
	overlay.innerHTML = `<div class="project-card-overlay-text">${project.title}</div>`;
	card.appendChild(overlay);

	return card;
}

function navigateToProject(projectId) {
	// Navigate to the project page
	window.location.href = `project.html?id=${projectId}`;
}

async function saveProjectsToGitHub(updatedProjects) {
	if (!GITHUB_TOKEN) {
		console.error('GitHub token not set. Cannot save projects.');
		return false;
	}

	try {
		// First, get the current file SHA
		const getResponse = await fetch(
			`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_FILE}?ref=${GITHUB_BRANCH}`,
			{
				headers: {
					'Authorization': `token ${GITHUB_TOKEN}`,
				}
			}
		);

		let sha = null;
		if (getResponse.ok) {
			const data = await getResponse.json();
			sha = data.sha;
		}

		// Prepare the content
		const content = JSON.stringify(updatedProjects, null, 2);
		const encodedContent = btoa(content); // Encode to base64

		// Update or create the file
		const putResponse = await fetch(
			`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${DATA_FILE}`,
			{
				method: 'PUT',
				headers: {
					'Authorization': `token ${GITHUB_TOKEN}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message: 'Update project photos',
					content: encodedContent,
					...(sha && { sha: sha })
				})
			}
		);

		return putResponse.ok;
	} catch (error) {
		console.error('Error saving to GitHub:', error);
		return false;
	}
}

function setGitHubToken(token) {
	GITHUB_TOKEN = token;
	localStorage.setItem('github_token', token);
}

function getGitHubToken() {
	return localStorage.getItem('github_token');
}

// Load token on startup if available
window.addEventListener('load', () => {
	const savedToken = getGitHubToken();
	if (savedToken) {
		GITHUB_TOKEN = savedToken;
	}
});
