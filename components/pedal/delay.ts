import BasePedal from "./base";

export const COLOR = '#761aa3';

export default class DelayPedal extends BasePedal {
  constructor(args: ConstructorParameters<typeof BasePedal>[0]) {
    super({ ...args, color: COLOR, label: 'DELAY' });
  }

  setupAudioNodes(audioCtx: AudioContext) {
    const inputGain = audioCtx.createGain();

    const delay = audioCtx.createDelay(0.08);
    const feedback = audioCtx.createGain();
    feedback.gain.value = 0.8;

    inputGain.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);

    return [inputGain, feedback, delay];
  }
}
