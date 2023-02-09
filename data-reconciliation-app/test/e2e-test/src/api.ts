import { DemoMemberProps, DemoProps } from './index';
import axios from 'axios';

export interface ReportItem {
    group_status: string;
    majority_minority: string;
    count_of_unique_values: number;
    members_in_agreement: number;
    lei: string;
    nace: string;
}

export interface ValidationProps {
    url: string;
    method: 'GET' | 'POST';
    member: DemoMemberProps;
    expectedStatus: number;
    testMessage: string;
}

export class Validator {
    public static async validateRequest(props: ValidationProps) {
        const result = await axios({
            method: props.method,
            url: props.url,
            data: props.member.data,
            httpsAgent: props.member.httpsAgent,
            validateStatus: function (status) {
                return status < 500; // Resolve only if the status code is less than 500
            },
        });

        if (result.status !== props.expectedStatus) {
            throw new Error(`🛑 [TEST FAILURE]: ${props.member.name} - ${props.testMessage}: ${props.expectedStatus} expected, but got ${result.status}.`);
        }

        console.log(`✅ [PASS] ${props.member.name} - ${props.testMessage}`);
    }
}

export default class Api {
    public static async ingest(apiUrl: string, member: DemoMemberProps) {
        const result = await axios.post(apiUrl, member.data, { httpsAgent: member.httpsAgent });

        if (result.status !== 200) {
            throw new Error(`🛑 [TEST FAILURE]: Unexpected status code: ${result.status}`);
        }

        console.log(`✅ [PASS] [${result.status} : ${result.statusText}] - ${member.name} ${result.data.content}`);
    }

    public static async report(props: DemoProps, member: DemoMemberProps): Promise<Array<ReportItem>> {
        console.log(`📝 ${member.name} Full Report:`);

        const result = await axios.get(props.reportUrl, { httpsAgent: member.httpsAgent });

        if (result.status !== 200) {
            throw new Error(`🛑 [TEST FAILURE]: Unexpected status code: ${result.status}`);
        }

        console.log(`✅ [PASS] [${result.status} : ${result.statusText}] - ${member.name}`);
        console.table(result.data.content);

        return result.data.content as Array<ReportItem>;
    }

    public static async reportById(props: DemoProps, member: DemoMemberProps, recordId: string): Promise<ReportItem> {
        console.log(`📝 ${member.name} Reporting Data for id ${recordId}...`);

        const result = await axios.get(`${props.reportUrl}/${recordId}`, { httpsAgent: member.httpsAgent });

        if (result.status !== 200) {
            throw new Error(`🛑 [TEST FAILURE]: Unexpected status code: ${result.status}`);
        }

        console.log(`✅ [PASS] [${result.status} : ${result.statusText}] - ${member.name}`);
        console.table(result.data.content);

        return result.data.content;
    }
}
