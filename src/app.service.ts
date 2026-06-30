import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'cemac accounting app running!';
  }

  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
