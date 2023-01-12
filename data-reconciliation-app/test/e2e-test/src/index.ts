import Api from './api';
import https from 'https';
import fs from 'fs';
import { member0DataPart1, member0DataPart2, member1Data, member2Data } from './data';
import { threadId } from 'worker_threads';

const serverUrl = 'https://127.0.0.1:8000';

export interface DemoProps {
    ingestUrl: string;
    reportUrl: string;
    proposalUrl: string;
}

export interface DemoMemberProps {
    id: string;
    name: string;
    data: unknown;
    httpsAgent: https.Agent;
}

class Demo {
    private static readonly demoProps: DemoProps = {
        ingestUrl: `${serverUrl}/app/ingest`,
        reportUrl: `${serverUrl}/app/report`,
        proposalUrl: `${serverUrl}/gov/proposals`,
    };

    private static memberDataMap = new Map([['0', member0DataPart1], ['1', member1Data], ['2', member2Data]]);
    private static memberIds = ['0', '1', '2']

    private static readonly members = Array<DemoMemberProps>();

    public static async start() {
        console.log('\n\n===============================\n\n');
        console.log('🏁 Starting demo...\n');

        for(const memberId of this.memberIds) {
            const member = this.createMember(memberId);
            this.members.push(member);
        }

        // const member0: DemoMemberProps = {
        //     id: 'member0',
        //     name: 'Member 0',
        //     data: member0DataPart1,
        //     httpsAgent: this.createHttpsAgent('member0'),
        // };

        // const member1: DemoMemberProps = {
        //     id: 'member1',
        //     name: 'Member 1',
        //     data: member1Data,
        //     httpsAgent: new https.Agent({
        //         cert: fs.readFileSync(`../workspace/sandbox_common/member1_cert.pem`),
        //         key: fs.readFileSync(`../workspace/sandbox_common/member1_privk.pem`),
        //         ca: fs.readFileSync('../workspace/sandbox_common/service_cert.pem'),
        //     }),
        // };

        // const member2: DemoMemberProps = {
        //     id: 'member0',
        //     name: 'Member 0',
        //     data: member2Data,
        //     httpsAgent: new https.Agent({
        //         cert: fs.readFileSync(`../workspace/sandbox_common/member2_cert.pem`),
        //         key: fs.readFileSync(`../workspace/sandbox_common/member2_privk.pem`),
        //         ca: fs.readFileSync('../workspace/sandbox_common/service_cert.pem'),
        //     }),
        // };

        console.log('\n\n===============================\n\n');
        console.log('👀 Part 1: Ingestion & Reporting...\n');

        for (const member of this.members) {
            await Api.ingest(this.demoProps, member);
        }

        for (const member of this.members) {
            await Api.report(this.demoProps, member);
        }

        console.log('\n\n===============================\n\n');
        console.log('👀 Part 2: Report Changes...\n');

        const member0 = this.members[0];
        member0.data = member0DataPart2;
        await Api.ingest(this.demoProps, member0);
        await Api.report(this.demoProps, member0);
    }

    private static createMember(memberId: string): DemoMemberProps {
        return {
            id: memberId,
            name: `Member ${memberId}`,
            data: this.memberDataMap.get(memberId),
            httpsAgent: this.createHttpsAgent(memberId),
        };
    }

    private static createHttpsAgent(memberId: string): https.Agent {
        return new https.Agent({
            cert: fs.readFileSync(`../../workspace/sandbox_common/member${memberId}_cert.pem`),
            key: fs.readFileSync(`../../workspace/sandbox_common/member${memberId}_privk.pem`),
            ca: fs.readFileSync('../../workspace/sandbox_common/service_cert.pem'),
        })
    }
}

Demo.start();
