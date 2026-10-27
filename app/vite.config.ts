import path from "path"
import fs from "node:fs"
import { createHash } from "node:crypto"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"


// Content fingerprint identifies the source actually built, including local edits.
const sourceHash = createHash('sha256');
function hashSource(dir: string) {
  for(const name of fs.readdirSync(dir).sort()) {
    const file=path.join(dir,name);
    if(fs.statSync(file).isDirectory())hashSource(file);
    else {sourceHash.update(path.relative(__dirname,file));sourceHash.update(fs.readFileSync(file));}
  }
}
hashSource(path.resolve(__dirname,'src'));
const buildId='KA-'+sourceHash.digest('hex').slice(0,10);

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/gmc-decision-lab/' : './',
  define: { __BUILD_ID__: JSON.stringify(buildId) },
  plugins: [react()],
  server: {
    port: 3000,
    allowedHosts: ["terminal.local"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
