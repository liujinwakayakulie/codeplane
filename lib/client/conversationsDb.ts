/**
 * IndexedDB 封装 —— 每场问答独立存储
 *
 * 数据模型 Conversation：一场 prompt + reply 的对线记录
 *
 * 不引入第三方库（idb-keyval 之类），原生 IndexedDB API + Promise 包装就够了。
 */

export type Conversation = {
  id: string;
  /** 创建时间戳（ms） */
  createdAt: number;
  /** 玩家当时扮演的角色 */
  role: "human" | "copilot";
  /** 人类提问文本 */
  prompt: string;
  /** AI（copilot 玩家）回答文本 */
  reply: string;
};

const DB_NAME = "yacb-db-v1";
const STORE = "conversations";
const DB_VERSION = 1;

declare global {
  interface Window {
    __yacbDbPromise?: Promise<IDBDatabase>;
  }
}

function openDb(): Promise<IDBDatabase> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("IndexedDB not available on server"));
  }
  if (window.__yacbDbPromise) return window.__yacbDbPromise;

  window.__yacbDbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  return window.__yacbDbPromise;
}

function tx(
  db: IDBDatabase,
  mode: IDBTransactionMode
): IDBObjectStore {
  return db.transaction(STORE, mode).objectStore(STORE);
}

function promisify<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const uid = () =>
  `conv_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

/** 写入一条对话 */
export async function addConversation(
  input: Omit<Conversation, "id" | "createdAt">
): Promise<Conversation> {
  const conv: Conversation = { id: uid(), createdAt: Date.now(), ...input };
  const db = await openDb();
  await promisify(tx(db, "readwrite").add(conv));
  return conv;
}

/** 列表：默认按 createdAt 降序，最新在前 */
export async function listConversations(opts?: {
  limit?: number;
  offset?: number;
}): Promise<Conversation[]> {
  const db = await openDb();
  const idx = tx(db, "readonly").index("createdAt");
  return new Promise<Conversation[]>((resolve, reject) => {
    const results: Conversation[] = [];
    const limit = opts?.limit ?? 100;
    const offset = opts?.offset ?? 0;
    let skipped = 0;
    const cursorReq = idx.openCursor(null, "prev"); // 降序
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (!cursor || results.length >= limit) {
        resolve(results);
        return;
      }
      if (skipped < offset) {
        skipped++;
      } else {
        results.push(cursor.value as Conversation);
      }
      cursor.continue();
    };
    cursorReq.onerror = () => reject(cursorReq.error);
  });
}

/** 删除一条 */
export async function deleteConversation(id: string): Promise<void> {
  const db = await openDb();
  await promisify(tx(db, "readwrite").delete(id));
}

/** 清空全部 */
export async function clearAllConversations(): Promise<void> {
  const db = await openDb();
  await promisify(tx(db, "readwrite").clear());
}
