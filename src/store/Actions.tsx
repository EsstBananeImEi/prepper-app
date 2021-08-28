import { Method } from "axios";
import { storageApi, useStorageApi } from "../hooks/StorageApi";
import { Action } from "./Store";

export function handleAction(method: Method, path: string, action: Action): void {
    storageApi(method, path,)
}