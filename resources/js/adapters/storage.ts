export interface StorageAdapter {get<T>(key:string,fallback:T):T;set<T>(key:string,value:T):void;remove(key:string):void;clear():void}
export class LocalStorageAdapter implements StorageAdapter {
 private prefix=import.meta.env.VITE_STORAGE_PREFIX||'aeroti'
 private key(key:string){return `${this.prefix}:${key}`}
 get<T>(key:string,fallback:T):T{try{const raw=globalThis.localStorage?.getItem(this.key(key));return raw?JSON.parse(raw) as T:fallback}catch{return fallback}}
 set<T>(key:string,value:T){try{globalThis.localStorage?.setItem(this.key(key),JSON.stringify(value))}catch(error){throw new Error(`Não foi possível salvar ${key}`,{cause:error})}}
 remove(key:string){globalThis.localStorage?.removeItem(this.key(key))}
 clear(){if(!globalThis.localStorage)return;Object.keys(globalThis.localStorage).filter(k=>k.startsWith(`${this.prefix}:`)).forEach(k=>globalThis.localStorage.removeItem(k))}
}
export class ApiStorageAdapter implements StorageAdapter {get<T>(_k:string,f:T){return f} set<T>(_k:string,_v:T){throw new Error('API adapter ainda não configurado')} remove(){} clear(){}}
export class TauriStorageAdapter extends ApiStorageAdapter {}
export const storage=new LocalStorageAdapter()
