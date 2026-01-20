#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import { sendToCloud } from './cloud';
import { loadSpec } from './utils/loadspec'; // ✅ แก้เป็น loadSpec (S ใหญ่)
import { setupProjectConfig } from './utils/setupProject';
import updateNotifier from 'update-notifier';

// อ่าน version จาก package.json
// หมายเหตุ: ต้องเปิด "resolveJsonModule": true ใน tsconfig.json
const packageJson = require('../package.json');
updateNotifier({ pkg: packageJson, updateCheckInterval: 1000 * 60 * 60 }).notify({
    isGlobal: true,
    defer: false
});

const program = new Command();

program
    .name('kcflow')
    .version(packageJson.version)
    .description('KCFlow CLI - TypeSafe End-to-End API Builder');

// 👉 Command: INIT
program
    .command('init')
    .description('Initialize KCFlow in your project')
    .action(() => {
        const cwd = process.cwd();

        // 1. สร้าง config file
        const configPath = path.join(cwd, 'kcflow.config.json');
        if (!fs.existsSync(configPath)) {
            const defaultConfig = {
                "$schema": "https://api.kcflow.dev/kcflow-schema.json",

                clientType: 'fetch',
                spec: './kcflow/spec/kcflow.spec.ts',
                output: {
                    baseDir: './src/kcflow'
                }
            };
            fs.writeJsonSync(configPath, defaultConfig, { spaces: 2 });
            console.log('✅ Created kcflow.config.json');
        }

        // 2. สร้างไฟล์ Spec ตัวอย่าง
        const specDir = path.join(cwd, 'kcflow/spec');
        const specFile = path.join(specDir, 'kcflow.spec.ts');
        if (!fs.existsSync(specFile)) {
            fs.ensureDirSync(specDir);
            const exampleSpec = `import { defineResource, t } from 'kcflow';

export default defineResource({
  health: {
    check: {
      method: 'GET',
      path: '/health',
      response: t.object({ status: t.string() })
    }
  }
});`;
            fs.writeFileSync(specFile, exampleSpec);
            console.log('✅ Created sample spec: kcflow/spec/kcflow.spec.ts');
        }

        // 3. Setup tsconfig/jsconfig Alias
        setupProjectConfig(cwd);

        console.log('\n🎉 Initialization Complete!');
        console.log('👉 Run "kcflow gen" to generate code.');
    });

// 👉 Command: GEN
program
    .command('gen')
    .alias('generate')
    .description('Generate code from your spec')
    .action(async () => {
        const spinner = ora('Reading configuration...').start();

        try {
            const cwd = process.cwd();

            // 1. อ่าน Config
            const configPath = path.join(cwd, 'kcflow.config.json');
            if (!fs.existsSync(configPath)) {
                throw new Error('Config file not found. Please run "kcflow init" first.');
            }
            const config = fs.readJsonSync(configPath);

            // 2. อ่าน Spec
            spinner.text = 'Compiling API Spec...';
            const spec = await loadSpec(config.spec);

            // 3. ส่งขึ้น Cloud ☁️
            spinner.text = 'Generating Code on Cloud...';
            // เพิ่ม https:// เพื่อความชัวร์ (ถ้าใน cloud.ts ยังไม่ใส่)
            const result = await sendToCloud({
                spec,
                config
            });

            // 4. เขียนไฟล์ลงเครื่อง 💾
            spinner.text = 'Writing files...';

            // บังคับลง src/generated ตามมาตรฐาน Gold Standard
            const relativeBaseDir = config.output?.baseDir || './src/kcflow';
            const baseDir = path.resolve(cwd, relativeBaseDir);

            fs.emptyDirSync(baseDir);

            // Loop เขียนไฟล์ที่ Cloud ส่งมา
            Object.entries(result.files).forEach(([filePath, content]) => {
                // filePath เช่น "client/index.ts" หรือ "types.d.ts"
                if (content) {
                    const fullPath = path.join(baseDir, filePath);
                    // outputFileSync ฉลาดพอที่จะสร้าง folder client/ หรือ router/ ให้เอง
                    fs.outputFileSync(fullPath, content as string);
                }
            });

            spinner.succeed('Generation Successful! 🚀');
            console.log(`   📂 Files generated at: ${relativeBaseDir}`);

        } catch (error: any) {
            spinner.fail('Generation Failed');
            console.error(`\n❌ Error: ${error.message}`);
            process.exit(1);
        }
    });

program.parse(process.argv);