import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDocs,
  query,
  orderBy,
  increment,
  Timestamp,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyB4pq7C_lc3DA2sGgaqimTRTCkl0cNjocs",
  authDomain: "mart-c81b6.firebaseapp.com",
  projectId: "mart-c81b6",
  storageBucket: "mart-c81b6.firebasestorage.app",
  messagingSenderId: "70750773228",
  appId: "1:70750773228:web:ffb8af0bc0d6eab24aaac9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export interface ShareEntry {
  id:          string;
  name:        string;        
  displayName: string;        
  anonymous:   boolean;
  perfumeId:   string;
  perfumeName: string;
  accent:      string;
  tagline:     string;
  traits:      string[];
  personality: string;
  ts:          number;
  reactions:   number;
  isPublic:    boolean;       
  method:      string;        
}

export interface TakenName {
  name:      string;
  perfumeId: string;
  docId:     string;
}

// ── Internal parser ────────────────────────────────────────────────────────
const fromSnap = (snap: QuerySnapshot<DocumentData>): ShareEntry[] =>
  snap.docs.map((d) => {
    const data = d.data();
    return {
      id:          d.id,
      name:        (data.name        as string) ?? (data.displayName as string) ?? "Noma'lum",
      displayName: (data.displayName as string) ?? "Noma'lum",
      anonymous:   (data.anonymous   as boolean) ?? false,
      perfumeId:   (data.perfumeId   as string)  ?? "",
      perfumeName: (data.perfumeName as string)  ?? "",
      accent:      (data.accent      as string)  ?? "#fff",
      tagline:     (data.tagline     as string)  ?? "",
      traits:      (data.traits      as string[]) ?? [],
      personality: (data.personality as string)  ?? "",
      ts:
        data.ts instanceof Timestamp
          ? data.ts.toMillis()
          : (data.ts as number) ?? 0,
      reactions: (data.reactions as number)  ?? 0,
      isPublic:  (data.isPublic  as boolean) ?? false,
      method:    (data.method    as string)  ?? "manual",
    };
  });

export const createEntry = async (
  entry: Omit<ShareEntry, "id">
): Promise<string> => {
  const ref = await addDoc(collection(db, "shares"), {
    ...entry,
    ts: Timestamp.now(),
  });
  return ref.id;
};

export const updateEntry = async (
  docId: string,
  data: Partial<Omit<ShareEntry, "id">>
): Promise<void> => {
  await updateDoc(doc(db, "shares", docId), {
    ...data,
    ts: Timestamp.now(),
  });
};

export const deleteEntry = async (docId: string): Promise<void> => {
  await deleteDoc(doc(db, "shares", docId));
};


export const addReaction = async (shareId: string): Promise<void> => {
  await updateDoc(doc(db, "shares", shareId), {
    reactions: increment(1),
  });
};

export const subscribeToAllNames = (
  callback: (names: TakenName[]) => void
): (() => void) => {
  const q = query(collection(db, "shares"), orderBy("ts", "desc"));
  return onSnapshot(q, (snap) => {
    const names: TakenName[] = snap.docs.map((d) => ({
      name:      (d.data().name      as string) ?? (d.data().displayName as string) ?? "",
      perfumeId: (d.data().perfumeId as string) ?? "",
      docId:     d.id,
    }));
    callback(names);
  });
};

export const subscribeToPublicShares = (
  callback: (entries: ShareEntry[]) => void
): (() => void) => {
  const q = query(collection(db, "shares"), orderBy("ts", "desc"));
  return onSnapshot(q, (snap) =>
    callback(fromSnap(snap).filter((s) => s.isPublic))
  );
};


export const getAllEntries = async (): Promise<ShareEntry[]> => {
  const snap = await getDocs(
    query(collection(db, "shares"), orderBy("ts", "desc"))
  );
  return fromSnap(snap);
};
