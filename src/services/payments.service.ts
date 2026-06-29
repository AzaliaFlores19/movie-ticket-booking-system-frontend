import axios from '@/lib/axios';

type PaymentPayload = {
  id_reserva: number;
  id_cupon?: number;
  monto_original: number;
  monto_descuento: number;
  monto_final: number;
  metodo: string;
  estado: string;
  referencia_externa?: string;
};

type CashPaymentPayload = Omit<PaymentPayload, 'metodo' | 'estado' | 'referencia_externa'>;

export const paymentsService = {
  async create(payload: PaymentPayload) {
    const { data } = await axios.post('/pagos', payload);
    return data;
  },

  async createCash(payload: CashPaymentPayload) {
    const { data } = await axios.post('/pagos/efectivo', payload);
    return data;
  },
};