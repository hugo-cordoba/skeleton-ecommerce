export default function ProductPage({ params }: { params: { slug: string } }) {
  return (
    <div>
      <h1>Producto: {params.slug}</h1>
      {/* TODO: galeria, precio, variantes, descripcion, boton "Añadir al carrito" */}
    </div>
  );
}
