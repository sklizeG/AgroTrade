import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHealth(): {
        name: string;
        status: string;
        timestamp: string;
    };
}
