
import { loadProject } from "./ProjectContext";
import { captureCheckpoint } from "./checkpoint";

async function main() {
    const project = loadProject(process.cwd());
    await captureCheckpoint(project);
}

main().catch((error) => {
    process.exitCode = -1;
    console.error(error);
});
