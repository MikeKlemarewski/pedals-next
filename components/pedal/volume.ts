import BasePedal from "./base";

export default class VolumePedal extends BasePedal {
  constructor(args: ConstructorParameters<typeof BasePedal>[0]) {
    super({ ...args, color: '#4CAF50', label: 'VOL' });
  }

  setupAudioNode(audioCtx: AudioContext) {
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(2, audioCtx.currentTime);

    return gainNode;
  }
}
