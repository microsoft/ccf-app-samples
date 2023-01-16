import { exec, execSync } from 'child_process';

const buildCommand = 'npm run build';
const startHostCommand = '/opt/ccf_virtual/bin/sandbox.sh --js-app-bundle ./dist/ --initial-member-count 3 --initial-user-count 0 --constitution-dir ./governance/constitution'

export default class Host {

    public static async start(): Promise<void> {
        //
        console.log(`📀 [Running] - Build App`);
        await this.run(buildCommand);

        console.log(`\n📀 [Running] - Start Host\n`);
        await this.run(startHostCommand);

        console.log(`✅ [Done] - Testing Environment Ready!`);
    }

    public static stop() {
        console.log(`\n📀 [Running] - Stop Host\n`);

        /**
         * Sandbox script spins up the host in a child process using python
         * We query the python processes and kill it
         * This makes sure the host is stopped and the sandbox is cleaned up
         * This also makes the e2e test script idempotent
         */
        execSync('kill -9 $(pgrep python)');
    }

    private static run(command: string): Promise<void> {
        try {
            return new Promise((resolve, reject) => {
                const childProcess = exec(command, (error) => {
                    if (error && error.code !== 137) {
                        console.error(error);
                        reject(error);
                        return;
                    }

                    resolve();
                   });

               
                childProcess.stdout?.on('data', (data) => {
                    console.log(data);

                    if (data.includes('Press Ctrl+C')) {
                        resolve();
                    }
                });          
            });
        } catch (e) {
            console.log(e);
            throw new Error("🛑 [TEST FAILURE]: Failed to start host");   
        }
    }
}