export default function AccountOrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Pedido #{params.id}</h1>
      {/* TODO: lineas del pedido, estado, direccion, factura */}
    </div>
  );
}
