import { ChildProcess, exec, spawn } from 'child_process';


const buildCommand = 'cd ../../ && npm run build';
const startHostCommand = 'cd ../../ && /opt/ccf_virtual/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count 3 --initial-user-count 0 --constitution-dir ./governance/constitution'

export default class Host {
    private static readonly processes = new Array<ChildProcess>();

    public static async start(): Promise<void> {
        console.log(`📀 [Running] - Build App`);
        await this.run(buildCommand);

        console.log(`\n📀 [Running] - Start Host\n`);
        await this.run(startHostCommand);

        console.log(`✅ [Done] - Testing Environment Ready!`);
    }

    public static async stop(): Promise<void> {
        console.log(`\n📀 [Running] - Stop Host\n`);
        this.processes.forEach((process) => {
            if (!process.exitCode) {
                try { 
                process.stdin?.end();
                }
                catch (e) {
                    console.log(e);
                }
            }
        });
    }

    private static run(command: string): Promise<void> {
        try {
            return new Promise((resolve, reject) => {

                const process = exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error(error);
                        reject(error);
                    }

                    resolve();
                   });

               
                process.stdout?.on('data', (data) => {
                    console.log(data);

                    if (data.includes('Press Ctrl+C')) {
                        resolve();
                    }
                });

                this.processes.push(process);
                
            });
        } catch (e) {
            console.log(e);
            throw new Error("🛑 [TEST FAILURE]: Failed to start host");   
        }
    }
}