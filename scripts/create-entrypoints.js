#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const rimraf = require("rimraf")

function createEntrypoints(rootPath) {
  const entrypointNames = fs.readdirSync(path.join(rootPath, "src"))
    .filter(filename => filename.endsWith(".ts") && !filename.startsWith("_"))
    .map(filename => filename.replace(/\.ts$/, ""))

  for (const entrypointName of entrypointNames) {
    const hasDefaultExport = entrypointName !== "index"

    fs.writeFileSync(
      path.join(rootPath, `${entrypointName}.d.ts`),
      (hasDefaultExport ? `export { default } from "./dist/${entrypointName}"\n` : "") +
      `export * from "./dist/${entrypointName}"\n`,
      "utf8"
    )
    fs.writeFileSync(
      path.join(rootPath, `${entrypointName}.js`),
      `module.exports = require("./dist/${entrypointName}.js")\n`,
      "utf8"
    )
  }
}

const projectRootPath = path.join(__dirname, "..")

createEntrypoints(projectRootPath)
