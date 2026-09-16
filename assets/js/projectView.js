var id = Number.parseInt(window.location.href.split("id=")[1]);

fetch("projects-data.json").then(response => response.json()).then(data => {
	let entry = data[id]
    
    if (entry.stepFile) {
        document.getElementById("stepViewerFrame").src = "viewer.html?f=" + entry.stepFile;
    } else {
        document.getElementById("stepViewerFrame").style.display = "none";
    }
    for (spec of entry.specs) {
        const li = document.createElement("li");
        li.textContent = spec;
        document.getElementById("specsList").appendChild(li);
    }

    for (img of entry.photos) {
        const imgElement = document.createElement("img");
        imgElement.src = "projects/imgs/" + img;
        document.getElementById("projectImgs").appendChild(imgElement);
    }

    document.getElementById("projectTitle").textContent = entry.title;
    
    Array.from(document.getElementById("projectImgs").getElementsByTagName("img")).forEach(img => {
        img.addEventListener("click", () => {
            if (!img.classList.contains("fullscreen")) {
                img.classList.add("fullscreen");
            } else {
                img.classList.remove("fullscreen");
            }
        });
    });
});