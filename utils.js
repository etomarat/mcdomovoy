import inquirer from "inquirer";
import fs from 'fs';

const { EXTRA_DIR_NAME, SERVER_DIR_NAME } = process.env;
const MEMCONFIG_FILEPATH = `./${EXTRA_DIR_NAME}/memconfig.json`;

const CANCEL = 'cancel';
const OTHER = 'different value';
const LIST = [
  '400M',
  '512M',
  '1G',
  `${512*3}M`,
  `${(512*2*1.6).toFixed(0)}M`,
  `${(512*2*1.7).toFixed(0)}M`,
  `${(512*2*1.8).toFixed(0)}M`,
  '2G',
  '4G',
  '6G',
  '8G',
  '10G',
  '12G',
  '16G',
  '32G',
]

export const getCurrentConfig = () => {
  try {
    const data = JSON.parse(fs.readFileSync(MEMCONFIG_FILEPATH));
    return data.allocatedMem
  } catch(err) {
    if(err.code === 'ENOENT') {
      return null
    }
    console.error(err);
  }
}

const setCurrentConfig = (allocatedMem) => {
  try {
    const dataStr = JSON.stringify({allocatedMem}, null, 2);
    fs.writeFileSync(MEMCONFIG_FILEPATH, dataStr);
    return true;
  } catch(err) {
    console.error(err);
  }
}

const askQuestions = async () => {
  const currentMem = await getCurrentConfig();
  if (currentMem) {
    console.log(`📌 Current allocated ${currentMem} for pupurmc server`);
  }

  const questions = [
    {
      type: 'list',
      name: 'chosenValue',
      message: 'choose how much memory java server can use. The bigger, the better 💪',
      default: LIST[LIST.length-1],
      choices: [...LIST, OTHER, CANCEL],
      loop: false,
    },
    {
      type: 'input',
      name: 'otherValue',
      message: 'enter value ✍️. You can use M or G postfix',
      when(answers) {
        const {chosenValue} = answers;
        return chosenValue === OTHER;
      },
      default: '1G',
    }
  ]
  const {chosenValue, otherValue} = await inquirer.prompt(questions);
  if (chosenValue === CANCEL) {
    console.log('🤔 nothing to do');
    return false;
  }

  return chosenValue === OTHER ? otherValue : chosenValue;
}

export const setMem = async() => {
  try {
    const newMem = await askQuestions();
    const result = setCurrentConfig(newMem)
    if (result) {
      console.log('Setted 🙌')
    }
  } catch(err) {
    console.error(err);
  }
}

const askEula = async () => {
  const prereqEulaPath = './prereq/eula.txt';
  const eulaTxt = fs.readFileSync(prereqEulaPath, 'utf-8');
  console.log(eulaTxt);
  const question = {
    type: 'confirm',
    name: 'eulaConfirm',
    message: '🤔 Do you want setting eula=true ?',
    default: true,
  }
  const {eulaConfirm} = await inquirer.prompt([question]);
  if (eulaConfirm) {
    const confirmedEulaTxt = eulaTxt.replace(/eula=false/g, 'eula=true')
    fs.writeFileSync(`${SERVER_DIR_NAME}/eula.txt`, confirmedEulaTxt, 'utf-8')
    return true
  }
}

export const eula = async () => {
  try {
    const result = await askEula();
    if (result) {
      console.log('eula confirmed 🙌')
    }
  } catch(err) {
    console.error(err);
  }
}
