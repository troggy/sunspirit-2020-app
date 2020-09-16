import { h } from "preact";
import { PlayIcon, StopIcon } from "./icons";
import { useState, useContext, useCallback, useMemo } from "preact/hooks";
import styled from "styled-components";
import { PlayerContext } from "../player-context";
import { useEffect } from "react";

export type PlayButtonProps = {
  data: Blob;
};

const Button = styled.a`
  width: 34px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

export default ({ data }: PlayButtonProps) => {
  const [playing, setPlaying] = useState<boolean>(false);

  const { src, onPlay, onStop } = useContext(PlayerContext);

  const audioUrl = useMemo(() => URL.createObjectURL(data), [data]);

  useEffect(() => {
    if (src === audioUrl) return;
    setPlaying(false);
  }, [src, audioUrl]);

  const togglePlay = useCallback(() => {
    if (playing) {
      onStop();
      setPlaying(false);
      return;
    }

    setPlaying(true);
    onPlay(audioUrl);
  }, [audioUrl, playing, onStop, onPlay]);

  return (
    <Button onClick={togglePlay}>
      {!playing && <PlayIcon />}
      {playing && <StopIcon />}
    </Button>
  );
};
