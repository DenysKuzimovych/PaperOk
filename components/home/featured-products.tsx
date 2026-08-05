import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import { Reveal } from "components/ui/reveal";
import { getProducts } from "lib/supabase/products";
import Link from "next/link";
import { Section } from "./section";

export async function FeaturedProducts() {
  const products = await getProducts({ limit: 8 });

  if (!products.length) return null;

  return (
    <Section title="Любими продукти" variant="muted">
      <Reveal variant="fade">
        <Grid className="grid-cols-2 lg:grid-cols-4">
          <ProductGridItems products={products} />
        </Grid>
      </Reveal>
      <Reveal className="mt-10 text-center" delay={150}>
        <Link href="/products" className="btn-outline px-8 py-3">
          Виж всички продукти
        </Link>
      </Reveal>
    </Section>
  );
}
