import BasePedal from "./base";

export default class OscillatorPedal extends BasePedal {
  setupAudioNode(audioCtx: AudioContext) {
    const oscillator = audioCtx.createOscillator();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(350, audioCtx.currentTime); // value in hertz
    oscillator.start();

    return oscillator;
  }
}
