import { createContext } from "preact";

/* eslint-disable @typescript-eslint/no-empty-function */
export const DownloadContext = createContext<() => void>(() => {});
/* eslint-enable @typescript-eslint/no-empty-function */
