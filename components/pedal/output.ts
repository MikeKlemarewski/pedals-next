import BasePedal from "./base";

export default class OutputPedal extends BasePedal {
  setupAudioNode(audioCtx: AudioContext) {
    return audioCtx.destination;
  }
}
