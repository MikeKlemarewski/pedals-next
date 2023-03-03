import BasePedal from "./base";

export default class VolumePedal extends BasePedal {
  setupAudioNode(audioCtx: AudioContext) {
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(2, audioCtx.currentTime);

    return gainNode;
  }
}
