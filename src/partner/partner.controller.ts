import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PartnerService } from './partner.service';
import {
  CreateClientDto,
  CreateFournisseurDto,
  UpdateClientDto,
  UpdateFournisseurDto,
} from './partner.dto';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FactureService } from '../invoice/facture.service';
import {
  CreateFactureDto,
  RegisterInvoicePaymentDto,
} from '../invoice/facture.dto';

@ApiTags('Partners')
@Controller('partner')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PartnerController {
  constructor(
    private readonly partnerService: PartnerService,
    private readonly factureService: FactureService,
  ) {}

  @Post('client')
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({ status: 201, description: 'Client created' })
  @ApiBody({ type: CreateClientDto })
  createClient(@Body() dto: CreateClientDto) {
    return this.partnerService.createClient(dto);
  }

  @Get('client')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Get all clients' })
  @ApiResponse({ status: 200, description: 'List of clients' })
  findAllClients() {
    return this.partnerService.findAllClients();
  }

  @Get('client/:id')
  @Roles('admin', 'user')
  findClientById(@Param('id') id: string) {
    return this.partnerService.findClientById(Number(id));
  }

  @Patch('client/:id')
  @Roles('admin')
  @ApiBody({ type: UpdateClientDto })
  updateClient(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.partnerService.updateClient(Number(id), dto);
  }

  @Delete('client/:id')
  @Roles('admin')
  deleteClient(@Param('id') id: string) {
    return this.partnerService.deleteClient(Number(id));
  }

  @Post('client/:id/factures')
  @Roles('admin', 'user')
  @ApiBody({ type: CreateFactureDto })
  createClientInvoice(
    @Param('id') id: string,
    @Body() dto: CreateFactureDto,
    @Req() req: any,
  ) {
    return this.factureService.createFacture(
      { ...dto, clientId: Number(id) },
      req.user.id,
    );
  }

  @Post('client/:clientId/factures/:factureId/paiements')
  @Roles('admin', 'user')
  @ApiBody({ type: RegisterInvoicePaymentDto })
  registerClientPayment(
    @Param('clientId') clientId: string,
    @Param('factureId') factureId: string,
    @Body() dto: RegisterInvoicePaymentDto,
    @Req() req: any,
  ) {
    return this.factureService.registerPayment(
      Number(factureId),
      { ...dto, clientId: Number(clientId) },
      req.user.id,
    );
  }

  @Get('client/export')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Export clients as PDF, Excel, or CSV' })
  @ApiQuery({ name: 'format', enum: ['pdf', 'excel', 'csv'], required: false })
  @ApiResponse({ status: 200, description: 'Exported file' })
  async exportClients(
    @Query('format') format: 'pdf' | 'excel' | 'csv' = 'pdf',
    @Res() res: Response,
    @Req() req: any,
  ) {
    const { buffer, filename, contentType } =
      await this.partnerService.exportClients(format, req.user.id);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    return res.send(buffer);
  }

  @Post('client/import')
  @Roles('admin')
  @ApiOperation({ summary: 'Import clients from CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importClients(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.partnerService.importClients(file, req.user.id);
  }

  @Post('fournisseur')
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created' })
  @ApiBody({ type: CreateFournisseurDto })
  createFournisseur(@Body() dto: CreateFournisseurDto) {
    return this.partnerService.createFournisseur(dto);
  }

  @Get('fournisseur')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiResponse({ status: 200, description: 'List of suppliers' })
  findAllFournisseurs() {
    return this.partnerService.findAllFournisseurs();
  }

  @Get('fournisseur/:id')
  @Roles('admin', 'user')
  findFournisseurById(@Param('id') id: string) {
    return this.partnerService.findFournisseurById(Number(id));
  }

  @Patch('fournisseur/:id')
  @Roles('admin')
  @ApiBody({ type: UpdateFournisseurDto })
  updateFournisseur(
    @Param('id') id: string,
    @Body() dto: UpdateFournisseurDto,
  ) {
    return this.partnerService.updateFournisseur(Number(id), dto);
  }

  @Delete('fournisseur/:id')
  @Roles('admin')
  deleteFournisseur(@Param('id') id: string) {
    return this.partnerService.deleteFournisseur(Number(id));
  }

  @Get('fournisseur/export')
  @Roles('admin', 'user')
  @ApiOperation({ summary: 'Export suppliers as PDF, Excel, or CSV' })
  @ApiQuery({ name: 'format', enum: ['pdf', 'excel', 'csv'], required: false })
  @ApiResponse({ status: 200, description: 'Exported file' })
  async exportFournisseurs(
    @Query('format') format: 'pdf' | 'excel' | 'csv' = 'pdf',
    @Res() res: Response,
    @Req() req: any,
  ) {
    const { buffer, filename, contentType } =
      await this.partnerService.exportFournisseurs(format, req.user.id);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    return res.send(buffer);
  }

  @Post('fournisseur/import')
  @Roles('admin')
  @ApiOperation({ summary: 'Import suppliers from CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importFournisseurs(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.partnerService.importFournisseurs(file, req.user.id);
  }
}
