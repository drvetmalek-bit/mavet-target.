const fs = require("node:fs");
const path = require("node:path");

const buildFile = path.join(process.cwd(), "android", "app", "build.gradle");
let source = fs.readFileSync(buildFile, "utf8");

if (!source.includes("signingConfigs.release")) {
  const signingConfig = `
        release {
            storeFile file(System.getenv("ANDROID_KEYSTORE_PATH"))
            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
            keyAlias System.getenv("ANDROID_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_KEY_PASSWORD")
        }
`;
  source = source.replace("    buildTypes {", `${signingConfig}    buildTypes {`);
  const releaseStart = source.indexOf("        release {");
  if (releaseStart === -1) throw new Error("Android release build type was not found.");
  const beforeRelease = source.slice(0, releaseStart);
  const releaseAndAfter = source.slice(releaseStart).replace("signingConfig signingConfigs.debug", "signingConfig signingConfigs.release");
  source = `${beforeRelease}${releaseAndAfter}`;
}

if (!source.includes("signingConfig signingConfigs.release")) {
  throw new Error("Android release signing configuration could not be applied.");
}

fs.writeFileSync(buildFile, source);
