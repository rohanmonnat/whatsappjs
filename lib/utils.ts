import { basename, extname } from "node:path";
import { access, readFile } from "node:fs/promises";
import { PromiseRetryCondition } from "./types";

export const parseAPIVersion = (version: string | number) => {
    let numericVersion: number;

    if (typeof version === "number") {
        numericVersion = version;
    } else if (typeof version === "string") {
        const versionPattern = /^v(\d+)\.0$/;
        const match = version.match(versionPattern);

        if (match) {
            numericVersion = parseInt(match[1], 10);
        } else {
            numericVersion = parseInt(version, 10);

            if (isNaN(numericVersion)) {
                throw new Error(`Invalid API version format: ${version}.`);
            }
        }
    } else {
        throw new Error(`Unsupported API version type: ${typeof version}.`);
    }

    return `v${numericVersion}.0`;
};

export const wait = <T>(asyncFn: () => Promise<T>, delay: number): (() => Promise<T>) => {
    if (delay <= 0) {
        return asyncFn;
    }
    return () =>
        new Promise((resolve, reject) => {
            setTimeout(() => {
                asyncFn().then(resolve).catch(reject);
            }, delay);
        });
};

export const retry = async <T>(
    asyncFn: () => Promise<T>,
    retries: number,
    retryCondition: PromiseRetryCondition | null = null,
    retryDelay: number = 0
): Promise<T> => {
    try {
        const response = await asyncFn();
        return response;
    } catch (error) {
        if (retries <= 0) {
            throw error;
        }

        if (retryCondition) {
            if (typeof retryCondition === "function" && retryCondition(error, retries)) {
                return await wait(() => retry(asyncFn, retries - 1, retryCondition, retryDelay), retryDelay)();
            } else {
                throw error;
            }
        }

        return await wait(() => retry(asyncFn, retries - 1, retryCondition, retryDelay), retryDelay)();
    }
};

export const getMimeType = (filePath: string) => {
    const ext = extname(filePath).toLowerCase();
    switch (ext) {
        case ".jpg":
        case ".jpeg":
            return "image/jpeg";
        case ".png":
            return "image/png";
        case ".webp":
            return "image/webp";

        case ".txt":
            return "text/plain";
        case ".pdf":
            return "application/pdf";
        case ".ppt":
            return "application/vnd.ms-powerpoint";
        case ".doc":
            return "application/msword";
        case ".xls":
            return "application/vnd.ms-excel";
        case ".docx":
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        case ".pptx":
            return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
        case ".xlsx":
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        case ".aac":
            return "audio/aac";
        case ".m4a":
            return "audio/mp4";
        case ".mp3":
            return "audio/mpeg";
        case ".amr":
            return "audio/amr";
        case ".ogg":
            return "audio/ogg";
        case ".opus":
            return "audio/opus";

        case ".mp4":
            return "video/mp4";
        case ".3gp":
            return "video/3gpp";

        default:
            return "application/octet-stream";
    }
};

/**
 * Get the file name from a file path.
 * @param filePath {string} - The file path.
 * @returns File name.
 */
export const getFileName = (filePath: string) => {
    return basename(filePath);
};

/**
 * Checks if the file exists.
 * @param filePath {string} - The file path.
 * @returns `true` if file exists otherwise `false`.
 */
export const checkFile = async (filePath: string) => {
    try {
        await access(filePath);
        return true;
    } catch (error) {
        return false;
    }
};

export const getFileBlob = async (filepath: string) => {
    const fileBuffer = await readFile(filepath);
    const blob = new Blob([fileBuffer], { type: getMimeType(filepath) });
    return blob;
};

export const tryCatch = <F extends (...args: any[]) => any>(
    fn: F,
    ...args: Parameters<F>
): { error: Error | null; data: ReturnType<F> | null } => {
    try {
        return { error: null, data: fn(...args) };
    } catch (error) {
        return { error: error, data: null };
    }
};

export const asyncTryCatch = async <F extends (...args: any[]) => Promise<any>>(
    fn: F,
    ...args: Parameters<F>
): Promise<{ error: Error | null; data: ReturnType<F> | null }> => {
    try {
        const data = await fn(...args);
        return { error: null, data };
    } catch (error) {
        return { error: error as Error, data: null };
    }
};
