import IngestData from "./ingest-data";

const serverUrl = "https://127.0.0.1:8000";

export interface DemoProps {
    ingestUrl: string;
    reportUrl: string;
    proposalUrl: string;
}

class Demo {

    private readonly demoProps: DemoProps = {
        ingestUrl: `${serverUrl}/app/ingest`,
        reportUrl: `${serverUrl}/app/report`,
        proposalUrl: `${serverUrl}/gov/proposals`
    }

    start() {
        console.log('\n\n===============================\n\n');
        console.log('🏁 Starting demo...');

        IngestData.run(this.demoProps);
    }
}

new Demo().start();
