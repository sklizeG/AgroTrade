/** Переменные процесса OrderProcessing в Camunda (поля заказа из ПР-03). */
export type BpmsOrderProcessPayload = {
  leadId: string;
  orderId: string;
  status: string;
  totalAmount: number;
  volume: number;
  buyerEmail: string;
  buyerPhone?: string | null;
  buyerDisplayName: string;
  buyerCompanyName?: string | null;
  campaignTitle: string;
};
