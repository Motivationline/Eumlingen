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
        hideTopLayer();
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
        layer.style.zIndex = "1000";
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
        document.querySelectorAll(".button-settings").forEach(e => e.addEventListener("click", openSettings));
        document.getElementById("button-main-menu").addEventListener("click", openMainMenu);
        document.getElementById("start-game").addEventListener("click", removeTopLayer);
        GameData.updateDisplays();
    });

    document.addEventListener("gameLoaded", () => {
        document.getElementById("start-loading").classList.add("hidden");
        document.getElementById("start-loaded").classList.remove("hidden");
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
        showLayer(document.getElementById("settings-overlay"));
    }

    let spawnMainMenuEumlings: boolean = true;

    function openMainMenu() {
        removeAllLayers();
        showLayer(document.getElementById("start-screen"), {
            onAdd: () => {
                spawnMainMenuEumlings = true;
                spawnEumling();
                document.getElementById("game-overlay").classList.add("hidden");
                document.getElementById("achievement-overlay").classList.add("hidden");
                document.getElementById("achievement-progress-overlay").classList.add("hidden");
                pauseGame(undefined, false);
            },
            onHide: () => {
                spawnMainMenuEumlings = false;
                document.getElementById("game-overlay").classList.remove("hidden");
                document.getElementById("achievement-overlay").classList.remove("hidden");
                document.getElementById("achievement-progress-overlay").classList.remove("hidden");
                unpauseGame();
            },
        })
    }

    export function spawnEumling() {
        const screen = document.getElementById("start-screen-background");
        const fromLeft: boolean = Math.random() > 0.5;
        const img = createElementAdvanced("img", { classes: ["start-background-eumling"], attributes: [["src", "Assets/UI/MainMenu/EumlingWalk.png?" + Date.now()]] });
        img.style.left = fromLeft ? "-250px" : "100vw";
        screen.appendChild(img);
        if (!fromLeft) { img.classList.add("reverse"); }
        setTimeout(() => { img.style.left = fromLeft ? "100vw" : "-250px" }, 100);
        if (spawnMainMenuEumlings) setTimeout(spawnEumling, randomRange(1000, 7000));
        setTimeout(() => { img.remove() }, 11000);
    }
}