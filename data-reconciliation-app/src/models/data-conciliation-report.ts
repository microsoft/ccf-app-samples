import { ServiceResult } from "../utils/service-result";
import { ReconciledRecord } from "./reconciled-record";

export interface DataConcilationReportProps {
    userId: string;
    records: Array<ReconciledRecord>;
    key?: string;
}

export enum DataConcilationSummaryGroupStatus {
    NotEnoughData = 'NOT_ENOUGH_DATA',
    LackOfConcensus = 'LACK_OF_CONSENSUS',
    InConcensus = 'IN_CONSENSUS',
}

export interface DataConcilationSummaryStatistics {
    count: number;
    uniqueOpinions: number;
    acceptedCount: number;
}


export interface DataConcilationSummary {
    key: string;
    userOpinion: string,
    groupStatus: DataConcilationSummaryGroupStatus;
    statistics: DataConcilationSummaryStatistics;
  }

export class DataConcilationReport implements DataConcilationSummary {
    public readonly userOpinion: string;
    public readonly groupStatus: DataConcilationSummaryGroupStatus;
    public readonly statistics: DataConcilationSummaryStatistics;

    private constructor(props: DataConcilationSummary) {
        this.userOpinion = props.userOpinion;
        this.groupStatus = props.groupStatus;
        this.statistics = props.statistics;
    }
    

    public static create(userId: string, records: ReconciledRecord[]): ServiceResult<DataConcilationReport> {
        
        // TODO: Do calculations for DataConcilationSummary
        const summary: DataConcilationSummary = {
            key: 'key',
            userOpinion: 'userOpinion',
            groupStatus: DataConcilationSummaryGroupStatus.NotEnoughData,
            statistics: {
                count: 0,
                uniqueOpinions: 0,
                acceptedCount: 0,
            }
        }
        
        const report = new DataConcilationReport(summary);
        return ServiceResult.Succeeded(report);
    }
}