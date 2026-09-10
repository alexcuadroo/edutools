import type { ReactEventHandler } from "react";

declare module "react" {
  interface DOMAttributes<T> {
    onFullscreenChange?: ReactEventHandler<T> | undefined;
    onFullscreenChangeCapture?: ReactEventHandler<T> | undefined;
    onFullscreenError?: ReactEventHandler<T> | undefined;
    onFullscreenErrorCapture?: ReactEventHandler<T> | undefined;
  }
}
