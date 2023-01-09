import { MINIMUM_VOTES_THRESHOLD } from "../utils/constants";
import { ServiceResult } from "../utils/service-result";
import { DataAttributeType } from "./data-record";
import { ReconciledRecord } from "./reconciled-record";

export enum SummaryGroupStatus {
  NotEnoughData = "NOT_ENOUGH_DATA",
  LackOfConsensus = "LACK_OF_CONSENSUS",
  InConsensus = "IN_CONSENSUS",
}

export enum SummaryStatus {
  Majority = "Majority",
  Minority = "Minority",
}

export interface SummaryRecordProps {
  key: string;
  value: DataAttributeType;
  type: string;
  minorityMajorityStatus: SummaryStatus;
  groupStatus: SummaryGroupStatus;
  membersInAgreementCount: number;
  membersInDisagreementCount: number;
  votesCount: number;
  uniqueValuesCount: number;
}

export class SummaryRecord implements SummaryRecordProps {
  readonly key: string;
  readonly value: DataAttributeType;
  readonly type: string;
  readonly minorityMajorityStatus: SummaryStatus;
  readonly groupStatus: SummaryGroupStatus;
  readonly membersInAgreementCount: number;
  readonly membersInDisagreementCount: number;
  readonly activeMembersCount: number;
  readonly votesCount: number;
  readonly uniqueValuesCount: number;

  private constructor(summaryRecord: SummaryRecordProps) {
    this.key = summaryRecord.key;
    this.value = summaryRecord.value;
    this.type = summaryRecord.type;
    this.minorityMajorityStatus = summaryRecord.minorityMajorityStatus;
    this.groupStatus = summaryRecord.groupStatus;
    this.membersInAgreementCount = summaryRecord.membersInAgreementCount;
    this.membersInDisagreementCount = summaryRecord.membersInDisagreementCount;
    this.votesCount = summaryRecord.votesCount;
    this.uniqueValuesCount = summaryRecord.uniqueValuesCount;
  }

  public static create(
    memberId: string,
    record: ReconciledRecord
  ): ServiceResult<SummaryRecord> {
    if (!record.key) {
      return ServiceResult.Failed({
        errorMessage: "Error: key cannot be null or empty",
        errorType: "InvalidRecordKey",
      });
    }

    if (!record.values) {
      return ServiceResult.Failed({
        errorMessage: "Error: values can not be null or empty",
        errorType: "InvalidRecordValue",
      });
    }

    // handle the case of: a member requesting a report for a key that he didn't submit data for it
    if (!record.values.hasOwnProperty(memberId)) {
      return ServiceResult.Failed({
        errorMessage: "Error: The key does not exist",
        errorType: "InvalidRecordKey",
      });
    }

    // list of all members' Ids
    const memberIds = Object.keys(record.values);

    // list of all ingested values for same key
    const values = Object.values(record.values);

    // create a list of unique Values using set data structure
    const uniqueValues = new Set(values);

    // current member vote
    const memberValue = record.values[memberId];

    // count of members who voted
    const votesCount = memberIds.length;

    // count of members who submitted a value same as the current member (caller)
    const membersInAgreementCount = memberIds.filter(
      (key) => record.values[key] == memberValue
    ).length;

    // count of members who submitted a value differ from the current member (caller)
    const membersInDisagreementCount = memberIds.filter(
      (key) => record.values[key] != memberValue
    ).length;

    const summary: SummaryRecordProps = {
      key: record.key,
      value: memberValue,
      type: record.type,
      minorityMajorityStatus: this.getSubDivisionStatus(
        membersInAgreementCount,
        membersInDisagreementCount
      ),
      groupStatus: this.getGroupStatus(votesCount, uniqueValues.size),
      membersInAgreementCount: membersInAgreementCount,
      membersInDisagreementCount: membersInDisagreementCount,
      votesCount: votesCount,
      uniqueValuesCount: uniqueValues.size,
    };

    const dataRecord = new SummaryRecord(summary);
    return ServiceResult.Succeeded(dataRecord);
  }

  // get the status of current value is it in (Majority or Minority) group
  private static getSubDivisionStatus(
    membersInAgreementCount: number,
    membersInDisagreementCount: number
  ) {
    if (membersInAgreementCount > membersInDisagreementCount) {
      return SummaryStatus.Majority;
    }
    return SummaryStatus.Minority;
  }

  // get group status (NotEnoughVotes,LackOfConsensus, InConsensus)
  private static getGroupStatus(votesCount: number, uniqueValuesCount: number) {
    if (votesCount < MINIMUM_VOTES_THRESHOLD) {
      return SummaryGroupStatus.NotEnoughData;
    } else if (uniqueValuesCount != 1) {
      return SummaryGroupStatus.LackOfConsensus;
    }
    return SummaryGroupStatus.InConsensus;
  }
}
