// Minimal typed constructor for window.BarcodeDetector (some browsers expose this).
type BarcodeDetectorConstructor = {
    new(options?: { formats?: string[] }): { detect: (v: HTMLVideoElement) => Promise<{ rawValue?: string; rawText?: string }[]> };
    getSupportedFormats?: () => string[];
};

declare global {
    interface Window {
        BarcodeDetector?: BarcodeDetectorConstructor;
    }
}

import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import jsQR from 'jsqr';
import { BrowserMultiFormatReader } from '@zxing/browser';

// Simple web-only barcode scanner for testing purposes.
// Uses the browser BarcodeDetector API when available and falls back to a fast canvas-based frame extractor
// that can be passed to a JS decoder if needed. For now we prefer BarcodeDetector to keep it lightweight.

type ScannerProProps = {
    onDetected?: (code: string) => void;
    initialAutoStart?: boolean;
    minimalView?: boolean; // when true, show only the large camera view and minimal chrome
    showDebug?: boolean; // whether to show debug logs
};

export default function ScannerPro({ onDetected, initialAutoStart = true, minimalView = false, showDebug = false }: ScannerProProps): React.ReactElement {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [scanned, setScanned] = useState<string>('');
    const [running, setRunning] = useState(false);
    // BarcodeDetector is an experimental browser API and may not exist in TS lib.
    // Provide narrow types here so TypeScript compiles without changing global libs.
    type RawBarcodeDetection = { rawValue?: string; rawText?: string };
    type MinimalBarcodeDetector = { detect: (v: HTMLVideoElement) => Promise<RawBarcodeDetection[]> };

    // jsQR result minimal shape
    type JsQRLocationCorner = { x: number; y: number };
    type JsQRLocation = {
        topLeftCorner: JsQRLocationCorner;
        topRightCorner: JsQRLocationCorner;
        bottomRightCorner: JsQRLocationCorner;
        bottomLeftCorner: JsQRLocationCorner;
    };
    type JsQRResult = { data?: string; location?: JsQRLocation } | null;

    // (global BarcodeDetector constructor is declared at file top-level)
    const detectorRef = useRef<MinimalBarcodeDetector | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const rafRef = useRef<number | null>(null);
    const pollRef = useRef<number | null>(null);
    const stoppedRef = useRef(false);
    const zxingBusyRef = useRef(false);
    const [torchAvailable, setTorchAvailable] = useState<boolean>(false);
    const [torchOn, setTorchOn] = useState<boolean>(false);
    const [logs, setLogs] = useState<string[]>([]);
    const { t } = useTranslation();

    // Local narrow types for device capabilities/constraints that may not be present in TS lib
    type TorchCapabilities = MediaTrackCapabilities & { torch?: boolean };

    function appendScannerLog(entry: string) {
        if (!showDebug) return;
        try {
            const raw = localStorage.getItem('scanner_debug_logs') || '[]';
            const arr = JSON.parse(raw) as string[];
            arr.unshift(entry);
            if (arr.length > 200) arr.length = 200;
            localStorage.setItem('scanner_debug_logs', JSON.stringify(arr));
        } catch (e) {
            // ignore storage errors
        }
    }

    function stopCameraAndCleanup() {
        if (stoppedRef.current) return;
        stoppedRef.current = true;
        setRunning(false);
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
        const v = videoRef.current;
        if (v && v.srcObject) {
            const s = v.srcObject as MediaStream;
            // try to turn torch off (use safe cast because `torch` is not in TS lib by default)
            try {
                const tracks = s.getVideoTracks();
                if (tracks && tracks.length > 0) {
                    const t = tracks[0];
                    try {
                        // MediaTrackConstraints doesn't include `torch` in many lib versions; cast locally
                        const c = { advanced: [{ torch: false }] } as unknown as MediaTrackConstraints;
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore - applying vendor-specific torch constraint
                        // Call applyConstraints but swallow any promise rejection to avoid Uncaught (in promise)
                        const p = (t.applyConstraints as unknown as (c: MediaTrackConstraints) => Promise<void>)(c);
                        if (p && typeof (p as Promise<void>).catch === 'function') {
                            (p as Promise<void>).catch(() => { /* ignore */ });
                        }
                    } catch (e) { /* ignore */ }
                }
            } catch (e) { /* ignore */ }
            try { s.getTracks().forEach((t) => t.stop()); } catch (e) { /* ignore */ }
            v.srcObject = null;
            streamRef.current = null;
            setTorchOn(false);
            setTorchAvailable(false);
        }
    }

    const toggleTorch = async (on: boolean) => {
        try {
            const s = streamRef.current;
            if (!s) return;
            const tracks = s.getVideoTracks();
            if (!tracks || tracks.length === 0) return;
            const track = tracks[0];
            const c = { advanced: [{ torch: !!on }] } as unknown as MediaTrackConstraints;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore - vendor-specific torch constraint
            await track.applyConstraints(c);
            setTorchOn(!!on);
        } catch (err) {
            setTorchAvailable(false);
            setTorchOn(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
                if (!mounted) return;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }
                // store stream for torch control
                streamRef.current = stream;
                // detect torch capability
                try {
                    const tracks = stream.getVideoTracks();
                    if (tracks && tracks.length > 0) {
                        const track = tracks[0];
                        const caps = (track as MediaStreamTrack & { getCapabilities?: () => MediaTrackCapabilities }).getCapabilities?.() || {};
                        const tc = caps as TorchCapabilities;
                        if (tc && tc.torch === true) setTorchAvailable(true);
                        else setTorchAvailable(false);
                    }
                } catch (e) {
                    setTorchAvailable(false);
                }

                // Init BarcodeDetector if available
                if (window.BarcodeDetector) {
                    try {
                        const formats = window.BarcodeDetector.getSupportedFormats ? window.BarcodeDetector.getSupportedFormats() : undefined;
                        // prefer common formats
                        detectorRef.current = new window.BarcodeDetector({ formats: formats || ['qr_code', 'ean_13', 'code_128', 'ean_8'] });
                    } catch (err) {
                        detectorRef.current = null;
                    }
                } else {
                    detectorRef.current = null;
                }

                setRunning(true);
                tick();
            } catch (err) {
                setError('Could not access camera: ' + String(err));
            }
        }

        startCamera();

        function tick() {
            if (!mounted) return;
            const v = videoRef.current;
            if (!v || v.readyState < 2) {
                rafRef.current = requestAnimationFrame(tick);
                return;
            }

            if (stoppedRef.current) return;
            if (detectorRef.current) {
                // use BarcodeDetector: schedule a detect but keep animation frame loop light
                (detectorRef.current as MinimalBarcodeDetector).detect(v as HTMLVideoElement)
                    .then((results: RawBarcodeDetection[]) => {
                        if (results && results.length > 0) {
                            const r = results[0];
                            const code = String(r.rawValue || r.rawText || '');
                            setScanned(code);
                            setLogs((l) => {
                                const head = `detected ${code}`;
                                appendScannerLog(head);
                                return [head, ...l].slice(0, 20);
                            });
                            // stop camera and release resources before notifying parent
                            stopCameraAndCleanup();
                            try { if (onDetected) onDetected(code); } catch (e) { /* ignore */ }
                        } else {
                            setLogs((l) => {
                                const head = `no result ${new Date().toISOString()}`;
                                appendScannerLog(head);
                                return [head, ...l].slice(0, 20);
                            });
                        }
                    })
                    .catch((err) => {
                        setLogs((l) => {
                            const head = `detect err ${String(err)}`;
                            appendScannerLog(head);
                            return [head, ...l].slice(0, 20);
                        });
                    })
                    .finally(() => {
                        // keep animation running; additionally set up a slower poll if needed
                        rafRef.current = requestAnimationFrame(tick);
                    });
            } else {
                // fallback: draw video frame to canvas and try to read with any library you prefer
                const c = canvasRef.current;
                if (c && v) {
                    const ctx = c.getContext('2d');
                    if (ctx) {
                        // define a centered scan box covering ~60% of the smaller dimension
                        const vw = v.videoWidth || 640;
                        const vh = v.videoHeight || 480;
                        const boxSize = Math.floor(Math.min(vw, vh) * 0.6);
                        const boxX = Math.floor((vw - boxSize) / 2);
                        const boxY = Math.floor((vh - boxSize) / 2);

                        // For decoding we use an offscreen canvas that crops the centered box
                        try {
                            const targetSize = 320; // square
                            const off = document.createElement('canvas');
                            off.width = targetSize;
                            off.height = targetSize;
                            const offCtx = off.getContext('2d');
                            if (offCtx) {
                                // draw the crop (boxX/boxY/boxSize) scaled to targetSize
                                offCtx.drawImage(v, boxX, boxY, boxSize, boxSize, 0, 0, targetSize, targetSize);
                                const img = offCtx.getImageData(0, 0, off.width, off.height);
                                const decoded = jsQR(img.data, img.width, img.height, { inversionAttempts: 'attemptBoth' }) as JsQRResult;
                                setLogs((l) => {
                                    const head = `jsqr img ${img.width}x${img.height}`;
                                    appendScannerLog(head);
                                    return [head, ...l].slice(0, 20);
                                });
                                if (decoded && decoded.data) {
                                    const found = String(decoded.data);
                                    setScanned(found);
                                    setLogs((l) => {
                                        const head = `jsqr ${found}`;
                                        appendScannerLog(head);
                                        return [head, ...l].slice(0, 20);
                                    });
                                    stopCameraAndCleanup();
                                    try { if (onDetected) onDetected(found); } catch (e) { /* ignore */ }
                                    // optionally draw bounding box on preview canvas if available
                                    try {
                                        const visCtx = c.getContext('2d');
                                        if (visCtx && decoded.location) {
                                            visCtx.strokeStyle = 'lime';
                                            visCtx.lineWidth = 2;
                                            const loc = decoded.location;
                                            visCtx.beginPath();
                                            visCtx.moveTo(loc.topLeftCorner.x, loc.topLeftCorner.y);
                                            visCtx.lineTo(loc.topRightCorner.x, loc.topRightCorner.y);
                                            visCtx.lineTo(loc.bottomRightCorner.x, loc.bottomRightCorner.y);
                                            visCtx.lineTo(loc.bottomLeftCorner.x, loc.bottomLeftCorner.y);
                                            visCtx.closePath();
                                            visCtx.stroke();
                                        }
                                    } catch (drawErr) {
                                        // ignore
                                    }
                                } else {
                                    const noneMsg = `jsqr none ${new Date().toISOString()}`;
                                    setLogs((l) => {
                                        appendScannerLog(noneMsg);
                                        return [noneMsg, ...l].slice(0, 20);
                                    });

                                    // ZXing fallback for 1D barcodes (run once at a time)
                                    if (!zxingBusyRef.current) {
                                        zxingBusyRef.current = true;
                                        (async () => {
                                            try {
                                                const reader = new BrowserMultiFormatReader();
                                                try {
                                                    type ZXingResult = { text?: string } | null;
                                                    const result = (await reader.decodeOnceFromVideoElement(v)) as ZXingResult;
                                                    const text = result?.text;
                                                    if (text) {
                                                        const found = String(text);
                                                        setScanned(found);
                                                        setLogs((l) => {
                                                            const head = `zxing ${found}`;
                                                            appendScannerLog(head);
                                                            return [head, ...l].slice(0, 20);
                                                        });
                                                        stopCameraAndCleanup();
                                                        try { if (onDetected) onDetected(found); } catch (e) { /* ignore */ }
                                                    }
                                                } catch (decodeErr) {
                                                    setLogs((l) => {
                                                        const head = `zxing decode err ${String(decodeErr)}`;
                                                        appendScannerLog(head);
                                                        return [head, ...l].slice(0, 20);
                                                    });
                                                } finally {
                                                    try { reader.reset(); } catch (resetErr) { /* ignore */ }
                                                }
                                            } catch (err) {
                                                setLogs((l) => {
                                                    const head = `zxing err ${String(err)}`;
                                                    appendScannerLog(head);
                                                    return [head, ...l].slice(0, 20);
                                                });
                                            } finally {
                                                zxingBusyRef.current = false;
                                            }
                                        })();
                                    }
                                }
                            }
                        } catch (e) {
                            // ignore decoder errors
                        }
                    }
                }
                rafRef.current = requestAnimationFrame(tick);
            }
        }

        // Also schedule a periodic poll for detector (some implementations behave better with polling)
        function startPoll() {
            if (!detectorRef.current) return;
            pollRef.current = window.setInterval(() => {
                const v = videoRef.current;
                if (v && detectorRef.current) {
                    detectorRef.current.detect(v).then((results) => {
                        if (results && results.length > 0) {
                            const r = results[0];
                            const code = String(r.rawValue || r.rawText || '');
                            setScanned(code);
                            // when polled result found, stop camera
                            stopCameraAndCleanup();
                            setLogs((l) => {
                                const head = `polled ${code}`;
                                appendScannerLog(head);
                                return [head, ...l].slice(0, 20);
                            });
                        }
                    }).catch(() => { });
                }
            }, 300);
        }

        return () => {
            mounted = false;
            setRunning(false);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            if (pollRef.current) clearInterval(pollRef.current);
            const v = videoRef.current;
            if (v && v.srcObject) {
                const s = v.srcObject as MediaStream;
                s.getTracks().forEach((t) => t.stop());
                v.srcObject = null;
            }
        };
    }, []);

    // Minimal view: focus on a single large camera view; hide side controls unless showDebug
    const containerStyle: React.CSSProperties = minimalView ? { padding: 8, position: 'relative' } : { padding: 16, position: 'relative' };
    const videoStyle: React.CSSProperties = minimalView
        ? { width: '100%', height: '70vh', objectFit: 'cover', background: '#000', display: 'block' }
        : { width: '100%', maxHeight: 480, background: '#000', display: 'block' };

    const overlayStyle: React.CSSProperties = {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    const boxStyle: React.CSSProperties & { aspectRatio?: string } = {
        width: '60%',
        maxWidth: 600,
        aspectRatio: '1/1',
        border: '2px dashed rgba(255,255,255,0.9)',
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.5) inset',
        borderRadius: 8,
    };

    return (
        <div style={containerStyle}>
            {!minimalView && <h2>Simple Barcode Scanner (web)</h2>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* video wrapper: when not minimalView we show a square viewport matching the scan box */}
                    <div style={minimalView ? { width: '100%', position: 'relative' } : { width: '60%', maxWidth: 600, position: 'relative', aspectRatio: boxStyle.aspectRatio }}>
                        <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#000' }} playsInline muted />
                        <canvas ref={canvasRef} style={minimalView ? { display: 'none' } : { display: 'none' }} />
                        {/* overlay with centered scan box */}
                        <div style={overlayStyle} aria-hidden>
                            <div style={boxStyle} />
                            {torchAvailable && (
                                <div style={{ position: 'absolute', right: 12, top: 12, pointerEvents: 'auto' }}>
                                    <Button size="small" onClick={() => toggleTorch(!torchOn)}>{torchOn ? t('scanner.flash.off', { defaultValue: '🔦 Off' }) : t('scanner.flash.on', { defaultValue: '🔦 On' })}</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {!minimalView && (
                    <div style={{ width: 320 }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <label>Last scanned barcode</label>
                            <Input value={scanned} onChange={(e) => setScanned(e.target.value)} />
                            <Button onClick={() => setScanned('')}>Clear</Button>
                            <Button onClick={async () => {
                                // immediate detect attempt
                                const v = videoRef.current;
                                if (v) {
                                    // Try BarcodeDetector first
                                    if (detectorRef.current) {
                                        try {
                                            const results = await detectorRef.current.detect(v);
                                            if (results && results.length > 0) {
                                                const code = String(results[0].rawValue || results[0].rawText || '');
                                                setScanned(code);
                                                setLogs((l) => {
                                                    const head = `manual detector ${code}`;
                                                    appendScannerLog(head);
                                                    return [head, ...l].slice(0, 20);
                                                });
                                                return;
                                            }
                                        } catch (e) {
                                            setLogs((l) => {
                                                const head = `manual detector err ${String(e)}`;
                                                appendScannerLog(head);
                                                return [head, ...l].slice(0, 20);
                                            });
                                        }
                                    }

                                    // Try jsQR (QR only)
                                    try {
                                        const c = canvasRef.current;
                                        if (c) {
                                            const ctx = c.getContext('2d');
                                            if (ctx) {
                                                c.width = Math.min(640, v.videoWidth);
                                                c.height = Math.round((v.videoHeight / v.videoWidth) * c.width);
                                                ctx.drawImage(v, 0, 0, c.width, c.height);
                                                const img = ctx.getImageData(0, 0, c.width, c.height);
                                                const decoded = jsQR(img.data, img.width, img.height, { inversionAttempts: 'attemptBoth' }) as JsQRResult;
                                                if (decoded && decoded.data) {
                                                    setScanned(String(decoded.data));
                                                    setLogs((l) => {
                                                        const head = `manual jsqr ${decoded.data}`;
                                                        appendScannerLog(head);
                                                        return [head, ...l].slice(0, 20);
                                                    });
                                                    return;
                                                }
                                            }
                                        }
                                    } catch (e) {
                                        setLogs((l) => {
                                            const head = `manual jsqr err ${String(e)}`;
                                            appendScannerLog(head);
                                            return [head, ...l].slice(0, 20);
                                        });
                                    }

                                    // ZXing (static import) - supports many 1D and 2D formats
                                    try {
                                        const reader = new BrowserMultiFormatReader();
                                        try {
                                            type ZXingResult = { text?: string } | null;
                                            const result = (await reader.decodeOnceFromVideoElement(v)) as ZXingResult;
                                            const text = result?.text;
                                            if (text) {
                                                const found = String(text);
                                                setScanned(found);
                                                setLogs((l) => {
                                                    const head = `zxing ${found}`;
                                                    appendScannerLog(head);
                                                    return [head, ...l].slice(0, 20);
                                                });
                                                // stop camera before notifying parent
                                                stopCameraAndCleanup();
                                                try { if (onDetected) onDetected(found); } catch (e) { /* ignore */ }
                                                return;
                                            }
                                        } catch (decodeErr) {
                                            setLogs((l) => {
                                                const head = `zxing decode err ${String(decodeErr)}`;
                                                appendScannerLog(head);
                                                return [head, ...l].slice(0, 20);
                                            });
                                        } finally {
                                            try { reader.reset(); } catch (resetErr) {
                                                setLogs((l) => {
                                                    const head = `zxing reset err ${String(resetErr)}`;
                                                    appendScannerLog(head);
                                                    return [head, ...l].slice(0, 20);
                                                });
                                            }
                                        }
                                    } catch (err) {
                                        setLogs((l) => {
                                            const head = `zxing err ${String(err)}`;
                                            appendScannerLog(head);
                                            return [head, ...l].slice(0, 20);
                                        });
                                    }

                                    setLogs((l) => {
                                        const head = `manual none ${new Date().toISOString()}`;
                                        appendScannerLog(head);
                                        return [head, ...l].slice(0, 20);
                                    });
                                } else {
                                    setLogs((l) => {
                                        const head = `manual no video`;
                                        appendScannerLog(head);
                                        return [head, ...l].slice(0, 20);
                                    });
                                }
                            }}>Scan now</Button>
                            <div style={{ marginTop: 8 }}>
                                <small>Note: uses browser BarcodeDetector where available. If your browser lacks it you can wire in a JS decoder later.</small>
                            </div>
                            {showDebug && (
                                <div style={{ marginTop: 8 }}>
                                    <strong>Debug logs</strong>
                                    <div style={{ maxHeight: 160, overflow: 'auto', background: '#fff', border: '1px solid #ddd', padding: 8 }}>
                                        {logs.length === 0 ? <div style={{ color: '#666' }}>no logs</div> : logs.map((l, i) => <div key={i}>{l}</div>)}
                                    </div>
                                </div>
                            )}
                            <div style={{ marginTop: 8 }}>
                                <small>Note: uses browser BarcodeDetector where available. If your browser lacks it you can wire in a JS decoder later.</small>
                            </div>
                        </Space>
                    </div>
                )}
            </div>
        </div>
    );
}
