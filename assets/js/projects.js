fetch("projects-data.json").then(response => response.json()).then(data => {
	let i = 0;
    for (entry of data) {
		const projectCard = document.createElement("a");
		projectCard.className = "project-card";

		projectCard.href = "project.html?id=" + i;

		const img = document.createElement("img");
		img.src = "projects/imgs/" + entry.thumbnail;
		img.alt = entry.title;
		projectCard.appendChild(img);

		const overlay = document.createElement("div");
		overlay.className = "project-card-overlay";

		const overlayText = document.createElement("div");
		overlayText.className = "project-card-overlay-text";
		overlayText.textContent = entry.title;
		overlay.appendChild(overlayText);

		projectCard.appendChild(overlay);

		document.getElementById("projectsGallery").appendChild(projectCard);
		i++;
	}
});