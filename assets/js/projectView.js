var id = Number.parseInt(window.location.href.split("id=")[1]);

fetch("/projects-data.json").then(response => response.json()).then(data => {
	let entry = data[id]
    document.getElementById("stepViewerFrame").src = "viewer.html?f=" + entry.stepFile;

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
    console.log(entry)
});