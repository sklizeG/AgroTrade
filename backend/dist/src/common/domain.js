"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELIVERY_MODES = exports.PAYMENT_STATUSES = exports.ORDER_STATUSES = exports.CAMPAIGN_STATUSES = exports.BUYER_TYPES = exports.USER_ROLES = void 0;
exports.USER_ROLES = ['admin', 'farmer', 'buyer'];
exports.BUYER_TYPES = ['b2c', 'b2b'];
exports.CAMPAIGN_STATUSES = [
    'draft',
    'published',
    'closed',
    'fulfilled',
    'cancelled',
];
exports.ORDER_STATUSES = [
    'pending_payment',
    'reserved',
    'confirmed',
    'partially_delivered',
    'delivered',
    'cancelled',
];
exports.PAYMENT_STATUSES = [
    'pending',
    'paid',
    'failed',
    'refunded',
];
exports.DELIVERY_MODES = [
    'pickup',
    'full_delivery',
    'partial_delivery',
];
//# sourceMappingURL=domain.js.map