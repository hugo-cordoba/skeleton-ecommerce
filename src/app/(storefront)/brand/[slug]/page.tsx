export default function BrandPage({ params }: { params: { slug: string } }) {
  return (
    <div>
      <h1>Marca: {params.slug}</h1>
      {/* TODO: cabecera de marca + grid de productos de esa marca */}
    </div>
  );
}
