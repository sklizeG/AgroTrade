import { DELIVERY_MODES } from '../../common/domain';
export declare class CreateOrderDto {
    campaignId: string;
    volume: number;
    deliveryMode: (typeof DELIVERY_MODES)[number];
    deliveryAddress?: string;
    deliveryComment?: string;
    firstDeliveryDate?: string;
    quoteDeliveryFrequency?: 'once' | 'weekly' | 'daily';
    quoteRequestedTotalVolume?: number;
    quoteBatchVolume?: number;
}
