#!/usr/bin/env node
const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");
const { ConfigUtils, CredentialManagerFactory } = require("@zowe/imperative");

function copyOrRemove(srcPath, destPath) {
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
    } else if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath);
    }
}

async function backupZoweConfig() {
    for (const fileName of ["zowe.config.json", "zowe.config.user.json", "zowe.schema.json"]) {
        const srcPath = path.join(ConfigUtils.getZoweDir(), fileName);
        const destPath = path.join(__dirname, "global", fileName);
        copyOrRemove(srcPath, destPath);
    }
    for (const fileName of ["zowe.config.json", "zowe.config.user.json", "zowe.schema.json"]) {
        const srcPath = path.join(process.cwd(), fileName);
        const destPath = path.join(__dirname, "project", fileName);
        copyOrRemove(srcPath, destPath);
    }
    const secrets = await CredentialManagerFactory.manager.load("secure_config_props");
    fs.writeFileSync(path.join(__dirname, ".secrets"), secrets);
}

async function restoreZoweConfig() {
    for (const fileName of ["zowe.config.json", "zowe.config.user.json", "zowe.schema.json"]) {
        const srcPath = path.join(__dirname, "global", fileName);
        const destPath = path.join(ConfigUtils.getZoweDir(), fileName);
        copyOrRemove(srcPath, destPath);
    }
    for (const fileName of ["zowe.config.json", "zowe.config.user.json", "zowe.schema.json"]) {
        const srcPath = path.join(__dirname, "project", fileName);
        const destPath = path.join(process.cwd(), fileName);
        copyOrRemove(srcPath, destPath);
    }
    const secrets = fs.readFileSync(path.join(__dirname, ".secrets"), "utf-8");
    await CredentialManagerFactory.manager.save("secure_config_props", secrets);
}

(async () => {
    await CredentialManagerFactory.initialize({ service: null });
    const gitArgs = process.argv.slice(2);
    let shouldClean = false;
    if (gitArgs[0] === "push" || gitArgs[0] === "save") {
        await backupZoweConfig();
        console.log("[zc-stash] Created snapshot of Zowe configuration");
        shouldClean = true;
    }
    childProcess.spawnSync("git", ["-C", __dirname, "stash", ...gitArgs], { stdio: "inherit" });
    if (gitArgs[0] === "apply" || gitArgs[0] === "pop") {
        await restoreZoweConfig();
        console.log("[zc-stash] Restored snapshot of Zowe configuration");
        shouldClean = true;
    }
    if (shouldClean) {
        childProcess.spawnSync("git", ["-C", __dirname, "clean", "-f"]);
    }
})();
