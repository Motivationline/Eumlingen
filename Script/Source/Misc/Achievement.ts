namespace Script {
    export interface GlobalEventData {
        type: string,
        data: any,
    }

    interface Achievement {
        title: string,
        description: string,
        icon: string,
        reward: number,
        secret?: boolean,
        achieved?: boolean,
        checkCompleted: (_e: CustomEvent<GlobalEventData>) => boolean;
        persistentData?: any;
    }

    const achievements: Achievement[] = [
        {
            title: "Das passt ja gar nicht",
            description: "Weise einen Eumling einer Station zu, die mit keiner Eigenschaft übereinstimmt.",
            icon: "placeholder.png",
            reward: 10,
            checkCompleted: function (_e): boolean {
                if (_e.detail.type !== "assignEumling") return false;
                if (_e.detail.data.fittingTraits === 0) return true;
                return false;
            }
        },
        {
            title: "Könnte klappen",
            description: "Weise einen Eumling einer Station zu, die mit einer Eigenschaft übereinstimmt.",
            icon: "placeholder.png",
            reward: 15,
            checkCompleted: function (_e): boolean {
                if (_e.detail.type !== "assignEumling" && _e.detail.type !== "eumlingDevelopTrait") return false;
                if (_e.detail.data.fittingTraits === 1) return true;
                return false;
            }
        },
        {
            title: "Perfect Match",
            description: "Weise einen Eumling einer Station zu, die mit zwei Eigenschaften übereinstimmt.",
            icon: "placeholder.png",
            reward: 20,
            checkCompleted: function (_e): boolean {
                if (_e.detail.type !== "assignEumling" && _e.detail.type !== "eumlingDevelopTrait") return false;
                if (_e.detail.data.fittingTraits === 2) return true;
                return false;
            }
        },
        {
            title: "Umschulung",
            description: "Ein Eumling entwickelt eine Eigenschaft an einer eigentlich unpassenden Station",
            icon: "placeholder.png",
            reward: 10,
            checkCompleted: function (_e): boolean {
                if (_e.detail.type !== "eumlingDevelopTrait") return false;
                return true;
            }
        },
        {
            title: "Treue Mitarbeit",
            description: "Ein Eumling arbeitet für mindestens 10 Minuten durchgängig an derselben Station",
            icon: "placeholder.png",
            reward: 15,
            checkCompleted: function (_e): boolean {
                if (_e.detail.type !== "eumlingWorking") return false;
                if (_e.detail.data.workTime > 10 * 60 * 1000) return true;
                return false;
            }
        },
        {
            title: "Allrounder",
            description: "Ein Eumling hat 4 Eigenschaften.",
            icon: "placeholder.png",
            reward: 20,
            checkCompleted: function (_e): boolean {
                if (_e.detail.type !== "eumlingDevelopTrait") return false;
                if (_e.detail.data.traits.size === 4) return true;
                return false;
            }
        },
        {
            title: "Gefunden!",
            description: "Finde alle 3 Eumling-Statuen",
            icon: "placeholder.png",
            reward: 10,
            secret: true,
            checkCompleted: function (_e): boolean {
                if (_e.detail.type !== "clickStatue") return false;

                return false;
            }
        },
    ]

    export const maxAchievablePoints: number = achievements.reduce((prev, curr) => prev + curr.reward, 0)

    function popupAchievement(_a: Achievement): HTMLElement {
        const div = document.createElement("div");
        div.innerHTML = `
        <span class="achievement-title">${_a.title}</span>
        <span class="achievement-description">${_a.description}</span>
        <span class="achievement-reward"><img src="Images/point.svg">+${_a.reward}</span>`;

        div.classList.add("achievement-popup");

        document.getElementById("achievement-overlay").appendChild(div);

        let timeout = setTimeout(() => {
            div.remove();
        }, 10000)
        div.addEventListener("click", () => {
            div.remove();
            clearTimeout(timeout);
        })
        return div;

    }

    function createFlyingPoints(_div: HTMLElement, _amt: number) {
        _div.addEventListener("animationend", async () => {
            let rect = _div.getBoundingClientRect();
            let targetRect = document.getElementById("game-info-wrapper").getBoundingClientRect();
            for (let i = 0; i < _amt; i++) {
                let img = createElementAdvanced("img", { classes: ["flying-point", "no-interact"] });
                img.src = "Images/point.svg";
                img.style.left = rect.x + rect.width * Math.random() + "px";
                img.style.top = rect.y + rect.height * Math.random() + "px";
                document.body.appendChild(img);
                setTimeout(() => {
                    img.style.left = targetRect.left + "px";
                    img.style.top = targetRect.top + "px";
                    setTimeout(() => {
                        GameData.addPoints(1);
                        img.remove();
                    }, 1000)
                }, 1000)
                await waitMS(20);
            }
        })
        _div.addEventListener("animationcancel", ()=>{GameData.addPoints(_amt)});
    }

    function updateAchievementList() {
        const list = document.getElementById("achievement-list");

        let newElements: HTMLElement[] = [];
        for (let a of achievements) {
            const div = createElementAdvanced("div", {
                classes: ["achievement"],
                innerHTML: `
                <span class="achievement-icon"> <img src="Images/${a.icon}"/></span>
                <span class="achievement-title">${a.secret ? "???" : a.title}</span>
                <div class="achievement-divider"></div>
                <span class="achievement-description">${a.secret ? "???" : a.description}</span>
                <span class="achievement-reward"><img src="Images/point.svg">+${a.reward}</span>`
            });
            if (a.achieved) div.classList.add("achieved");
            newElements.push(div);
        }
        list.replaceChildren(...newElements);
    }

    globalEvents.addEventListener("event", <EventListener>checkAchievements);

    function checkAchievements(_e: CustomEvent<GlobalEventData>) {
        for (let a of achievements) {
            if (a.achieved) continue;
            if (a.checkCompleted(_e)) {
                a.achieved = true;
                let div = popupAchievement(a);
                createFlyingPoints(div, a.reward);
                updateAchievementList();
            }
        }
    }

    document.addEventListener("DOMContentLoaded", updateAchievementList);

}