const galleryGrid = document.querySelector("#galleryGrid");
const viewButtons = document.querySelectorAll(".gallery-view-button");
const videoModal = document.querySelector("#videoModal");
const modalVideo = document.querySelector("#modalVideo");
const closeVideoModal = document.querySelector(".video-modal-close");

const repositoryOwner = "fanania";
const repositoryName = "page";
const repositoryBranch = "main";

const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const videoExtensions = [".mp4", ".webm", ".mov", ".m4v"];
const excludedFolders = ["/loop/", "/mini_char/", "/logo/", "/background/"];

function getFileExtension(path) {
    const fileName = path.split("/").pop();
    const extension = fileName.includes(".")
        ? fileName.slice(fileName.lastIndexOf(".")).toLowerCase()
        : "";

    return extension;
}

function isAllowedMedia(path) {
    const filePath = path.toLowerCase();
    const extension = getFileExtension(filePath);
    const isMedia = [
        ...imageExtensions,
        ...videoExtensions
    ].includes(extension);

    return (
        filePath.startsWith("meta/") &&
        !excludedFolders.some(folder => filePath.includes(folder)) &&
        isMedia
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
    const encodedPath = path
        .split("/")
        .map(encodeURIComponent)
        .join("/");

    return `https://fanania.github.io/page/${encodedPath}`;
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

function openVideo(url, title) {
    if (!videoModal || !modalVideo) return;

    modalVideo.src = url;
    modalVideo.setAttribute("aria-label", title);

    videoModal.classList.add("is-visible");
    videoModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    modalVideo.play().catch(() => {});
}

function createVideoItem(url, path) {
    const title = getMediaTitle(path);
    const item = document.createElement("figure");

    item.className = "gallery-item gallery-video-item";

    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("tabindex", "0");
    video.setAttribute("aria-label", `Deschide ${title}`);

    const activateVideo = () => openVideo(url, title);

    video.addEventListener("click", activateVideo);

    video.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            activateVideo();
        }
    });

    item.append(video, createCaption(path));
    return item;
}

function closeVideo() {
    if (!videoModal || !modalVideo) return;

    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.load();

    videoModal.classList.remove("is-visible");
    videoModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
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

function setupVideoModal() {
    if (!videoModal || !modalVideo || !closeVideoModal) return;

    closeVideoModal.addEventListener("click", closeVideo);

    videoModal.addEventListener("click", event => {
        if (event.target === videoModal) {
            closeVideo();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeVideo();
        }
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

        const mediaFiles = (data.tree || [])
            .filter(file => file.type === "blob")
            .map(file => file.path)
            .filter(isAllowedMedia)
            .sort((a, b) =>
                a.localeCompare(b, "ro", { sensitivity: "base" })
            );

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
setupVideoModal();
loadGallery();
