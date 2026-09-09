const galleryGrid = document.querySelector("#galleryGrid");
const viewButtons = document.querySelectorAll(".gallery-view-button");

const repositoryOwner = "fanania";
const repositoryName = "page";
const repositoryBranch = "main";

const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const videoExtensions = [".mp4", ".webm", ".mov", ".m4v"];

const excludedFolders = [
    "/loop/",
    "/mini_char/",
    "/logo/"
];

function getFileExtension(path) {
    return path.slice(path.lastIndexOf(".")).toLowerCase();
}

function isAllowedMedia(path) {
    const filePath = path.toLowerCase();
    const extension = getFileExtension(filePath);
    const isImage = imageExtensions.includes(extension);
    const isVideo = videoExtensions.includes(extension);

    return (
        filePath.startsWith("meta/") &&
        !excludedFolders.some(folder => filePath.includes(folder)) &&
        (isImage || isVideo)
    );
}

function getMediaTitle(path) {
    return path
        .split("/")
        .pop()
        .replace(/\.[^/.]+$/, "")
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getFileUrl(path) {
    return `https://fanania.github.io/page/${path
        .split("/")
        .map(encodeURIComponent)
        .join("/")}`;
}

function createCaption(path) {
    const caption = document.createElement("figcaption");
    caption.textContent = getMediaTitle(path);
    return caption;
}

function createImageItem(url, path) {
    const item = document.createElement("figure");
    item.className = "gallery-item";

    const image = document.createElement("img");
    image.src = url;
    image.alt = getMediaTitle(path);
    image.loading = "lazy";

    item.append(image, createCaption(path));
    return item;
}

function createVideoItem(url, path) {
    const item = document.createElement("figure");
    item.className = "gallery-item gallery-video-item";

    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("aria-label", getMediaTitle(path));

    item.append(video, createCaption(path));
    return item;
}

function setupViewButtons() {
    viewButtons.forEach(button => {
        button.addEventListener("click", () => {
            const oneColumn = button.dataset.view === "one";

            galleryGrid.classList.toggle(
                "gallery-grid--one-column",
                oneColumn
            );

            viewButtons.forEach(item => {
                const active = item === button;

                item.classList.toggle("is-active", active);
                item.setAttribute("aria-pressed", String(active));
            });
        });
    });
}

async function loadGallery() {
    const apiUrl =
        `https://api.github.com/repos/${repositoryOwner}/${repositoryName}` +
        `/git/trees/${repositoryBranch}?recursive=1`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error("Nu s-au putut încărca fișierele.");
        }

        const data = await response.json();

        const mediaFiles = data.tree
            .filter(file => file.type === "blob")
            .map(file => file.path)
            .filter(isAllowedMedia)
            .sort((a, b) => a.localeCompare(b, "ro", { sensitivity: "base" }));

        galleryGrid.innerHTML = "";

        if (!mediaFiles.length) {
            galleryGrid.innerHTML = `
                <p class="gallery-status">
                    Nu au fost găsite fotografii sau videoclipuri.
                </p>
            `;
            return;
        }

        mediaFiles.forEach(path => {
            const url = getFileUrl(path);
            const extension = getFileExtension(path);

            const item = imageExtensions.includes(extension)
                ? createImageItem(url, path)
                : createVideoItem(url, path);

            galleryGrid.appendChild(item);
        });
    } catch (error) {
        galleryGrid.innerHTML = `
            <p class="gallery-status">
                Galeria nu a putut fi încărcată momentan.
            </p>
        `;

        console.error(error);
    }
}

setupViewButtons();
loadGallery();
