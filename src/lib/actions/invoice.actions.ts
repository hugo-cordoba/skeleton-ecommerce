'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readGuestId } from '@/lib/guest';

export interface InvoiceLinkDTO {
  invoiceNumber: string;
  type: string;
}

export async function getInvoiceForOrder(orderNumber: string): Promise<InvoiceLinkDTO | null> {
  const session = await getServerSession(authOptions);
  const guestId = readGuestId();

  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      ...(session?.user?.id ? { userId: session.user.id } : guestId ? { guestId } : { id: 'no-match' }),
    },
  });
  if (!order) return null;

  const invoice = await prisma.invoice.findFirst({
    where: { orderId: order.id, status: 'ISSUED' },
    orderBy: { issuedAt: 'desc' },
  });
  return invoice ? { invoiceNumber: invoice.invoiceNumber, type: invoice.type } : null;
}