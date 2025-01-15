namespace Script {
    interface LayerOptions {
        onAdd: (_element: HTMLElement) => void;
        onRemove: (_element: HTMLElement) => void;
    }
    const activeLayers: [HTMLElement, Partial<LayerOptions>][] = [];

    export function showLayer(_layer: HTMLElement, _options: Partial<LayerOptions> = {}) {
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
            b.innerHTML = "x";
            b.addEventListener("click", removeTopLayer);
        });
    })
}