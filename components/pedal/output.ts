import BasePedal from "./base";

export default class OutputPedal extends BasePedal {
  constructor(args: ConstructorParameters<typeof BasePedal>[0]) {
    super({ ...args, color: '#444444', label: 'OUT' });
  }

  setupAudioNodes(audioCtx: AudioContext) {
    return [audioCtx.destination];
  }
}
