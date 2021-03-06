import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { log } from "@batch-flask/utils";
import { BatchLabsService } from "app/services/batch-labs.service";
import { LocalFileStorage as NodeLocalFileStorage } from "client/core";

/**
 * This service is used to read/write files to the user data folder.
 * Prefer this for writing big data over LocalFileStorage
 * Each key is a different file under userData.
 */
@Injectable()
export class LocalFileStorage {
    private _localStorage: NodeLocalFileStorage;

    constructor(batchLabs: BatchLabsService) {
        this._localStorage = batchLabs.getLocalFileStorage();

    }

    /**
     * @param key Key where the data is store
     * @returns Observable which will resolve the data contained in the file if successfull or reject if any error
     */
    public get<T>(key: string): Observable<T> {
        return Observable.fromPromise(this.getAsync(key));
    }

    public async getAsync<T>(key: string): Promise<T> {
        const content = await this._localStorage.read(key);
        if (!content) {
            return {} as any;
        }

        try {
            const json = JSON.parse(content);
            return json;
        } catch (e) {
            log.error("Loading file from storage has invalid json", { key, content });
            return {} as any;
        }
    }

    /**
     * Store the given data into the given file.
     * @param filename Key to store the data(Corespond to a file under userdata)
     * @param data Javascript object(JSON format) to store
     * @returns observable that will resolve if saving is sucessfull or reject if any error
     */
    public set<T>(key: string, data: T): Observable<{}> {
        return Observable.fromPromise(this._localStorage.set(key, data));

    }

    public read(key: string): Observable<string> {
        return Observable.fromPromise(this._localStorage.read(key));
    }

    public write(key: string, content: string): Observable<string> {
        return Observable.fromPromise(this._localStorage.write(key, content));
    }
}
