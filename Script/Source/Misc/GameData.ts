namespace Script {
    // import ƒ = FudgeCore;
    export class GameData {
        static Instance: GameData = new GameData();
        static #points: number = 0;
        static #totalPoints: number = 0;
        static #unlockedEumlings: number = 1;
        static paused: boolean = false;
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
            if (Math.floor(this.#totalPoints / 20) > this.#unlockedEumlings - 1) {
                this.#unlockedEumlings++;
                viewport.getBranch().broadcastEvent(new Event("spawnEumling"));
            }
            this.updateDisplays();
        }
        
        static updateDisplays(){
            document.querySelectorAll(".total-points-display").forEach(el => (<HTMLElement>el).innerText = this.#totalPoints.toString());
            document.querySelectorAll(".point-display").forEach(el => (<HTMLElement>el).innerText = this.#points.toString());
            document.querySelectorAll(".eumling-display").forEach(el => (<HTMLElement>el).innerText = this.#unlockedEumlings.toString());

            const progress: HTMLProgressElement = <HTMLProgressElement>document.getElementById("achievement-progress");
            progress.max = maxAchievablePoints;
            progress.value = this.#totalPoints;
        }
    }
}