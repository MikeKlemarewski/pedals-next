import { Pause, PlayArrow } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import AudioInputPicker, { keyboardMediaInfo } from "components/audioInputPicker";
import Keyboard from "components/keyboard";
import PatchCable from "components/patchCable";
import Pedal from "components/pedal/base";
import DistortionPedal from "components/pedal/distortion";
import OscillatorPedal from "components/pedal/oscillator";
import OutputPedal from "components/pedal/output";
import VolumePedal from "components/pedal/volume";
import PedalBoardCanvas from "components/pedalBoardCanvas";
import PedalPalette from "components/pedalPalette";
import useAudioStream from "hooks/useAudioStream";
import useOscillator from "hooks/useOscillator";
import { useCallback, useEffect, useState } from "react";

export default function PedalBoard() {

  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [selectedInput, setSelectedInput] = useState<string>();
  const [pedals, setPedals] = useState<Pedal[]>([]);
  const [cables, setCables] = useState<PatchCable[]>([]);
  const [inputPedal, setInputPedal] = useState<Pedal | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const streamNode = useAudioStream(audioCtx, selectedInput);
  const { oscillator, playFrequency, stopPlaying } = useOscillator(audioCtx);

  useEffect(() => {
      // @ts-ignore
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext({ latencyHint: "interactive", sampleRate: 44100 });

    audioCtx.suspend();

    setPedals([
      new OscillatorPedal({ x: 200, y: 10, audioCtx }),
      new VolumePedal({ x: 400, y: 10, audioCtx }),
      new DistortionPedal({ x: 600, y: 10, audioCtx }),
      new OutputPedal({ x: 800, y: 10, audioCtx }),
    ]);

    setCables([
      new PatchCable(100, 200),
      new PatchCable(400, 300),
      new PatchCable(700, 400),
    ])

    setAudioCtx(audioCtx);

    return () => {
      audioCtx.close();
    };
  }, [])

  useEffect(() => {
    if (!audioCtx || !oscillator || selectedInput !== keyboardMediaInfo.deviceId) {
      return;
    }

    const newInputPedal = new Pedal({ x: 10, y: 10, audioCtx, audioNode: oscillator });

    if (inputPedal && inputPedal.outputCable) {
      const outputCable = inputPedal.outputCable;

      outputCable.unplugLeftSide();
      outputCable.plugLeftSideIntoPedal(newInputPedal);
    }

    setPedals([newInputPedal, ...pedals.filter(p => p !== inputPedal)])
    setInputPedal(newInputPedal);
  }, [oscillator, audioCtx, selectedInput])

  useEffect(() => {
    if (!audioCtx || !streamNode) {
      return;
    }

    const newInputPedal = new Pedal({ x: 10, y: 10, audioCtx, audioNode: streamNode });

    if (inputPedal && inputPedal.outputCable) {
      const outputCable = inputPedal.outputCable;

      outputCable.unplugLeftSide();
      outputCable.plugLeftSideIntoPedal(newInputPedal);
    }

    setInputPedal(newInputPedal);
    setPedals([newInputPedal, ...pedals.filter(p => p !== inputPedal)])
  }, [audioCtx, streamNode])

  const handlePlayClick = useCallback(() => {
    if (!audioCtx) {
      return;
    }

    if (audioCtx.state === 'running') {
      audioCtx.suspend();
      setIsPlaying(false);
      return;
    }

    audioCtx.resume();
    setIsPlaying(true);
  }, [audioCtx]);

  const addPedal = useCallback((pedalType: string) => {
    if (!audioCtx) return;

    const pedalCtors: Record<string, typeof Pedal> = {
      oscillator: OscillatorPedal,
      volume: VolumePedal,
      distortion: DistortionPedal,
      output: OutputPedal,
    };

    const Ctor = pedalCtors[pedalType];
    if (!Ctor) return;

    const offset = pedals.length * 30;
    const newPedal = new Ctor({ x: 200 + offset, y: 10 + offset, audioCtx });
    setPedals((prev) => [...prev, newPedal]);
  }, [audioCtx, pedals.length]);

  const addCable = useCallback(() => {
    const offset = cables.length * 40;
    const newCable = new PatchCable(100 + offset, 200 + offset);
    setCables((prev) => [...prev, newCable]);
  }, [cables.length]);

  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 1
      }}
    >
      <Box sx={{
        mt: 2,
        mb: 1,
        mx: 1,
        display: 'flex',
      }}>
        <Button
          variant={isPlaying ? "outlined" : "contained"}
          startIcon={isPlaying ? <Pause /> : <PlayArrow />}
          onClick={handlePlayClick}
          disabled={selectedInput === keyboardMediaInfo.deviceId}
          sx={{
            maxHeight: 40,
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <AudioInputPicker
          selectedInput={selectedInput}
          onChange={setSelectedInput}
        />
        {selectedInput === keyboardMediaInfo.deviceId && (
          <Keyboard
            playFrequency={playFrequency}
            stopPlaying={stopPlaying}
          />
        )}
      </Box>
      <Box
        sx={{
          display: 'flex',
          height: 1,
          minHeight: 0,
        }}
      >
        <PedalPalette onSelect={addPedal} onAddCable={addCable} />
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <PedalBoardCanvas pedals={pedals} cables={cables} />
        </Box>
      </Box>
    </Box>
  )
}
