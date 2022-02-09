import { exec } from "child_process";

import {getCurrentConfig} from './utils.js'
const { SCREEN_NAME, SERVER_DIR_NAME } = process.env;

const allocatedMem = getCurrentConfig();

export const javaStr = `java -Xms${allocatedMem} -Xmx${allocatedMem} -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions -XX:+DisableExplicitGC -XX:+AlwaysPreTouch -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M -XX:G1ReservePercent=20 -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:InitiatingHeapOccupancyPercent=15 -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 -Dusing.aikars.flags=https://mcflags.emc.gs -Daikars.new.flags=true -jar server.jar nogui`

export const printJavaStr = () => {
  console.log(javaStr)
}

export const startInScreen = () => {
  const screenStr = `cd ./${SERVER_DIR_NAME} && screen -d -m -S ${SCREEN_NAME} ${javaStr}`
  console.log(`📺 Starting in detached screen. To see logs and console attach the screen with command: screen -r ${SCREEN_NAME}`)
  exec(screenStr, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});
}
