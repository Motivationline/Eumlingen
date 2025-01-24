/// <reference path="../Plugins/UpdateScriptComponent.ts" />


namespace Script {
    import ƒ = FudgeCore;
    const globalSoundEmitter = new EventTarget();

    @ƒ.serialize
    export abstract class SoundEmitter extends UpdateScriptComponent {
        public static readonly iSubclass: number = ƒ.Component.registerSubclass(SoundEmitter);
        protected singleton: boolean = false;

        @ƒ.serialize(Number)
        volume: number = 1;
        @ƒ.serialize(Boolean)
        local: boolean = true;
        @ƒ.serialize(Boolean)
        addRandomness: boolean = true; //TODO: turn this from boolean to number for variance, aka +/- this value
        @ƒ.serialize(AUDIO_CHANNEL)
        channel: AUDIO_CHANNEL = AUDIO_CHANNEL.MASTER;
        @ƒ.serialize(ƒ.Matrix4x4)
        mtxPivot: ƒ.Matrix4x4 = new ƒ.Matrix4x4();
        @ƒ.serialize(ƒ.Vector3)
        boxSize: ƒ.Vector3 = new ƒ.Vector3();
        @ƒ.serialize(Boolean)
        surfaceOfBoxOnly: boolean = false;

        // lots of different audios because we can't do arrays in the editor yet.
        @ƒ.serialize(ƒ.Audio)
        s0: ƒ.Audio;
        @ƒ.serialize(ƒ.Audio)
        s1: ƒ.Audio;
        @ƒ.serialize(ƒ.Audio)
        s2: ƒ.Audio;
        @ƒ.serialize(ƒ.Audio)
        s3: ƒ.Audio;
        @ƒ.serialize(ƒ.Audio)
        s4: ƒ.Audio;
        @ƒ.serialize(ƒ.Audio)
        s5: ƒ.Audio;
        @ƒ.serialize(ƒ.Audio)
        s6: ƒ.Audio;
        @ƒ.serialize(ƒ.Audio)
        s7: ƒ.Audio;
        @ƒ.serialize(ƒ.Audio)
        s8: ƒ.Audio;
        @ƒ.serialize(ƒ.Audio)
        s9: ƒ.Audio;
        @ƒ.serialize(ƒ.Audio)
        s10: ƒ.Audio;
        @ƒ.serialize(ƒ.Audio)
        s11: ƒ.Audio;
        @ƒ.serialize(ƒ.Audio)
        s12: ƒ.Audio;
        @ƒ.serialize(ƒ.Audio)
        s13: ƒ.Audio;
        @ƒ.serialize(ƒ.Audio)
        s14: ƒ.Audio;
        @ƒ.serialize(ƒ.Audio)
        s15: ƒ.Audio;
        @ƒ.serialize(ƒ.Audio)
        s16: ƒ.Audio;
        @ƒ.serialize(ƒ.Audio)
        s17: ƒ.Audio;
        @ƒ.serialize(ƒ.Audio)
        s18: ƒ.Audio;
        @ƒ.serialize(ƒ.Audio)
        s19: ƒ.Audio;


        #audioCmp: ComponentAudioMixed;
        #audios: ƒ.Audio[] = [];

        start(_e: CustomEvent<UpdateEvent>): void {
            this.#audioCmp = new ComponentAudioMixed(undefined, false, false, undefined, this.channel);
            if (this.local) {
                this.node.addComponent(this.#audioCmp);
            } else {
                this.#audioCmp.connect(true);
            }
            this.#audioCmp.volume = this.volume;

            if (this.s0) this.#audios.push(this.s0);
            if (this.s1) this.#audios.push(this.s1);
            if (this.s2) this.#audios.push(this.s2);
            if (this.s3) this.#audios.push(this.s3);
            if (this.s4) this.#audios.push(this.s4);
            if (this.s5) this.#audios.push(this.s5);
            if (this.s6) this.#audios.push(this.s6);
            if (this.s7) this.#audios.push(this.s7);
            if (this.s8) this.#audios.push(this.s8);
            if (this.s9) this.#audios.push(this.s9);
            if (this.s10) this.#audios.push(this.s0);
            if (this.s11) this.#audios.push(this.s1);
            if (this.s12) this.#audios.push(this.s2);
            if (this.s13) this.#audios.push(this.s3);
            if (this.s14) this.#audios.push(this.s4);
            if (this.s15) this.#audios.push(this.s5);
            if (this.s16) this.#audios.push(this.s6);
            if (this.s17) this.#audios.push(this.s7);
            if (this.s18) this.#audios.push(this.s8);
            if (this.s19) this.#audios.push(this.s9);
        }

        playRandomSound = () => {
            if (!this.active) return;
            let audio = randomArrayElement(this.#audios);
            if (!audio) return;
            this.#audioCmp.setAudio(audio);
            if (this.addRandomness)
                this.#audioCmp.playbackRate = randomRange(0.75, 1.25);
            this.#audioCmp.mtxPivot.copy(this.mtxPivot);
            this.#audioCmp.mtxPivot.translate(this.getTranslation());
            this.#audioCmp.play(true);
        }

        private getTranslation(): ƒ.Vector3 {
            const result = ƒ.Recycler.reuse(ƒ.Vector3);

            result.set(
                randomRange(0, this.boxSize.x) - this.boxSize.x / 2,
                randomRange(0, this.boxSize.y) - this.boxSize.y / 2,
                randomRange(0, this.boxSize.z) - this.boxSize.z / 2
            )
            if (this.surfaceOfBoxOnly) {
                const rand = Math.floor(Math.random() * 3);
                if (rand === 0) {
                    result.x = Math.sign(result.x) * this.boxSize.x / 2
                } else if (rand === 1) {
                    result.y = Math.sign(result.y) * this.boxSize.y / 2
                } else if (rand === 2) {
                    result.z = Math.sign(result.z) * this.boxSize.z / 2
                }
            }
            ƒ.Recycler.store(result);
            return result;
        }

        drawGizmos(_cmpCamera?: ƒ.ComponentCamera): void {
            ƒ.Gizmos.drawWireCube((new ƒ.Matrix4x4()).multiply(this.node.mtxWorld).multiply(this.mtxPivot).scale(this.boxSize), ƒ.Color.CSS("blue"));
        }
    }

    @ƒ.serialize
    export class SoundEmitterInterval extends SoundEmitter {
        public static readonly iSubclass: number = ƒ.Component.registerSubclass(SoundEmitterInterval);
        @ƒ.serialize(Number)
        minWaitTimeMS: number;
        @ƒ.serialize(Number)
        maxWaitTimeMS: number;
        start(_e: CustomEvent<UpdateEvent>): void {
            super.start(_e);
            this.startTimer();
        }

        private startTimer = () => {
            const delay = randomRange(this.minWaitTimeMS, this.maxWaitTimeMS);
            ƒ.Time.game.setTimer(delay, 1, this.startTimer);
            ƒ.Time.game.setTimer(delay, 1, this.playRandomSound);
        }
    }
    @ƒ.serialize
    export class SoundEmitterOnEvent extends SoundEmitter {
        public static readonly iSubclass: number = ƒ.Component.registerSubclass(SoundEmitterOnEvent);
        @ƒ.serialize(String)
        event: string;

        start(_e: CustomEvent<UpdateEvent>): void {
            super.start(_e);
            globalSoundEmitter.addEventListener(this.event, this.playRandomSound);
            this.addEventListener(this.event, this.playRandomSound);
            this.node.addEventListener(this.event, this.playRandomSound);
        }
    }
}