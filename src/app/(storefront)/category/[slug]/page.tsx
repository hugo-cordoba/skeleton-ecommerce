export default function CategoryPage({ params }: { params: { slug: string } }) {
  return (
    <div>
      <h1>Categoria: {params.slug}</h1>
      {/* TODO: grid de productos filtrados por categoria + filtros/orden */}
    </div>
  );
}
