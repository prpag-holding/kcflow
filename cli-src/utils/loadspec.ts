import path from 'path';

export async function loadSpec(specPath: string) {
    // 🛡️ Register ts-node แบบ Isolated (ไม่สน config user)
    try {
        require('ts-node').register({
            transpileOnly: true,
            skipProject: true, // 👈 สำคัญ: เมิน tsconfig ของ user
            compilerOptions: {
                module: 'commonjs',
                target: 'es2020',
                strict: false,
                esModuleInterop: true
            }
        });
    } catch (e) {
        throw new Error('Dependency missing: ts-node. Please reinstall CLI.');
    }

    const absolutePath = path.resolve(process.cwd(), specPath);
    
    // ล้าง Cache เผื่อ user แก้ไฟล์แล้วรันซ้ำโดยไม่ restart process (อนาคต)
    delete require.cache[require.resolve(absolutePath)];

    try {
        const module = require(absolutePath);
        // รองรับทั้ง export default และ module.exports
        return module.default || module;
    } catch (error: any) {
        throw new Error(`Cannot load spec file at ${absolutePath}\n${error.message}`);
    }
}