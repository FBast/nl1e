Hooks.once('ready', () => {
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

                        game.socket.emit('module.show-temporary-image', { base64, title });
                        showTemporaryImage(base64, title);
                    };
                    reader.readAsDataURL(file);
                }
            }
        }
    });

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