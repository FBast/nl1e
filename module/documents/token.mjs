export class Pl1eToken extends Token {

    async draw() {
        await super.draw();

        const autoTokenEnabled = game.settings.get("pl1e", "autoTokenEnabled");
        if (!autoTokenEnabled) return;

        await this.addFramedEffect();
    }

    async addFramedEffect() {
        if (!this.actor) return;

        const experience = this.actor.system.general.experience;
        const level = Math.floor(experience / 10);
        const clampedLevel = Math.max(0, Math.min(6, level));

        const baseImage = this.actor.img;
        const framePath = `systems/pl1e/assets/frames/token-frame-${clampedLevel}.webp`;
        const backgroundPath = `systems/pl1e/assets/frames/token-bg-${clampedLevel}.webp`;

        const processedImage = await createFramedTokenImage(baseImage, backgroundPath, framePath);

        this.mesh.texture = await loadTexture(processedImage);
    }
}

async function createFramedTokenImage(baseImage, backgroundPath, framePath) {
    const imgSize = 256;
    const canvasElement = document.createElement("canvas");
    canvasElement.width = imgSize;
    canvasElement.height = imgSize;
    const ctx = canvasElement.getContext("2d");

    const baseImg = await loadImage(baseImage);
    const backgroundImg = await loadImage(backgroundPath);
    const frameImg = await loadImage(framePath);

    ctx.drawImage(backgroundImg, 0, 0, imgSize, imgSize);

    ctx.save();
    ctx.beginPath();
    ctx.arc(imgSize / 2, imgSize / 2, imgSize / 2 - 10, 0, Math.PI * 2); // Légère marge pour le cadre
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(baseImg, 0, 0, imgSize, imgSize);
    ctx.restore();

    ctx.drawImage(frameImg, 0, 0, imgSize, imgSize);

    return canvasElement.toDataURL("image/png");
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
    });
}