import { DemoMemberProps, DemoProps } from './index';
import axios from 'axios';
import { SummaryRecordProps } from '../../../src/models/summary-record';

export interface ReportItem {
    group_status: string;
    majority_minority: string;
    count_of_unique_values: number;
    members_in_agreement: number;
    lei: string;
    nace: string;
}

export default class Api {
    public static async ingest(props: DemoProps, member: DemoMemberProps) {
        console.log(`📝 ${member.name} Ingesting Data...`);

        const result = await axios.post(props.ingestUrl, member.data, { httpsAgent: member.httpsAgent });

        if (result.status !== 200) {
            throw new Error(`🛑 [TEST FAILURE]: Unexpected status code: ${result.status}`);
        }

        console.log(`✅ [PASS] [${result.status} : ${result.statusText}] - ${member.name} ${result.data.content}\n`);
    }

    public static async report(props: DemoProps, member: DemoMemberProps): Promise<Array<ReportItem>> {
        console.log(`📝 ${member.name} Reporting Data...`);

        const result = await axios.get(props.reportUrl, { httpsAgent: member.httpsAgent });

        if (result.status !== 200) {
            throw new Error(`🛑 [TEST FAILURE]: Unexpected status code: ${result.status}`);
        }

        console.log(`✅ [PASS] [${result.status} : ${result.statusText}] - ${member.name}\n`);
        console.table(result.data.content);

        return result.data.content as Array<ReportItem>;
    }
}
