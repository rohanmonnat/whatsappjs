import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        testTimeout: 30 * 1000,
        sequence: {
            concurrent: true,
        },
    },
});
