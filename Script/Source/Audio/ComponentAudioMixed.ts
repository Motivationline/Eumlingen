namespace Script {
    import ƒ = FudgeCore;

    @ƒ.serialize
    export class ComponentAudioMixed extends ƒ.ComponentAudio {
        public static readonly iSubclass: number = ƒ.Component.registerSubclass(ComponentAudioMixed);
        #channel: AUDIO_CHANNEL = AUDIO_CHANNEL.MASTER;

        private gainTarget: AudioNode;
        private isConnected: boolean;

        constructor(_audio?: ƒ.Audio, _loop?: boolean, _start?: boolean, _audioManager: ƒ.AudioManager = ƒ.AudioManager.default, _channel: AUDIO_CHANNEL = AUDIO_CHANNEL.MASTER) {
            super(_audio, _loop, _start, _audioManager);
            this.gainTarget = _audioManager.gain;
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.channel = _channel;
        }

        @ƒ.serialize(AUDIO_CHANNEL)
        get channel(): AUDIO_CHANNEL {
            return this.#channel;
        }

        set channel(_channel: AUDIO_CHANNEL) {
            this.#channel = _channel;
            AudioManager.addAudioCmpToChannel(this, this.#channel);
        }

        setGainTarget(node: AudioNode) {
            if (this.isConnected) {
                this.gain.disconnect(this.gainTarget);
            }
            this.gainTarget = node;
            if (this.isConnected) {
                this.gain.connect(this.gainTarget);
            }
        }

        public connect(_on: boolean): void {
            if (_on)
                this.gain.connect(this.gainTarget ?? this.audioManager.gain);
            else
                this.gain.disconnect(this.gainTarget ?? this.audioManager.gain);

            this.isConnected = _on;
        }

        drawGizmos(): void {
            if (this.isPlaying)
                super.drawGizmos();
        }
    }
}