// Lightweight logger wrapper used across the app.
// In production most debug/info logs are disabled to avoid leaking sensitive
// information. Warnings and errors are kept.

const isProd = process.env.NODE_ENV === 'production';

// typed alias for the global console to avoid explicit `any` casts
const c: Console = console;

type LogFn = (...args: unknown[]) => void;

interface Logger {
    debug: LogFn;
    info: LogFn;
    log: LogFn;
    warn: LogFn;
    error: LogFn;
    group: LogFn;
    groupEnd: () => void;
    trace: LogFn;
    _setProdMode: (prod: boolean) => void;
}

function makeLogger(prod = isProd): Logger {
    const noop: LogFn = () => { /* no-op */ };

    const l = {
        debug: prod ? noop : (...args: unknown[]) => c.debug(...args),
        info: prod ? noop : (...args: unknown[]) => c.info(...args),
        log: prod ? noop : (...args: unknown[]) => c.log(...args),
        warn: (...args: unknown[]) => c.warn(...args),
        error: (...args: unknown[]) => c.error(...args),
        group: prod ? noop : (...args: unknown[]) => c.group(...args),
        groupEnd: prod ? noop : () => c.groupEnd?.(),
        trace: prod ? noop : (...args: unknown[]) => c.trace(...args),

        _setProdMode(prodMode: boolean) {
            l.debug = prodMode ? noop : (...a: unknown[]) => c.debug(...a);
            l.info = prodMode ? noop : (...a: unknown[]) => c.info(...a);
            l.log = prodMode ? noop : (...a: unknown[]) => c.log(...a);
            l.group = prodMode ? noop : (...a: unknown[]) => c.group(...a);
            l.groupEnd = prodMode ? noop : () => c.groupEnd?.();
            l.trace = prodMode ? noop : (...a: unknown[]) => c.trace(...a);
            l.warn = (...a: unknown[]) => c.warn(...a);
            l.error = (...a: unknown[]) => c.error(...a);
        }
    } as Logger;

    return l;
}

const logger = makeLogger();

export default logger;
