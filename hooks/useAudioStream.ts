import { keyboardMediaInfo } from "components/audioInputPicker";
import { useEffect, useRef, useState } from "react";

const useAudioStream = (audioCtx: AudioContext | null, audioInputDeviceId: string | undefined) => {
  const stream = useRef<MediaStream | null>(null);
  const [streamNode, setStreamNode] = useState<MediaStreamAudioSourceNode | null>(null);


  useEffect(() => {
    if (stream.current) {
      stream.current.getAudioTracks()[0].stop();
    }

    const constraints = {
      audio: {
        deviceId: audioInputDeviceId ? { exact: audioInputDeviceId } : undefined,
        autoGainControl: false,
        echoCancellation: false,
        noiseSuppression: false,
        latency: 0.02,
      }
    };

    navigator.mediaDevices.getUserMedia(constraints).then(s => {
      stream.current = s;

      if (!audioCtx) {
        return;
      }

      streamNode?.disconnect();

      setStreamNode(audioCtx.createMediaStreamSource(stream.current));
    }).catch(e => {
      // This is our fake keyboard being selected. Ignore the error.
      if (e instanceof DOMException && e.name === 'OverconstrainedError' && audioInputDeviceId === keyboardMediaInfo.deviceId) {
        return;
      }

      throw e;
    });
  }, [audioCtx, audioInputDeviceId]);


  return streamNode;
}

export default useAudioStream;
