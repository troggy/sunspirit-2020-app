import { h } from "preact";
import { PlayIcon, StopIcon } from "./icons";
import { useState } from "preact/hooks";
import { useLayoutEffect } from "react";
import styled from "styled-components";

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
  const [audio, setAudio] = useState<any>(null);

  useLayoutEffect(() => {
    setAudio(new Audio(URL.createObjectURL(data)));
  }, [data]);

  const togglePlay = () => {
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    audio.play();
    setPlaying(true);
  };

  return (
    <Button onClick={togglePlay}>
      {!playing && <PlayIcon />}
      {playing && <StopIcon />}
    </Button>
  );
};
