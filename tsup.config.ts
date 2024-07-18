import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["lib/index.ts"],
    splitting: false,
    clean: true,
    format: ["cjs", "esm"],
    target: ["node10"],
    dts: true,
});
