import Dexie, { type Table } from 'dexie';

export interface OfflineSnapshot {
  id: string;
  created_at: string;
  total_registros: number;
  payload_json: string;
}

export interface PendingMutation {
  id?: number;
  tabla: string;
  operacion: 'insert' | 'update' | 'delete';
  registro_id: string;
  payload_json: string;
  created_at: string;
}

class SindiCatOfflineDB extends Dexie {
  snapshots!: Table<OfflineSnapshot, string>;
  sync_queue!: Table<PendingMutation, number>;

  constructor() {
    super('SindiCatOfflineDB');
    this.version(1).stores({
      snapshots: 'id, created_at',
      sync_queue: '++id, tabla, created_at',
    });
  }
}

export const offlineDb = new SindiCatOfflineDB();