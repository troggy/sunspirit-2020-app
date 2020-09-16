import { createContext } from "preact";

export type PlayerContextType = {
  src: string;
  onPlay: (src: string) => void;
  onStop: () => void;
};

export const defaultPlayerState = {
  src: "",
  /* eslint-disable @typescript-eslint/no-empty-function */
  onPlay: (_: string) => {},
  onStop: () => {}
  /* eslint-enable @typescript-eslint/no-empty-function */
};

export const PlayerContext = createContext<PlayerContextType>(
  defaultPlayerState
);
