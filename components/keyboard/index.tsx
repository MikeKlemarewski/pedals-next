import { Box, Card, CardActionArea } from '@mui/material';
import React, { useEffect, useMemo } from 'react';

interface FrequencyMap {
  [note: string]: number
}

const notes: FrequencyMap = {
  'C3': 130.81,
  'C3#': 138.59,
  'D3': 146.83,
  'D3#': 155.56,
  'E3': 164.81,
  'F3': 174.61,
  'F3#': 185.00,
  'G3': 196.00,
  'G3#': 207.65,
  'A3': 220.00,
  'A3#': 233.08,
  'B3': 246.94,
  'C4': 261.63,
  'C4#': 277.18,
  'D4': 293.66,
  'D4#': 311.13,
  'E4': 329.63,
  'F4': 349.23,
  'F4#': 369.99,
  'G4': 392.00,
  'G4#': 415.30,
  'A4': 440.00,
  'A4#': 466.16,
  'B4': 493.88,
  'C5': 523.25,
}

interface Props {
  playFrequency(hertz: number): void;
  stopPlaying(): void;
}

const Keyboard = ({
  playFrequency,
  stopPlaying,
} : Props) => {
  useEffect(() => {
    window.addEventListener('mouseup', stopPlaying);

    return () => window.removeEventListener('mouseup', stopPlaying);
  }, [stopPlaying]);

  const keys = useMemo(() =>
    Object.keys(notes).map(note => (
      <Card
        key={notes[note]}
        elevation={4}
        sx={{
          width: note.endsWith('#') ? 25 : 35,
          height: note.endsWith('#') ? 90 : 100,
          mx: 0.2,
        }}
      >
        <CardActionArea
          sx={{
            height: 1,
            color: note.endsWith('#') ? 'white' : 'black',
            backgroundColor: note.endsWith('#') ? 'black' : 'white',
            textAlign: 'center',
          }}
          onMouseDown={() => playFrequency(notes[note])}
        >
          {note}
        </CardActionArea>
      </Card>
    ))
  , [playFrequency]);

  return (
    <Box sx={{ display: 'flex' }}>
      {keys}
    </Box>
  )
}

export default Keyboard;
