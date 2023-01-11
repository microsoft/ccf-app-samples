import { DemoMemberProps, DemoProps } from './index';
import axios from 'axios';

export default class Api {
    public static async ingest(props: DemoProps, member: DemoMemberProps) {
        console.log(`📝 [${member.id}] Ingesting Data...`);

        try {
            const result = await axios.post(props.ingestUrl, member.data, { httpsAgent: member.httpsAgent });

            console.log(`📝 [${member.id}] Response...\n\t ✅ [${result.status}] - ${result.data.content}\n`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorDetails = {
                    cause: error.cause,
                    code: error.code,
                    message: error.message,
                    status: error.status,
                    statusText: error.response?.status,
                };
                console.error('🛑 ...Error...\n', errorDetails);
            }
        }
    }

    public static async report(props: DemoProps, member: DemoMemberProps) {
        console.log(`📝 [${member.id}] Reporting Data...`);

        try {
            const result = await axios.get(props.reportUrl, { httpsAgent: member.httpsAgent });

            console.log(`📝 [${member.id}] Response...\n\t ✅ [${result.status}]\n`);
            console.table(result.data.content);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const errorDetails = {
                    cause: error.cause,
                    code: error.code,
                    message: error.message,
                    status: error.status,
                    statusText: error.response?.status,
                };
                console.error('🛑 ...Error...\n', errorDetails);
            }
        }
    }
}
