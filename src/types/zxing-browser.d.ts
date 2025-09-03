declare module '@zxing/browser' {
    export class BrowserMultiFormatReader {
        /**
         * hints: optional hints map where keys are strings and values unknown
         */
        constructor(hints?: Record<string, unknown>);
        decodeOnceFromVideoElement(videoElement: HTMLVideoElement): Promise<{ text: string }>;
        reset(): void;
    }
}
