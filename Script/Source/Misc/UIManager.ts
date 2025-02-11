namespace Script {
    import ƒ = FudgeCore;
    interface LayerOptions {
        onAdd: (_element: HTMLElement) => void;
        onHide: (_element: HTMLElement) => void;
        onRemove: (_element: HTMLElement) => void;
    }
    const activeLayers: [HTMLElement, Partial<LayerOptions>][] = [];

    export function showLayer(_layer: HTMLElement, _options: Partial<LayerOptions> = {}) {
        if (!_layer) return;
        // hideTopLayer();
        activeLayers.push([_layer, _options]);
        showTopLayer();
    }

    export function removeTopLayer() {
        hideTopLayer();
        let [layer, options] = activeLayers.pop();
        if (options.onRemove) options.onRemove(layer);
        showTopLayer();
    }

    export function removeAllLayers() {
        while (activeLayers.length > 0) {
            removeTopLayer();
        }
    }

    function showTopLayer() {
        if (activeLayers.length == 0) return;
        let [layer, options] = activeLayers[activeLayers.length - 1];
        layer.classList.remove("hidden");
        if (options.onAdd) options.onAdd(layer);
        layer.style.zIndex = "" + (1000 + activeLayers.length);
    }

    function hideTopLayer() {
        if (activeLayers.length == 0) return;
        let [layer, options] = activeLayers[activeLayers.length - 1];
        layer.classList.add("hidden");
        if (options.onHide) options.onHide(layer);
        layer.style.zIndex = "";
    }

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".close-button").forEach(b => {
            b.addEventListener("click", removeTopLayer);
        });
        document.getElementById("achievement-button").addEventListener("click", () => { showLayer(document.getElementById("achievement-screen-overlay")) });
        document.getElementById("pause-button").addEventListener("click", pauseGame);
        document.getElementById("fullscreen-button").addEventListener("click", fullscreen);
        document.querySelectorAll(".button-settings").forEach(e => e.addEventListener("click", openSettings));
        document.getElementById("button-main-menu").addEventListener("click", openMainMenu);
        document.getElementById("start-game").addEventListener("click", removeTopLayer);
        GameData.updateDisplays();
        GameData.setupProgressBar();
    });

    document.addEventListener("gameLoaded", () => {
        document.getElementById("start-loading").classList.add("hidden");
        document.getElementById("start-loaded").classList.remove("hidden");
        document.getElementById("logo").classList.remove("hidden");
        document.getElementById("start-screen-foreground").classList.add("with-logo");
        openMainMenu();
    });

    function pauseGame(_e: Event, openPauseMenu: boolean = true) {
        GameData.paused = true;
        if (openPauseMenu)
            showLayer(document.getElementById("pause-overlay"), {
                onRemove(_element) {
                    unpauseGame();
                },
            });
        ƒ.Time.game.setScale(0.000001);
    }
    function unpauseGame() {
        GameData.paused = false;
        ƒ.Time.game.setScale(1);
    }

    function openSettings() {
        showLayer(document.getElementById("settings-overlay-wrapper"));
    }

    function openMainMenu() {
        removeAllLayers();
        showLayer(document.getElementById("start-screen"), {
            onAdd: () => {
                spawnEumling();
                document.getElementById("game-overlay").classList.add("hidden");
                document.getElementById("achievement-overlay").classList.add("hidden");
                document.getElementById("achievement-progress-overlay").classList.add("hidden");
                pauseGame(undefined, false);
            },
            onRemove: () => {
                clearTimeout(spawnTimeout);
                document.getElementById("game-overlay").classList.remove("hidden");
                document.getElementById("achievement-overlay").classList.remove("hidden");
                document.getElementById("achievement-progress-overlay").classList.remove("hidden");
                unpauseGame();
            },
        })
    }

    let spawnTimeout: number;
    let currentEumlingLoadCounter: number = 0;
    const maxEumlingLoadCounter: number = 5;
    export function spawnEumling() {
        if (spawnTimeout) clearTimeout(spawnTimeout);
        const screen = document.getElementById("start-screen-background");
        const fromLeft: boolean = Math.random() > 0.5;
        const img = createElementAdvanced("img", { classes: ["start-background-eumling"], attributes: [["src", "Assets/UI/MainMenu/EumlingWalk.png?" + (currentEumlingLoadCounter++ % maxEumlingLoadCounter)], ["alt", ""]] });
        img.style.left = fromLeft ? "-250px" : "100vw";
        img.style.transitionDuration = randomRange(5, 15) + "s";
        screen.appendChild(img);
        if (!fromLeft) { img.classList.add("reverse"); }
        setTimeout(() => { img.style.left = fromLeft ? "100vw" : "-250px" }, 100);
        spawnTimeout = setTimeout(spawnEumling, randomRange(1000, 7000));
        img.addEventListener("transitionend", removeEumling);
        img.addEventListener("transitioncancel", removeEumling);
        function removeEumling() {
            img.remove();
        }
    }

    function fullscreen() {
        document.documentElement.requestFullscreen();
    }
}