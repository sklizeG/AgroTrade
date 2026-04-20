import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      name: 'AgroTrade API',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
