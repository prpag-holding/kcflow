import fs from 'fs';
import path from 'path';

export function setupProjectConfig(baseDir: string) {
    const tsConfigPath = path.join(baseDir, 'tsconfig.json');
    const jsConfigPath = path.join(baseDir, 'jsconfig.json');

    let targetFile = jsConfigPath; // Default เป็น JS
    let isNewFile = true;

    // เช็คว่า User มีไฟล์อะไรอยู่แล้วหรือเปล่า
    if (fs.existsSync(tsConfigPath)) {
        targetFile = tsConfigPath;
        isNewFile = false;
    } else if (fs.existsSync(jsConfigPath)) {
        targetFile = jsConfigPath;
        isNewFile = false;
    }

    try {
        let config: any = { compilerOptions: {} };

        if (!isNewFile) {
            // อ่านไฟล์เดิม (ระวัง JSON comment พังได้ ถ้า user มี comment ให้ข้ามไปก่อน)
            try {
                config = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));
            } catch (e) {
                console.warn(`⚠️  Warning: Could not parse ${path.basename(targetFile)} (Comments inside?). Skipping alias setup.`);
                return;
            }
        }

        // เตรียมโครงสร้าง
        if (!config.compilerOptions) config.compilerOptions = {};
        if (!config.compilerOptions.baseUrl) config.compilerOptions.baseUrl = '.';
        if (!config.compilerOptions.paths) config.compilerOptions.paths = {};

        // ✅ เติม Alias
        config.compilerOptions.paths['@kcflow/*'] = ['./src/generated/*'];

        fs.writeFileSync(targetFile, JSON.stringify(config, null, 2));
        
        console.log(`✅ ${isNewFile ? 'Created' : 'Updated'} ${path.basename(targetFile)} with "@kcflow/*" alias.`);

    } catch (error) {
        console.warn(`⚠️  Manual setup required for aliases.`);
    }
}