import OrderDetailClient from '@/components/account/OrderDetailClient/OrderDetailClient';

export default function AccountOrderDetailPage({ params }: { params: { id: string } }) {
  return <OrderDetailClient orderNumber={params.id} />;
}