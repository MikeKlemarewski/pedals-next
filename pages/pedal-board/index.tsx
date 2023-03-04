import { PlayArrow } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import AudioInputPicker from "components/audioInputPicker";
import PatchCable from "components/patchCable";
import Pedal from "components/pedal/base";
import DistortionPedal from "components/pedal/distortion";
import OutputPedal from "components/pedal/output";
import VolumePedal from "components/pedal/volume";
import PedalBoardCanvas from "components/pedalBoardCanvas";
import useAudioStream from "hooks/useAudioStream";
import { useCallback, useEffect, useState } from "react";

export default function PedalBoard() {

  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [selectedInput, setSelectedInput] = useState<MediaDeviceInfo | null>(null);
  const [pedals, setPedals] = useState<Pedal[]>([]);
  const [cables, setCables] = useState<PatchCable[]>([]);
  const [inputPedal, setInputPedal] = useState<Pedal | null>(null);

  const streamNode = useAudioStream(audioCtx, selectedInput?.deviceId);

  useEffect(() => {
      // @ts-ignore
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

    audioCtx.suspend();

    setPedals([
      new VolumePedal({ x: 200, y: 10, audioCtx }),
      new DistortionPedal({ x: 400, y: 10, audioCtx }),
      new OutputPedal({ x: 600, y: 10, audioCtx, color: "#444444" }),
    ]);

    setCables([
      new PatchCable(100, 200),
      new PatchCable(400, 300),
      new PatchCable(700, 400),
    ])

    setAudioCtx(audioCtx);
  }, [])

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

    console.log({ base: audioCtx.baseLatency, output: audioCtx.outputLatency })

    if (audioCtx.state === 'running') {
      audioCtx.suspend();
      return;
    }

    audioCtx.resume();
  }, [audioCtx]);

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
      }}>
        <Button
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={handlePlayClick}
        >
          Play
        </Button>
        <AudioInputPicker
          selectedInput={selectedInput}
          onChange={setSelectedInput}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: 1,
        }}
      >
        <PedalBoardCanvas pedals={pedals} cables={cables} />
      </Box>
    </Box>
  )
}
