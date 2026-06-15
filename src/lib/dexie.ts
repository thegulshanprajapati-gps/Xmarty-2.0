import Dexie, { type Table } from 'dexie';

export interface LocalAnswer {
  sessionId: string;
  answers: Record<string, any>;
  lastSaved: Date;
}

export class XmartyOfflineDB extends Dexie {
  localAnswers!: Table<LocalAnswer>;

  constructor() {
    super('XmartyOfflineDB');
    this.version(1).stores({
      localAnswers: 'sessionId'
    });
  }
}

export const offlineDb = new XmartyOfflineDB();
