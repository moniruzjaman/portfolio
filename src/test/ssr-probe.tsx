import { renderToString } from "react-dom/server";
import App from "@/App";

/** Renders the real <App/> at `path` (test-only; never imported by the shipped bundle). */
export const renderAt = (path: string) => renderToString(<App ssrPath={path} />);
