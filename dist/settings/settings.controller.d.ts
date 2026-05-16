import { SettingsService } from './settings.service';
import { Settings } from './settings.entity';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getSettings(): Promise<Settings>;
    updateSettings(payload: Partial<Settings>, req: any): Promise<Settings>;
}
