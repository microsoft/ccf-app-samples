import Api from './api';
import https from 'https';
import fs from 'fs';
import { member0DataPart1, member0DataPart2, member1Data, member2Data } from './data';

const serverUrl = 'https://127.0.0.1:8000';
const certificateStorePath = '../../workspace/sandbox_common';

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
    //
    private static readonly demoProps: DemoProps = {
        ingestUrl: `${serverUrl}/app/ingest`,
        reportUrl: `${serverUrl}/app/report`,
        proposalUrl: `${serverUrl}/gov/proposals`,
    };

    private static memberDataMap = new Map([['0', member0DataPart1], ['1', member1Data], ['2', member2Data]]);
    private static memberIds = ['0', '1', '2']

    private static readonly members = Array<DemoMemberProps>();

    public static async start() {

        this.printTestSectionHeader('🏁 Starting e2e Tests...');

        for(const memberId of this.memberIds) {
            const member = this.createMember(memberId);
            this.members.push(member);
        }

        this.printTestSectionHeader('🔬 [TEST]: Ingestion & Reporting...');

        for (const member of this.members) {
            await Api.ingest(this.demoProps, member);
        }

        for (const member of this.members) {
            await Api.report(this.demoProps, member);
        }

        this.printTestSectionHeader('🔬 [TEST]: Report Changes...');

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
            cert: fs.readFileSync(`${certificateStorePath}/member${memberId}_cert.pem`),
            key: fs.readFileSync(`${certificateStorePath}/member${memberId}_privk.pem`),
            ca: fs.readFileSync(`${certificateStorePath}/service_cert.pem`),
        })
    }

    private static printTestSectionHeader(title: string) {
        console.log('\n\n');
        console.log(`${title}\n`);
        console.log('===============================\n');
    }
}

Demo.start();
