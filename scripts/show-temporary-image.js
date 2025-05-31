Hooks.once('ready', () => {
    // Ajout de l'écouteur de drop d'image sur le document
    document.body.addEventListener('drop', async (event) => {
        event.preventDefault();
        const items = event.dataTransfer.items;

        for (const item of items) {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        const base64 = e.target.result;
                        const title = file.name;

                        // Envoie l'image via socket à tous les joueurs
                        game.socket.emit('module.show-temporary-image', { base64, title });
                        // Affiche aussi côté MJ
                        showTemporaryImage(base64, title);
                    };
                    reader.readAsDataURL(file);
                }
            }
        }
    });

    // Écouteur côté client pour recevoir l'image
    game.socket.on('module.show-temporary-image', ({ base64, title }) => {
        if (!game.user.isGM) {
            showTemporaryImage(base64, title);
        }
    });

    function showTemporaryImage(base64, title) {
        const popout = new ImagePopout(base64, { title: title });
        popout.render(true);
    }
});
