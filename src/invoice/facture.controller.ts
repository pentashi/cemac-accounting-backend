import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FactureService } from './facture.service';
import { CreateFactureDto, FactureCalculDto, RegisterInvoicePaymentDto, UpdateFactureDto, UpdateFactureStatusDto } from './facture.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { Response } from 'express';
import { AuditLogService } from '../audit/audit-log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Factures')
@ApiBearerAuth()
@Controller('facture')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FactureController {
  constructor(
    private readonly factureService: FactureService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Post('calculer')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Calculer une facture' })
  @ApiResponse({ status: 201, description: 'Facture calculée.' })
  @ApiBody({ type: FactureCalculDto })
  calculer(@Body() dto: FactureCalculDto, @Req() req: any) {
    return this.factureService.calculerFacture(dto, req.user.id);
  }

  @Post()
  @Roles('admin', 'user')
  @ApiBody({ type: CreateFactureDto })
  create(@Body() dto: CreateFactureDto, @Req() req: any) {
    return this.factureService.createFacture(dto, req.user.id);
  }

  @Get()
  @Roles('admin', 'user')
  findAll() {
    return this.factureService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'user')
  findOne(@Param('id') id: string) {
    return this.factureService.findOne(Number(id));
  }

  @Patch(':id')
  @Roles('admin', 'user')
  @ApiBody({ type: UpdateFactureDto })
  update(@Param('id') id: string, @Body() dto: UpdateFactureDto, @Req() req: any) {
    return this.factureService.updateFacture(Number(id), dto, req.user.id);
  }

  @Patch(':id/status')
  @Roles('admin', 'user')
  @ApiBody({ type: UpdateFactureStatusDto })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateFactureStatusDto, @Req() req: any) {
    return this.factureService.updateStatus(Number(id), dto.statut, req.user.id);
  }

  @Post(':id/payments')
  @Roles('admin', 'user')
  @ApiBody({ type: RegisterInvoicePaymentDto })
  registerPayment(@Param('id') id: string, @Body() dto: RegisterInvoicePaymentDto, @Req() req: any) {
    return this.factureService.registerPayment(Number(id), dto, req.user.id);
  }

  @Delete(':id')
  @Roles('admin', 'user')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.factureService.deleteFacture(Number(id), req.user.id);
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
    @Req() req: any,
  ) {
    const { buffer, filename, contentType } = await this.factureService.exportInvoice(Number(id), format);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    await this.auditLogService.log(req.user.id, `export_invoice_${format}`, 'Facture', id);
    return res.send(buffer);
  }
}
