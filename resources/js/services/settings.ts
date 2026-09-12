import {storage} from '@/adapters/storage';
export interface Preferences{enabled:boolean[];userStatuses:string[];value:string;mode:string}
export interface Organization{name:string;systemName:string;unit:string;email:string;phone:string}
export const SettingsService={organization:()=>storage.get<Organization>('organization',{name:'Aeroclube de Juiz de Fora',systemName:'AeroTI',unit:'Aeroclube de Juiz de Fora',email:'ti@aeroclube.local',phone:'(32) 3233-1000'}),saveOrganization(value:Organization){storage.set('organization',value)},preferences:()=>storage.get<Record<string,Preferences>>('preferences',{}),savePreferences(value:Record<string,Preferences>){storage.set('preferences',value)}};
