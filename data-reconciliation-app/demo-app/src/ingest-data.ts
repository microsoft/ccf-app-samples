import { DemoProps } from "./index";
import axios from "axios";
import fs from 'fs';
import https from 'https';

export default class IngestData {
    public static run(props: DemoProps) {
        console.log('📝 Ingesting data...');

        // curl $ingestUrl -X POST $(cert_arg member0) -H "Content-Type: application/json" --data-binary "@../../demo-app/data/member0_demo_pt1.json"
        // convert to axios
        const httpsAgent = new https.Agent({
            cert: fs.readFileSync('member0_cert.pem'),
            key: fs.readFileSync('_privk.pem')
          });

        axios.post(props.ingestUrl,  { headers: { "Content-Type": "application/json" }, data: "@../../demo-app/data/member0_demo_pt1.json", httpsAgent })
    }
}