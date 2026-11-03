"use client";

import type { EpisodeMeta } from "@/types/podcast";

const DB_NAME = "micdrop-ai";
const DB_VERSION = 1;
const META_STORE = "episodes";
const AUDIO_STORE = "audio";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available in this browser."));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error("Could not open the episode library."));
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(META_STORE)) {
        const store = db.createObjectStore(META_STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
      if (!db.objectStoreNames.contains(AUDIO_STORE)) {
        db.createObjectStore(AUDIO_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
  });

  return dbPromise;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Storage operation failed."));
  });
}

export async function saveEpisode(meta: EpisodeMeta, audioBlob?: Blob | null): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([META_STORE, AUDIO_STORE], "readwrite");
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Could not save episode."));
    transaction.objectStore(META_STORE).put(meta);
    if (audioBlob) {
      transaction.objectStore(AUDIO_STORE).put(audioBlob, meta.id);
    }
  });
}

export async function listEpisodes(): Promise<EpisodeMeta[]> {
  const db = await openDatabase();
  const transaction = db.transaction(META_STORE, "readonly");
  const episodes = await requestToPromise(
    transaction.objectStore(META_STORE).getAll() as IDBRequest<EpisodeMeta[]>,
  );
  return episodes.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getEpisode(id: string): Promise<EpisodeMeta | null> {
  const db = await openDatabase();
  const transaction = db.transaction(META_STORE, "readonly");
  const episode = await requestToPromise(
    transaction.objectStore(META_STORE).get(id) as IDBRequest<EpisodeMeta | undefined>,
  );
  return episode ?? null;
}

export async function getEpisodeAudio(id: string): Promise<Blob | null> {
  const db = await openDatabase();
  const transaction = db.transaction(AUDIO_STORE, "readonly");
  const blob = await requestToPromise(
    transaction.objectStore(AUDIO_STORE).get(id) as IDBRequest<Blob | undefined>,
  );
  return blob ?? null;
}

export async function deleteEpisodeAudio(id: string): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(AUDIO_STORE, "readwrite");
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Could not clear episode audio."));
    transaction.objectStore(AUDIO_STORE).delete(id);
  });
}

export async function deleteEpisode(id: string): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([META_STORE, AUDIO_STORE], "readwrite");
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Could not delete episode."));
    transaction.objectStore(META_STORE).delete(id);
    transaction.objectStore(AUDIO_STORE).delete(id);
  });
}
