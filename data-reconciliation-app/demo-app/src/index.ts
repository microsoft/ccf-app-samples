import Api from './api';
import https from 'https';
import fs from 'fs';
import { member0DataPart1, member0DataPart2, member1Data, member2Data } from './data';

const serverUrl = 'https://127.0.0.1:8000';

export interface DemoProps {
    ingestUrl: string;
    reportUrl: string;
    proposalUrl: string;
}

export interface DemoMemberProps {
    id: string;
    data: unknown;
    httpsAgent: https.Agent;
}

class Demo {
    private readonly demoProps: DemoProps = {
        ingestUrl: `${serverUrl}/app/ingest`,
        reportUrl: `${serverUrl}/app/report`,
        proposalUrl: `${serverUrl}/gov/proposals`,
    };

    private readonly members = Array<DemoMemberProps>();

    async start() {
        console.log('\n\n===============================\n\n');
        console.log('🏁 Starting demo...\n');

        const member0: DemoMemberProps = {
            id: 'Member 0',
            data: member0DataPart1,
            httpsAgent: new https.Agent({
                cert: fs.readFileSync(`../workspace/sandbox_common/member0_cert.pem`),
                key: fs.readFileSync(`../workspace/sandbox_common/member0_privk.pem`),
                ca: fs.readFileSync('../workspace/sandbox_common/service_cert.pem'),
            }),
        };

        const member1: DemoMemberProps = {
            id: 'Member 1',
            data: member1Data,
            httpsAgent: new https.Agent({
                cert: fs.readFileSync(`../workspace/sandbox_common/member1_cert.pem`),
                key: fs.readFileSync(`../workspace/sandbox_common/member1_privk.pem`),
                ca: fs.readFileSync('../workspace/sandbox_common/service_cert.pem'),
            }),
        };

        const member2: DemoMemberProps = {
            id: 'Member 2',
            data: member2Data,
            httpsAgent: new https.Agent({
                cert: fs.readFileSync(`../workspace/sandbox_common/member2_cert.pem`),
                key: fs.readFileSync(`../workspace/sandbox_common/member2_privk.pem`),
                ca: fs.readFileSync('../workspace/sandbox_common/service_cert.pem'),
            }),
        };

        console.log('\n\n===============================\n\n');
        console.log('👀 Part 1: Ingestion & Reporting...\n');

        this.members.push(member0, member1, member2);

        for (const member of this.members) {
            await Api.ingest(this.demoProps, member);
        }

        for (const member of this.members) {
            await Api.report(this.demoProps, member);
        }

        console.log('\n\n===============================\n\n');
        console.log('👀 Part 2: Report Changes...\n');

        member0.data = member0DataPart2;
        await Api.ingest(this.demoProps, member0);
        await Api.report(this.demoProps, member0);
    }
}

new Demo().start();
