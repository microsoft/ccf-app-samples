import { MINIMUM_VOTES_THRESHOLD } from "../utils/constants";
import { ServiceResult } from "../utils/service-result";
import { DataAttributeType } from "./data-record";
import { ReconciledRecord } from "./reconciled-record";

export enum SummaryGroupStatus {
  None = 'None',
  NotEnoughVotes = 'NOT_ENOUGH_VOTES',
  LackOfConsensus = 'LACK_OF_CONSENSUS',
  InConsensus = 'IN_CONSENSUS',
}

export enum SummaryStatus {
  None = 'None',
  Majority = 'Majority',
  Minority = 'Minority'
}

export class StringStatistics {

}

export class NumberStatistics {
  mean: number;
  std: number;
}

export type Statistics = StringStatistics | NumberStatistics;


export interface ISummaryRecord {
  key: string;
  value: DataAttributeType;
  status: SummaryStatus;
  groupStatus: SummaryGroupStatus;
  membersInAgreementCount: number;
  membersInDisagreementCount: number;
  votesCount: number;
  uniqueValuesCount: number;
  statistics: Statistics
}

export class SummaryRecord implements ISummaryRecord {

  readonly key: string;
  readonly value: DataAttributeType;
  readonly status: SummaryStatus;
  readonly groupStatus: SummaryGroupStatus;
  readonly membersInAgreementCount: number;
  readonly membersInDisagreementCount: number;
  readonly activeMembersCount: number;
  readonly votesCount: number;
  readonly uniqueValuesCount: number;
  readonly statistics: Statistics;

  private constructor(summaryRecord: ISummaryRecord) {
    this.key = summaryRecord.key;
    this.value = summaryRecord.value;
    this.status = summaryRecord.status;
    this.groupStatus = summaryRecord.groupStatus;
    this.membersInAgreementCount = summaryRecord.membersInAgreementCount;
    this.membersInDisagreementCount = summaryRecord.membersInDisagreementCount;
    this.votesCount = summaryRecord.votesCount;
    this.uniqueValuesCount = summaryRecord.uniqueValuesCount;

    this.statistics = summaryRecord.statistics;
  }

  public static create(userId: string, record: ReconciledRecord): ServiceResult<SummaryRecord> {
    if (!record.key) {
      return ServiceResult.Failed({
        errorMessage: "Error: key cannot be null or empty",
        errorType: "InvalidRecordKey",
      });
    }

    if (!record.values) {
      return ServiceResult.Failed({
        errorMessage: "Error: value values be null or empty",
        errorType: "InvalidRecordValue",
      });
    }

    if (!record.values.hasOwnProperty(userId)) {
      return ServiceResult.Failed({
        errorMessage: "The key is not exists",
        errorType: "InvalidKey"
      });
    }

    // list of all members' Ids
    const userIds = Object.keys(record.values);

    // list of all ingested values for same key
    const values = Object.values(record.values);

    // create a list of unique Values using set data structure
    const uniqueValues = new Set(values);

    // current member vote
    const memberValue = record.values[userId];

    // count of members who voted
    const votesCount = userIds.length;

    // count of members who submitted a value same as the current member (caller)
    const membersInAgreementCount = userIds.filter((key) => record.values[key] == memberValue).length;

    // count of members who submitted a value differ from the current member (caller)
    const membersInDisagreementCount = userIds.filter((key) => record.values[key] != memberValue).length;

    const summary: ISummaryRecord = {
      key: record.key,
      value: record.values[userId],
      status: this.getStatus(membersInAgreementCount,membersInDisagreementCount),
      groupStatus: this.getGroupStatus(votesCount,membersInAgreementCount),
      membersInAgreementCount: membersInAgreementCount,
      membersInDisagreementCount: membersInDisagreementCount,
      votesCount: votesCount,
      uniqueValuesCount: uniqueValues.size,
      statistics: {},
    }

    const dataRecord = new SummaryRecord(summary);
    return ServiceResult.Succeeded(dataRecord);
  }

  // get the status of current value is it in (Majority or Minority) group
  private static getStatus(membersInAgreementCount : number,membersInDisagreementCount: number) {
    if (membersInAgreementCount > membersInDisagreementCount) {
      return SummaryStatus.Majority;
    }
    return SummaryStatus.Minority;
  }

  // get group status (NotEnoughVotes,LackOfConsensus, InConsensus)
  private static getGroupStatus(votesCount: number, membersInAgreementCount: number) {

    if (votesCount < MINIMUM_VOTES_THRESHOLD) {
      return SummaryGroupStatus.NotEnoughVotes;
    }
    else if (membersInAgreementCount <= (votesCount / 2)) {
      return SummaryGroupStatus.LackOfConsensus;
    }
    return SummaryGroupStatus.InConsensus;
  }

}
