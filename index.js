const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");
const { ConfigUtils, CredentialManagerFactory } = require("@zowe/imperative");

async function backupZoweConfig() {
    for (const fileName of ["zowe.config.json", "zowe.config.user.json", "zowe.schema.json"]) {
        const srcPath = path.join(ConfigUtils.getZoweDir(), fileName);
        const destPath = path.join(__dirname, "global", fileName);
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
        } else if (fs.existsSync(destPath)) {
            fs.unlinkSync(destPath);
        }
    }
    for (const fileName of ["zowe.config.json", "zowe.config.user.json", "zowe.schema.json"]) {
        const srcPath = path.join(process.cwd(), fileName);
        const destPath = path.join(__dirname, "project", fileName);
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
        } else if (fs.existsSync(destPath)) {
            fs.unlinkSync(destPath);
        }
    }
    const secrets = await CredentialManagerFactory.manager.load("secure_config_props");
    fs.writeFileSync(".secrets", secrets);
}

async function restoreZoweConfig() {
    for (const fileName of ["zowe.config.json", "zowe.config.user.json", "zowe.schema.json"]) {
        const srcPath = path.join(__dirname, "global", fileName);
        const destPath = path.join(ConfigUtils.getZoweDir(), fileName);
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
        }
    }
    for (const fileName of ["zowe.config.json", "zowe.config.user.json", "zowe.schema.json"]) {
        const srcPath = path.join(__dirname, "project", fileName);
        const destPath = path.join(process.cwd(), fileName);
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
        }
    }
    const secrets = fs.readFileSync(".secrets", "utf-8");
    await CredentialManagerFactory.manager.save("secure_config_props", secrets);
}

(async () => {
    await CredentialManagerFactory.initialize({ service: null });
    if (process.argv[2] === "push") {
        await backupZoweConfig();
    }
    childProcess.execSync(`git stash ${process.argv.slice(2).join(" ")}`, { stdio: "inherit" });
    if (process.argv[2] === "apply" || process.argv[2] === "pop") {
        await restoreZoweConfig();
    }
})();
