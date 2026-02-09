import BasePedal from "./base";

export default class OscillatorPedal extends BasePedal {
  constructor(args: ConstructorParameters<typeof BasePedal>[0]) {
    super({ ...args, color: '#2196F3', label: 'OSC' });
  }

  setupAudioNode(audioCtx: AudioContext) {
    const oscillator = audioCtx.createOscillator();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(350, audioCtx.currentTime); // value in hertz
    oscillator.start();

    return oscillator;
  }
}
