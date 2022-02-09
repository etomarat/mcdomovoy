import inquirer from "inquirer";
import fs from 'fs';
import ProgressBar from 'progress';

import {purpurAxios} from './config.js'

const { SERVER_DIR_NAME, EXTRA_DIR_NAME } = process.env;
const VERSIONS_FILEPATH = `./${EXTRA_DIR_NAME}/versions.json`;
const CANCEL = 'cancel';

const getVerionsList = async () => {
  try {
    const response = await purpurAxios.get("/purpur")
    return response.data.versions;
  } catch(err) {
    console.error(err);
  }
}

const getBuildsList = async (version) => {
  try {
    const response = await purpurAxios.get(`/purpur/${version}`);
    return response.data.builds.all;
  } catch(err) {
    console.error(err);
  }
}

const getCurrentVersion = () => {
  try {
    const data = JSON.parse(fs.readFileSync(VERSIONS_FILEPATH));
    const {pupurmcVersion, pupurmcBuild} = data;
    return {pupurmcVersion, pupurmcBuild}
  } catch(err) {
    if(err.code === 'ENOENT') {
      return {pupurmcVersion: null, pupurmcBuild: null}
    }
    console.error(err);
  }
}

const setCurrentVersion = ({version, build}) => {
  try {
    const payload = {
      pupurmcVersion: version,
      pupurmcBuild: build
    }
    const dataStr = JSON.stringify(payload, null, 2);
    fs.writeFileSync(VERSIONS_FILEPATH, dataStr);
    return true;
  } catch(err) {
    console.error(err);
  }
}

const askQuestions = async () => {
  const {pupurmcVersion: currentVersion, pupurmcBuild: currentBuild} = await getCurrentVersion();
  if (currentVersion) {
    console.log(`📌 Current pupurmc server is version: ${currentVersion} build: ${currentBuild}`);
  }

  const versions = await getVerionsList();
  const questions1 = [
    {
      type: 'list',
      name: 'chosedVersion',
      message: 'chose version of purpurmc server for install',
      default: versions[versions.length-1],
      choices: [...versions, CANCEL],
      loop: false,
    }]
  const {chosedVersion} = await inquirer.prompt(questions1);
  if (chosedVersion === CANCEL) {
    console.log('🤔 nothing to update');
    return false;
  }

  const builds = await getBuildsList(chosedVersion);
  const questions2 = [
    {
      type: 'list',
      name: 'chosedBuild',
      message: `chose build of ${chosedVersion} version purpurmc server for install`,
      default: builds[builds.length-1],
      choices: [...builds, CANCEL],
      loop: false,
    },
    {
      type: 'confirm',
      name: 'sameVersionConfirm',
      message: 'this version build already installed. Reinstall?',
      when(answers) {
        const {chosedBuild} = answers;
        return chosedVersion === currentVersion && chosedBuild === currentBuild;
      },
      default: false,
    }
  ]
  const {chosedBuild, sameVersionConfirm} = await inquirer.prompt(questions2);

  if (chosedVersion === CANCEL || chosedBuild === CANCEL || sameVersionConfirm === false) {
    console.log('🤔 nothing to update');
    return false;
  }
  return {chosedVersion, chosedBuild};
}

const downloadJar = async ({version, build}) => {
  try {
    const { data, headers } = await purpurAxios.get(`/purpur/${version}/${build}/download`, {
      responseType: 'stream'
    })
    const totalLength = headers['content-length']
    const progressBar = new ProgressBar('🚧 downloading [:bar] :percent :etas 🚧', {
      width: 80,
      complete: '\u2588',
      incomplete: '\u2591',
      renderThrottle: 1,
      total: parseInt(totalLength)
    })
    data.on('data', (chunk) => progressBar.tick(chunk.length))

    const writer = fs.createWriteStream(`./${SERVER_DIR_NAME}/server.jar`, {recursive: true});
    data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve.bind(null, true))
      writer.on('error', reject)
    })
  } catch(err) {
    console.error(err);
  }
}

export const update = async () => {
  try {
    const result = await askQuestions();
    if (result) {
      const {chosedVersion, chosedBuild} = result;
      const payload = {version: chosedVersion, build: chosedBuild};
      const downloaded = await downloadJar(payload);
      if (downloaded) {
        const result = setCurrentVersion(payload)
        if (result) {
          console.log('Update completed 🙌')
        }
      }
    }
  } catch(err) {
    console.error(err);
  }
}
