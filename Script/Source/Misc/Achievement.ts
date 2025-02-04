namespace Script {
    import ƒ = FudgeCore;
    export type GlobalEventData = GlobalEventEumlingWorking | GlobalEventEumlingWorkingAtWorkbench | GlobalEventEumlingDevelopTrait | GlobalEventEumlingAssign | GlobalEventEumlingUnassign | GlobalEventDeconstructWorkbech | GlobalEventClickStatue | GlobalEventThrownEumlingTop;

    interface GlobalEventBase {
        type: string,
        data: any,
    }

    interface GlobalEventEumlingWorking extends GlobalEventBase {
        type: "eumlingWorking",
        data: { workTime: number },
    }
    interface GlobalEventEumlingWorkingAtWorkbench extends GlobalEventBase {
        type: "eumlingWorkingAtWorkbench",
        data: { workTime: number },
    }
    interface GlobalEventEumlingDevelopTrait extends GlobalEventBase {
        type: "eumlingDevelopTrait",
        data: { fittingTraits: number, traits: Set<TRAIT>, eumling: ƒ.Node },
    }
    interface GlobalEventEumlingAssign extends GlobalEventBase {
        type: "assignEumling",
        data: { fittingTraits: number },
    }
    interface GlobalEventEumlingUnassign extends GlobalEventBase {
        type: "unassignEumling",
        data: { workTime: number },
    }
    interface GlobalEventDeconstructWorkbech extends GlobalEventBase {
        type: "deconstructWorkbench",
        data: { workbench: Workbench },
    }
    interface GlobalEventClickStatue extends GlobalEventBase {
        type: "clickStatue",
        data: { statue: ƒ.Node },
    }
    interface GlobalEventThrownEumlingTop extends GlobalEventBase {
        type: "thrownEumlingTopPosition",
        data: { y: number },
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
        // { title: "Titel", description: "Beschreibung mit mehr blabla als die andere", icon: "placeholder.svg", reward: 10, checkCompleted(_e) { return true; }, },
        // { title: "Titel", description: "Beschreibung", icon: "placeholder.svg", reward: 10, checkCompleted(_e) { return true; }, },
        {
            title: "Das passt ja gar nicht",
            description: "Weise einen Eumling einer Station zu, die mit keiner Eigenschaft übereinstimmt.",
            icon: "Achievement_Passt_nicht.svg",
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
            icon: "Achievement_Koennte_klappen.svg",
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
            icon: "Achievement_Perfect_Match.svg",
            reward: 20,
            checkCompleted: function (_e): boolean {
                if (_e.detail.type !== "assignEumling" && _e.detail.type !== "eumlingDevelopTrait") return false;
                if (_e.detail.data.fittingTraits === 2) return true;
                return false;
            }
        },
        {
            title: "Neuanfang",
            description: "Reiße eine Arbeitsstation ab",
            icon: "Achievement_Neuanfang.svg",
            reward: 10,
            checkCompleted: function (_e): boolean {
                if (_e.detail.type !== "deconstructWorkbench") return false;
                return true;
            }
        },
        {
            title: "Umschulung",
            description: "Ein Eumling entwickelt eine Eigenschaft an einer eigentlich unpassenden Station",
            icon: "Achievement_Umschulung.svg",
            reward: 10,
            checkCompleted: function (_e): boolean {
                if (_e.detail.type !== "eumlingDevelopTrait") return false;
                return true;
            }
        },
        {
            title: "Treue Mitarbeit",
            description: "Lass einen Eumling für insgesamt 4 Minuten arbeiten",
            icon: "Achievement_Treue_Mitarbeit.svg",
            reward: 15,
            checkCompleted: function (_e): boolean {
                if (_e.detail.type !== "eumlingWorking") return false;
                if (_e.detail.data.workTime > 4 * 60 * 1000) return true;
                return false;
            }
        },
        {
            title: "Allrounder",
            description: "Ein Eumling hat 4 Eigenschaften.",
            icon: "Achievement_Allrounder.svg",
            reward: 20,
            checkCompleted: function (_e): boolean {
                if (_e.detail.type !== "eumlingDevelopTrait") return false;
                if (_e.detail.data.traits.size === 4) return true;
                return false;
            }
        },
        {
            title: "Bis zur Unendlichkeit!",
            description: "Schmeiß einen Eumling bis zur Unendlichkeit, und noch ein bisschen weiter",
            icon: "Achievement_Unendlichkeit.svg",
            reward: 10,
            checkCompleted: function (_e): boolean {
                if (_e.detail.type !== "thrownEumlingTopPosition") return false;
                if (_e.detail.data.y > 6.5) return true;
                return false;
            }
        },
        {
            title: "Gefunden!",
            description: "Finde alle 3 Eumling-Statuen",
            icon: "Achievement_Statuen.svg",
            reward: 10,
            secret: true,
            persistentData: new Set(),
            checkCompleted: function (_e): boolean {
                if (_e.detail.type !== "clickStatue") return false;
                let data: Set<ƒ.Node> = (<Achievement>this).persistentData;
                data.add(_e.detail.data.statue);
                if (data.size >= 3) return true;
                return false;
            }
        },
    ]

    export const maxAchievablePoints: number = achievements.reduce((prev, curr) => prev + curr.reward, 0)

    function popupAchievement(_a: Achievement): HTMLElement {
        const div = createElementAdvanced("div", {
            innerHTML: `
            <span class="achievement-title">${_a.title}</span>
            <span class="achievement-description">${_a.description}</span>
            <span class="achievement-icon"><img src="Assets/UI/Achievements/${_a.icon}"></span>`,
            classes: ["achievement-popup", "stone-tablet"]
        })

        document.getElementById("achievement-overlay").appendChild(div);

        let timeout = setTimeout(removeAchievementPopup, Math.max(10000, _a.reward * 20));
        div.addEventListener("click", removeAchievementPopup);

        function removeAchievementPopup() {
            div.removeEventListener("click", removeAchievementPopup);
            clearTimeout(timeout);
            div.style.animation = "none";
            requestAnimationFrame(() => {
                div.style.animation = "achievement-in 1s backwards reverse ease";
                div.addEventListener("animationend", () => {
                    div.remove();
                })
            })
        }
        return div;

    }

    function createFlyingPoints(_div: HTMLElement, _amt: number) {
        _div.addEventListener("animationend", flyingPointCreation)
        _div.addEventListener("animationcancel", addPoints);

        async function flyingPointCreation() {
            _div.removeEventListener("animationcancel", addPoints);
            _div.removeEventListener("animationend", flyingPointCreation);
            let rect = _div.getBoundingClientRect();
            // let targetRect = document.getElementById("game-info-wrapper").getBoundingClientRect();
            for (let i = 0; i < _amt; i++) {
                let img = createElementAdvanced("img", { classes: ["flying-point", "no-interact"] });
                img.src = "Assets/UI/Icons/SingleCurrency.svg";
                img.style.left = rect.x + rect.width * Math.random() + "px";
                img.style.top = rect.y + rect.height * Math.random() + "px";
                document.body.appendChild(img);
                setTimeout(() => {
                    img.style.left = "0";
                    img.style.top = "100vh";
                    setTimeout(() => {
                        GameData.addPoints(1);
                        img.remove();
                    }, 1000)
                }, 1000)
                await waitMS(20);
            }
        }

        function addPoints() {
            GameData.addPoints(_amt)
        }
    }

    function updateAchievementList() {
        const list = document.getElementById("achievement-list");

        let newElements: HTMLElement[] = [];
        for (let a of achievements) {
            const div = createElementAdvanced("div", {
                classes: ["achievement", "stone-tablet"],
                innerHTML: `
                <span class="achievement-icon"> <img src="Assets/UI/Achievements/${a.icon}"/></span>
                <span class="achievement-title">${a.secret && !a.achieved ? "???" : a.title}</span>
                <div class="achievement-divider"></div>
                <span class="achievement-description">${a.secret && !a.achieved ? "???" : a.description}</span>
                <span class="achievement-reward"><img src="Assets/UI/Icons/Currency.svg">+${a.reward}</span>`
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