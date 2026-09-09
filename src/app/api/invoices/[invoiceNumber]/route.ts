import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderInvoicePdf } from '@/lib/invoice-pdf';
import { readGuestId } from '@/lib/guest';

export async function GET(_req: NextRequest, { params }: { params: { invoiceNumber: string } }) {
  const invoice = await prisma.invoice.findUnique({
    where: { invoiceNumber: params.invoiceNumber },
    include: { items: true, order: true },
  });
  if (!invoice) return NextResponse.json({ error: 'Factura no encontrada' }, { status: 404 });

  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === 'ADMIN';
  const isOwner = Boolean(session?.user?.id) && invoice.order.userId === session?.user?.id;
  const isGuestOwner = !session?.user?.id && Boolean(invoice.order.guestId) && invoice.order.guestId === readGuestId();

  if (!isAdmin && !isOwner && !isGuestOwner) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const pdfBuffer = await renderInvoicePdf(invoice);
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${invoice.invoiceNumber}.pdf"`,
    },
  });
}