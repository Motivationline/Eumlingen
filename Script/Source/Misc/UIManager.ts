namespace Script {
    import ƒ = FudgeCore;
    interface LayerOptions {
        onAdd: (_element: HTMLElement) => void;
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
        activeLayers.pop();
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
        if (options.onRemove) options.onRemove(layer);
        layer.style.zIndex = "";
    }

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".close-button").forEach(b => {
            b.addEventListener("click", hideTopLayer);
            b.addEventListener("click", unpauseGame);
        });
        document.getElementById("achievement-button").addEventListener("click", () => { showLayer(document.getElementById("achievement-screen-overlay")) });
        document.getElementById("pause-button").addEventListener("click", pauseGame);
        document.getElementById("pause-button").addEventListener("click", pauseGame);
        GameData.updateDisplays();
    })

    function pauseGame() {
        GameData.paused = true;
        showLayer(document.getElementById("pause-overlay"));
        ƒ.Time.game.setScale(0.000001);
    }
    function unpauseGame() {
        GameData.paused = false;
        ƒ.Time.game.setScale(1);
    }
}