import { Controller, Post, Body, Get, Param, Query, Res, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { FactureService } from './facture.service';
import { FactureCalculDto } from './facture.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { Response } from 'express';
import { AuditLogService } from '../audit/audit-log.service';


@ApiTags('Factures')
@ApiBearerAuth()
@Controller('facture')
@UseGuards(RolesGuard)
export class FactureController {
  constructor(
    private readonly factureService: FactureService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Post('calculer')
  @ApiOperation({ summary: 'Calculer une facture' })
  @ApiResponse({ status: 201, description: 'Facture calculée.' })
  @ApiBody({ type: FactureCalculDto })
  calculer(@Body() dto: FactureCalculDto) {
    return this.factureService.calculerFacture(dto);
  }

  @Get(':id/export')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Exporter une facture' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID de la facture' })
  @ApiQuery({ name: 'format', enum: ['pdf', 'excel', 'csv'], required: false, description: 'Format du fichier exporté' })
  @ApiResponse({ status: 200, description: 'Fichier exporté.' })
  async exportInvoice(
    @Param('id') id: string,
    @Query('format') format: 'pdf' | 'excel' | 'csv' = 'pdf',
    @Res() res: Response,
    @Req() req: any
  ) {
    const { buffer, filename, contentType } = await this.factureService.exportInvoice(Number(id), format);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    await this.auditLogService.log(req.user?.id || 0, `export_invoice_${format}`, 'Facture', id);
    return res.send(buffer);
  }
}
