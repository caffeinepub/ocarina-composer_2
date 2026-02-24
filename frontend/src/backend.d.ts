import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Song {
    id: bigint;
    title: string;
    lyrics: string;
    description: string;
    notes: Array<Note>;
}
export interface UserProfile {
    name: string;
}
export interface Note {
    duration: string;
    pitch: string;
    timingPosition: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createSong(title: string, description: string, notes: Array<Note>, lyrics: string): Promise<bigint>;
    deleteSong(id: bigint): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getSong(id: bigint): Promise<Song | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listSongs(): Promise<Array<Song>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateSong(id: bigint, title: string, description: string, notes: Array<Note>, lyrics: string): Promise<boolean>;
}
