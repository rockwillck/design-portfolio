onload = () => {
    for (h1 of [...document.getElementsByTagName("h1")]) {
        chars = h1.innerText.split("");
        h1.innerHTML = "";
        chars.forEach((char, i) => {
            let sub = document.createElement("p");
            sub.innerHTML = char;
            h1.appendChild(sub);
            sub.style.fontFamily = "scrapbook";
            sub.style.scale = "1 1";
            setTimeout(() => {
                sub.style.fontFamily = "plain";
                sub.style.scale = "";
            }, i * 100 + 100);
        })
    }
}