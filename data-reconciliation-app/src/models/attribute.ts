import * as ccfapp from "@microsoft/ccf-app";

// this is unique for each user
export type User = string;

interface AttributeBase<T> {
  value: T;
  type: "string" | "number";
  votes: Record<User, T> [];
}

export interface StringAttribute extends AttributeBase<string> {
  type: "string";
}

export interface NumericAttribute extends AttributeBase<number> {
  type: "number";
}

export type Attribute = StringAttribute | NumericAttribute;

export type AttributeMap = ccfapp.TypedKvMap<string, Attribute>;

