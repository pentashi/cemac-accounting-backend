
import { Controller, Post, Get, Body, Query, Res, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { PartnerService } from './partner.service';
import { CreateClientDto, CreateFournisseurDto } from './partner.dto';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Partners')
@Controller('partner')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Post('client')
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client created' })
  @ApiBody({ type: CreateClientDto })
  createClient(@Body() dto: CreateClientDto) {
    return this.partnerService.createClient(dto);
  }

  @Get('client')
  @ApiOperation({ summary: 'Get all clients' })
  @ApiResponse({ status: 200, description: 'List of clients' })
  findAllClients() {
    return this.partnerService.findAllClients();
  }

  @Get('client/export')
  @ApiOperation({ summary: 'Export clients as PDF, Excel, or CSV' })
  @ApiQuery({ name: 'format', enum: ['pdf', 'excel', 'csv'], required: false })
  @ApiResponse({ status: 200, description: 'Exported file' })
  async exportClients(
    @Query('format') format: 'pdf' | 'excel' | 'csv' = 'pdf',
    @Res() res: Response,
    @Req() req: any
  ) {
    const { buffer, filename, contentType } = await this.partnerService.exportClients(format, req.user?.id || 0);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    return res.send(buffer);
  }

  @Post('client/import')
  @ApiOperation({ summary: 'Import clients from CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  async importClients(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    return this.partnerService.importClients(file, req.user?.id || 0);
  }

  @Post('fournisseur')
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created' })
  @ApiBody({ type: CreateFournisseurDto })
  createFournisseur(@Body() dto: CreateFournisseurDto) {
    return this.partnerService.createFournisseur(dto);
  }

  @Get('fournisseur')
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiResponse({ status: 200, description: 'List of suppliers' })
  findAllFournisseurs() {
    return this.partnerService.findAllFournisseurs();
  }

  @Get('fournisseur/export')
  @ApiOperation({ summary: 'Export suppliers as PDF, Excel, or CSV' })
  @ApiQuery({ name: 'format', enum: ['pdf', 'excel', 'csv'], required: false })
  @ApiResponse({ status: 200, description: 'Exported file' })
  async exportFournisseurs(
    @Query('format') format: 'pdf' | 'excel' | 'csv' = 'pdf',
    @Res() res: Response,
    @Req() req: any
  ) {
    const { buffer, filename, contentType } = await this.partnerService.exportFournisseurs(format, req.user?.id || 0);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    return res.send(buffer);
  }

  @Post('fournisseur/import')
  @ApiOperation({ summary: 'Import suppliers from CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  async importFournisseurs(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    return this.partnerService.importFournisseurs(file, req.user?.id || 0);
  }
}
