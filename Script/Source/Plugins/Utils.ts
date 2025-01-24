namespace Script {
    import ƒ = FudgeCore;

    export function findFirstCameraInGraph(_graph: ƒ.Node): ƒ.ComponentCamera {
        let cam = _graph.getComponent(ƒ.ComponentCamera);
        if (cam) return cam;
        for (let child of _graph.getChildren()) {
            cam = findFirstCameraInGraph(child);
            if (cam) return cam;
        }
        return undefined;
    }

    export function enumToArray<T extends object>(anEnum: T): T[keyof T][] {
        return Object.keys(anEnum)
        .map(n => Number.parseInt(n))
        .filter(n => !Number.isNaN(n)) as unknown as T[keyof T][]
    }

    export function randomEnum<T extends object>(anEnum: T): T[keyof T] {
        const enumValues = enumToArray(anEnum);
        const randomIndex = Math.floor(Math.random() * enumValues.length)
        const randomEnumValue = enumValues[randomIndex]
        return randomEnumValue;
    }

    export function mobileOrTabletCheck() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    interface CreateElementAdvancedOptions {
        classes: string[],
        innerHTML: string,
    }
    export function createElementAdvanced<K extends keyof HTMLElementTagNameMap>(_type: K, _options: Partial<CreateElementAdvancedOptions> = {}): HTMLElementTagNameMap[K] {
        let el = document.createElement(_type);

        if (_options.classes) {
            el.classList.add(..._options.classes);
        }
        if (_options.innerHTML) {
            el.innerHTML = _options.innerHTML;
        }

        return el;
    }

    export function shuffleArray<T>(_array: Array<T>): Array<T> {
        for (let i: number = _array.length - 1; i >= 0; i--) {
            const k = Math.floor(Math.random() * (i + 1));
            [_array[i], _array[k]] = [_array[k], _array[i]];
        }
        return _array;
    }

    export async function waitMS(_ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, _ms);
        })
    }

    export function randomArrayElement<T>(_array: Array<T>): T | undefined {
        if (_array.length === 0) return undefined;
        return _array[Math.floor(Math.random() * _array.length)];
    }

    export function randomRange(min: number = 0, max: number = 1): number {
        const range = max - min;
        return Math.random() * range + min;
    }
}