
import { Controller, Post, Get, Body, Query, Res, Req, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { EcritureService } from './ecriture.service';
import { CreateEcritureDto } from './ecriture.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { Response } from 'express';
import { AuditLogService } from '../audit/audit-log.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Accounting Entries')
@Controller('ecriture')
@UseGuards(RolesGuard)
export class EcritureController {
  constructor(
    private readonly ecritureService: EcritureService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get('income-statement')
  getIncomeStatement() {
    return this.ecritureService.getIncomeStatement();
  }

  @Get('balance-sheet')
  getBalanceSheet() {
    return this.ecritureService.getBalanceSheet();
  }

  @Get('balance')
  getBalance() {
    return this.ecritureService.getBalance();
  }

  @Get('export')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Export accounting entries as PDF, Excel, or CSV' })
  @ApiQuery({ name: 'format', enum: ['pdf', 'excel', 'csv'], required: false })
  @ApiResponse({ status: 200, description: 'Exported file' })
  async exportEntries(
    @Query('format') format: 'pdf' | 'excel' | 'csv' = 'pdf',
    @Res() res: Response,
    @Req() req: any
  ) {
    const { buffer, filename, contentType } = await this.ecritureService.exportEntries(format);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    await this.auditLogService.log(req.user?.id || 0, `export_ecriture_${format}`, 'EcritureComptable');
    return res.send(buffer);
  }

  @Post('import')
  @Roles('admin')
  @ApiOperation({ summary: 'Import accounting entries from CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  async importEntries(@UploadedFile() file: any, @Req() req: any) {
    return this.ecritureService.importEntries(file, req.user?.id || 0);
  }

  @Post()
  @ApiBody({ type: CreateEcritureDto })
  create(@Body() dto: CreateEcritureDto) {
    return this.ecritureService.create(dto);
  }

  @Get()
  findAll() {
    return this.ecritureService.findAll();
  }

  @Get('date-range')
  findByDateRange(@Query('start') start: string, @Query('end') end: string) {
    return this.ecritureService.findByDateRange(start, end);
  }

  @Get('account')
  findByAccount(@Query('compte_numero') compte_numero: string) {
    return this.ecritureService.findByAccount(compte_numero);
  }

  @Get('type')
  findByType(@Query('type') type: 'vente' | 'achat') {
    return this.ecritureService.findByType(type);
  }
}
