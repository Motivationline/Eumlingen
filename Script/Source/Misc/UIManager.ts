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
        document.getElementById("button-settings").addEventListener("click", openSettings);
        document.getElementById("button-main-menu").addEventListener("click", returnToMainMenu);
        GameData.updateDisplays();
    })

    function pauseGame() {
        GameData.paused = true;
        showLayer(document.getElementById("pause-overlay"), {onRemove(_element) {
            unpauseGame();
        },});
        ƒ.Time.game.setScale(0.000001);
    }
    function unpauseGame() {
        GameData.paused = false;
        ƒ.Time.game.setScale(1);
    }

    function openSettings() {
        showLayer(document.getElementById("settings-overlay"));
    }

    function returnToMainMenu() { }
}