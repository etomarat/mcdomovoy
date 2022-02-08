import inquirer from "inquirer";
import fs from 'fs';
import util from 'util';
import stream from 'stream';

import {purpurAxios} from './config.js'

const { SERVER_DIR_NAME } = process.env;
const CANCEL = 'cancel';

const getVerionsList = async () => {
  try {
    const response = await purpurAxios.get("/purpur")
    return response.data.versions;
  } catch(err) {
    console.error(error);
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
    const data = JSON.parse(fs.readFileSync('./versions.json'));
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
    const result =  fs.writeFileSync('./versions.json', dataStr);
    return true;
  } catch(err) {
    console.error(err);
  }
}

const askQuestions = async () => {
  const {pupurmcVersion: currentVersion, pupurmcBuild: currentBuild} = await getCurrentVersion();
  if (currentVersion) {
    console.log(`Current pupurmc server is version: ${currentVersion} build: ${currentBuild}`);
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
    console.log('nothing to update');
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
    console.log('nothing to update');
    return false;
  }
  return {chosedVersion, chosedBuild};
}

const downloadJar = async ({version, build}) => {
  try {
    if (!fs.existsSync(`./${SERVER_DIR_NAME}`)){
      fs.mkdirSync(`./${SERVER_DIR_NAME}`);
    }
    const writer = fs.createWriteStream(`./${SERVER_DIR_NAME}/server.jar`, {recursive: true});
    const response = await purpurAxios.get(`/purpur/${version}/${build}/download`, {
      responseType: 'stream'
    })
    response.data.pipe(writer);

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
        const result = await setCurrentVersion(payload)
        if (result) {
          console.log('update completed')
        }
      }
    }
  } catch(err) {
    console.error(err);
  }
}
