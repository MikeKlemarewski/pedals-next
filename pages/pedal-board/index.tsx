import { PlayArrow } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import PatchCable from "components/patchCable";
import Pedal from "components/pedal/base";
import DistortionPedal from "components/pedal/distortion";
import OscillatorPedal from "components/pedal/oscillator";
import OutputPedal from "components/pedal/output";
import VolumePedal from "components/pedal/volume";
import PedalBoardCanvas from "components/pedalBoardCanvas";
import { useCallback, useEffect, useState } from "react";

export default function PedalBoard() {

  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [pedals, setPedals] = useState<Pedal[]>([]);
  const [cables, setCables] = useState<PatchCable[]>([]);

  useEffect(() => {
      // @ts-ignore
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();

    audioCtx.suspend();

    setPedals([
      new OscillatorPedal({ x: 10, y: 10, audioCtx, color: "#AAAAAA" }),
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

  const handlePlayClick = useCallback(() => {
    if (!audioCtx) {
      return;
    }

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
        my: 1,
        mx: 1,
      }}>
        <Button
          variant="contained"
          startIcon={<PlayArrow />}
          onClick={handlePlayClick}
        >
          Play
        </Button>
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
