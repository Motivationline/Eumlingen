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
                this.#unlockedEumlings++;
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
            let wrappers = <NodeListOf<HTMLElement>>document.querySelectorAll(".achievement-progress-bar-wrapper");
            wrappers.forEach(wrapper => {
                wrapper.style.setProperty("--totalPoints", maxAchievablePoints.toString())
                wrapper.style.setProperty("--pointsUntilEumling", this.#pointsPerEumling.toString())
            });

            const progress: number = this.#totalPoints / maxAchievablePoints;
            const elements = <NodeListOf<HTMLDivElement>>document.querySelectorAll(".achievement-progress-bar-now");
            elements.forEach(element => {
                element.style.width = progress * 100 + "%";
            })
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