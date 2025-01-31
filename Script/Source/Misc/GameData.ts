namespace Script {
    // import ƒ = FudgeCore;
    export class GameData {
        static Instance: GameData = new GameData();
        static #points: number = 0;
        static #totalPoints: number = 0;
        static #unlockedEumlings: number = 1;
        static paused: boolean = false;
        static readonly #pointsPerEumling: number = 20;
        constructor() {
            if (GameData.Instance) return GameData.Instance;

        }

        static get points(): number {
            return this.#points;
        }
        static addPoints(_points: number) {
            this.#points += _points;
            this.#totalPoints += _points;

            //check new Eumling reached
            const newEumlingAmt: number = Math.floor(this.#totalPoints / this.#pointsPerEumling) + 1;
            const eumlingsToSpawn: number = newEumlingAmt - this.#unlockedEumlings;
            for (let i: number = 0; i < eumlingsToSpawn; i++) {
                let eumlingToRemove = maxAchievablePoints / this.#pointsPerEumling - this.#unlockedEumlings;
                this.#unlockedEumlings++;
                document.querySelectorAll(`.eumling-plus-icon[data-id="${eumlingToRemove}"]`).forEach(element => {
                    element.classList.add("reached");
                });
                setTimeout(() => {
                    viewport.getBranch().broadcastEvent(new Event("spawnEumling"));
                }, 100 * i);
            }
            this.updateDisplays(true);
        }

        static updateDisplays(showProgressOverlay: boolean = false) {
            document.querySelectorAll(".total-points-display").forEach(el => (<HTMLElement>el).innerText = this.#totalPoints.toString());
            document.querySelectorAll(".point-display").forEach(el => (<HTMLElement>el).innerText = this.#points.toString());
            document.querySelectorAll(".eumling-display").forEach(el => (<HTMLElement>el).innerText = this.#unlockedEumlings.toString());
            this.updateProgressBar();
            if (showProgressOverlay)
                this.displayProgressBarOverlay();
        }


        static updateProgressBar() {
            const progress: number = this.#totalPoints / maxAchievablePoints;
            const elements = <NodeListOf<HTMLDivElement>>document.querySelectorAll(".achievement-progress-bar-now");
            elements.forEach(element => {
                element.style.width = progress * 100 + "%";
            })
        }

        static setupProgressBar() {
            let wrappers = <NodeListOf<HTMLElement>>document.querySelectorAll(".achievement-progress-wrapper");
            wrappers.forEach(wrapper => {
                wrapper.style.setProperty("--totalPoints", maxAchievablePoints.toString());
                wrapper.style.setProperty("--pointsUntilEumling", this.#pointsPerEumling.toString());
                this.addEumlingIconsToProgressBar(wrapper);
            });
        }

        private static addEumlingIconsToProgressBar(_wrapper: HTMLElement) {
            _wrapper.querySelectorAll(".eumling-plus-icon").forEach(e => e.remove());
            let wrapper = _wrapper.querySelector(".achievement-progress-bar-wrapper");
            const maxEumlingAmt = maxAchievablePoints / this.#pointsPerEumling;
            for (let i: number = 0; i < maxEumlingAmt; i++) {
                let img = createElementAdvanced("img", { classes: ["eumling-plus-icon"], attributes: [["style", `--id: ${i};`], ["src", "Assets/UI/Icons/EumlingIcon.svg"]] })
                img.dataset.id = i.toString();
                wrapper.appendChild(img);
            }
        }

        static displayTimeout: number;
        static displayProgressBarOverlay() {
            const overlay = document.getElementById("achievement-progress-overlay");
            clearTimeout(this.displayTimeout);
            overlay.classList.remove("hide");

            this.displayTimeout = setTimeout(this.hideProgressBarOverlay, 3000);
        }
        static hideProgressBarOverlay() {
            const overlay = document.getElementById("achievement-progress-overlay");
            overlay.classList.add("hide");
        }
    }
}