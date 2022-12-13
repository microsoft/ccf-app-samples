export class DataFieldSchema {
  name: string;
  type: string;
}

export class DataSchema {
  key: DataFieldSchema
  value: DataFieldSchema;
}