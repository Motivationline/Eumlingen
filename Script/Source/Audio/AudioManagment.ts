/// <reference path="../Plugins/Utils.ts" />

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
            for (let channel of enumToArray(AUDIO_CHANNEL)) {
                this.gainNodes[channel] = ƒ.AudioManager.default.createGain();
                if(channel === AUDIO_CHANNEL.MASTER){
                    this.gainNodes[channel].connect(ƒ.AudioManager.default.gain);
                } else {
                    this.gainNodes[channel].connect(this.gainNodes[AUDIO_CHANNEL.MASTER]);
                }
            }
        }

        static addAudioCmpToChannel(_cmpAudio: ComponentAudioMixed, _channel: AUDIO_CHANNEL) {
            _cmpAudio.setGainTarget(AudioManager.Instance.gainNodes[_channel]);
        }
    }
}