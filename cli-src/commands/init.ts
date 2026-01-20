import inquirer from 'inquirer';
import fs from 'fs-extra';
import { getToken } from '../auth';

export async function initCommand() {
  // Check Login ก่อน
  const token = getToken();
  if (!token) {
    console.log('⚠️ Please login first: kcflow login');
    return;
  }

  // 1. ถาม Project Mode
  const { mode } = await inquirer.prompt([{
    type: 'list',
    name: 'mode',
    message: 'What do you want to do?',
    choices: [
      { name: 'Create/Edit Spec (Dev Mode)', value: 'dev' },
      { name: 'Consume API (Frontend Mode)', value: 'ui' }
    ]
  }]);

  // 2. ถาม Project Name (ดึง list จาก Cloud มาให้เลือกได้ด้วยนะ)
  const { projectType } = await inquirer.prompt([{
    type: 'list',
    name: 'projectType',
    message: 'Project selection:',
    choices: ['Create New Project', 'Use Existing Project']
  }]);

  // ... Logic การสร้างไฟล์ kcflow.config.json ตามคำตอบ ...
  
  if (mode === 'dev') {
     // ถามเรื่อง Download โครงสร้างเดิม
     const { download } = await inquirer.prompt([{
        type: 'confirm',
        name: 'download',
        message: 'Download existing spec structure?'
     }]);
     
     if (download) {
        // ยิง API ไปดึง Spec ล่าสุดมาลง folder ./kcflow-structure
     }
  }

  console.log('✅ Initialization complete.');
}