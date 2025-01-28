/// <reference path="../Plugins/Utils.ts" />
/// <reference path="../Plugins/Settings.ts" />

namespace Script {
    import ƒ = FudgeCore;

    export enum AUDIO_CHANNEL {
        MASTER,
        EUMLING,
        ENVIRONMENT,
    }

    export class AudioManager {
        private static Instance: AudioManager = new AudioManager();
        private gainNodes: Partial<Record<AUDIO_CHANNEL, GainNode>> = {};

        private constructor() {
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            if (AudioManager.Instance) return AudioManager.Instance;
            const settingCategory: SettingCategory = { name: "Sounds", settings: [], type: "category" };
            for (let channel of enumToArray(AUDIO_CHANNEL)) {
                this.gainNodes[channel] = ƒ.AudioManager.default.createGain();
                if (channel === AUDIO_CHANNEL.MASTER) {
                    this.gainNodes[channel].connect(ƒ.AudioManager.default.gain);
                } else {
                    this.gainNodes[channel].connect(this.gainNodes[AUDIO_CHANNEL.MASTER]);
                }
                let setting: SettingNumber = { type: "number", max: 1, min: 0, name: AUDIO_CHANNEL[channel], step: 0.01, value: 1 };
                setting = Settings.proxySetting(setting, (_old: number, _new: number) => { AudioManager.setChannelVolume(channel, _new) });
                settingCategory.settings.push(setting);
            }

            Settings.addSettings(settingCategory);
        }

        static addAudioCmpToChannel(_cmpAudio: ComponentAudioMixed, _channel: AUDIO_CHANNEL) {
            _cmpAudio.setGainTarget(AudioManager.Instance.gainNodes[_channel]);
        }

        static setChannelVolume(_channel: AUDIO_CHANNEL, _volume: number) {
            let channel = AudioManager.Instance.gainNodes[_channel];
            if (!channel) return;
            channel.gain.value = _volume;
        }
    }
}