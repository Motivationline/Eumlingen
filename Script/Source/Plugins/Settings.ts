namespace Script {
    // import ƒ = FudgeCore;
    export type Setting = SettingCategory | SettingNumber | SettingString;

    interface SettingsBase {
        type: string;
        name: string;
    }

    export interface SettingCategory extends SettingsBase {
        type: "category";
        settings: Setting[];
    }

    export interface SettingString extends SettingsBase {
        type: "string";
        value: string;
    }
    export interface SettingNumber extends SettingsBase {
        type: "number";
        value: number;
        min: number;
        max: number;
        step: number;
    }

    export class Settings {
        private static settings: Setting[] = [];

        static proxySetting<T extends Setting>(_setting: T, onValueChange: (_old: any, _new: any) => void): T {
            return new Proxy(_setting, {
                set(target, prop, newValue, receiver) {
                    if (prop === "value")
                        onValueChange((<any>target)[prop], newValue);
                    return Reflect.set(target, prop, newValue, receiver);
                },
            })
        }

        static addSettings(..._settings: Setting[]) {
            _settings.forEach(setting => this.settings.push(setting));
        }

        static generateHTML(_settings: Setting[] = this.settings): HTMLElement {
            const wrapper = createElementAdvanced("div", { classes: ["settings-wrapper"], innerHTML: "<h2 class='h'>Einstellungen</h2>"});

            for (let setting of _settings) {
                wrapper.appendChild(this.generateSingleHTML(setting))
            }

            return wrapper;
        }

        private static generateSingleHTML(_setting: Setting): HTMLElement {
            let element: HTMLElement;
            switch (_setting.type) {
                case "string": {
                    element = this.generateStringInput(_setting);
                    break;
                }
                case "number": {
                    element = this.generateNumberInput(_setting)
                    break;
                }
                case "category": {
                    element = createElementAdvanced("div", { classes: ["settings-category"], innerHTML: `<span class="settings-category-name">${_setting.name}</span>` })
                    for (let setting of _setting.settings) {
                        element.appendChild(this.generateSingleHTML(setting));
                    }
                    break;
                }
                default: {
                    element = createElementAdvanced("div", { innerHTML: "Unknown Setting Type", classes: ["settings-unknown"] })
                }
            }

            return element;
        }

        private static generateStringInput(_setting: SettingString): HTMLElement {
            const id: string = randomString(10);
            const element = createElementAdvanced("label", { classes: ["settings-string-wrapper", "settings-label"], innerHTML: `<span class="settings-string-label settings-label-text">${_setting.name}</span>`, attributes: [["for", id]] });
            const input = createElementAdvanced("input", { classes: ["settings-string-input", "settings-input"], attributes: [["type", "string"], ["value", _setting.value], ["name", id]], id })

            element.appendChild(input);

            input.addEventListener("change", () => {
                _setting.value = input.value;
            });
            return element;
        }
        private static generateNumberInput(_setting: SettingNumber): HTMLElement {
            const id: string = randomString(10);
            const element = createElementAdvanced("label", { classes: ["settings-number-wrapper", "settings-label"], innerHTML: `<span class="settings-number-label settings-label-text">${_setting.name}</span>`, attributes: [["for", id]] });
            const input = createElementAdvanced("input", {
                classes: ["settings-number-input", "settings-input"],
                attributes: [["type", "range"], ["value", _setting.value.toString()], ["name", id], ["min", _setting.min.toString()], ["max", _setting.max.toString()], ["step", _setting.step.toString()]],
                id
            });

            element.appendChild(input);

            input.addEventListener("change", () => {
                _setting.value = Number(input.value);
            });
            return element;
        }
    }
}