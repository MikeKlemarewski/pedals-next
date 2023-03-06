import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

interface Props {
  onChange(audioInput: string): void;
  selectedInput?: string;
}

export const keyboardMediaInfo: MediaDeviceInfo = {
  deviceId: 'keyboard',
  groupId: '-1',
  kind: 'audioinput',
  label: 'Keyboard',
  toJSON: () => null,
}

const AudioInputPicker = ({
  onChange,
  selectedInput,
} : Props) => {
  const [inputs, setInputs] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    navigator
      .mediaDevices
      .getUserMedia({ video: false, audio: true })

    navigator.mediaDevices.enumerateDevices().then(devices => {
      const audioInputs : MediaDeviceInfo[] = [];

      devices.forEach(device => {
        if (device.kind === 'audioinput') {
          audioInputs.push(device.toJSON())
        }
      });

      audioInputs.push(keyboardMediaInfo);

      setInputs(audioInputs);

      if (!selectedInput) {
        onChange(audioInputs[0].deviceId);
      }
    });
  }, []);

  const inputOptions = useMemo(() =>
    inputs.map(input => (
      <MenuItem
        key={input.deviceId}
        value={input.deviceId}
      >
          {input.label}
      </MenuItem>
    ))
  , [inputs]);

  if (inputOptions.length === 0) {
    return null;
  }

  const handleInputSelect = (event: SelectChangeEvent<string>) => {
    const input = inputs.find(input => input.deviceId === event.target.value);

    if (input) {
      onChange(input.deviceId);
    }
  }

  return (
    <FormControl
      size="small"
      sx={{
        mx: 1,
        minWidth: 100,
      }}
    >
      <InputLabel id="audio-input-select">Input</InputLabel>
      <Select
        labelId="audio-input-select"
        id="audio-input-select"
        label="Input"
        value={selectedInput}
        onChange={handleInputSelect}
      >
        {inputOptions}
      </Select>
    </FormControl>
  )
}

export default AudioInputPicker;
