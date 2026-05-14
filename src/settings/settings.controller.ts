import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Settings } from './settings.entity';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Roles('admin', 'user')
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  @Roles('admin')
  updateSettings(@Body() payload: Partial<Settings>, @Req() req: any) {
    return this.settingsService.updateSettings(payload, req.user.id);
  }
}
