import React, { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "./supabaseClient.js";

const WHATSAPP_NUMBER = "50940712070";
const ADMIN_PASSWORD = "Valmond12+";
const ADMIN_SECRET_PATH = "valmond-nawens-40712070-hgvxy-outeygd";

const SOCIAL_LINKS = {
  instagram: "",
  tiktok: "",
};

// Préréglages pratiques pour démarrer vite — l'admin peut toujours taper ses propres tailles
const SIZE_PRESETS = {
  "Vêtements (S–XL)": ["S", "M", "L", "XL"],
  "Vêtements (XS–XXL)": ["XS", "S", "M", "L", "XL", "XXL"],
  "Chaussures (EU)": ["39", "40", "41", "42", "43", "44", "45", "46"],
  "Chaussures (EU / US)": [
    "39 EU / 6 US",
    "40 EU / 7 US",
    "41 EU / 8 US",
    "42 EU / 8.5 US",
    "43 EU / 9.5 US",
    "44 EU / 10.5 US",
    "45 EU / 11.5 US",
    "46 EU / 12.5 US",
  ],
};

const DEFAULT_CATEGORIES = ["Hoodies", "T-Shirts", "Chaussures", "Accessoires", "Pantalons"];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Un produit = { id, name, category, desc, hasSizes,
//   variants: [{id, colorName, images:[], price, sizes:[{label, stock}]}] }
const SEED_PRODUCTS = [
  {
    id: "seed-1",
    name: "PIÈCE 001",
    category: "Hoodies",
    desc: "Édition limitée. Précommande ouverte.",
    hasSizes: true,
    variants: [
      {
        id: "v1",
        colorName: "Noir",
        images: [],
        price: "120",
        sizes: [
          { label: "S", stock: 3 },
          { label: "M", stock: 5 },
          { label: "L", stock: 5 },
          { label: "XL", stock: 2 },
        ],
      },
    ],
  },
];

function productTotalStock(p) {
  if (!p.hasSizes) return null;
  return (p.variants || []).reduce(
    (sum, v) => sum + (v.sizes || []).reduce((a, s) => a + Number(s.stock || 0), 0),
    0
  );
}

function variantStock(v) {
  return (v.sizes || []).reduce((a, s) => a + Number(s.stock || 0), 0);
}

function getRoute() {
  const hash = window.location.hash.replace(/^#/, "");
  return hash || "/";
}

export default function AshvexSite() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loaded, setLoaded] = useState(false);
  const [route, setRoute] = useState(getRoute());
  const [authed, setAuthed] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    document.title = "ASHVEX — Maison de luxe streetwear";
    setMeta("description", "ASHVEX — pièces en édition limitée, précommande directe. Maison de luxe streetwear.");
    setFavicon();

    const onHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHashChange);

    (async () => {
      try {
        const { data: row, error } = await supabase
          .from("catalog")
          .select("data")
          .eq("id", "main")
          .single();

        if (error) throw error;

        const data = row?.data || {};
        setProducts(data.products || []);
        setCategories(data.categories && data.categories.length ? data.categories : DEFAULT_CATEGORIES);
      } catch (e) {
        console.error("Erreur de chargement Supabase:", e);
        setProducts(SEED_PRODUCTS);
      } finally {
        setLoaded(true);
      }
    })();

    // Mise à jour en direct : si le catalogue change (toi qui ajoutes un produit
    // depuis un autre appareil), tous les visiteurs voient la mise à jour sans recharger.
    const channel = supabase
      .channel("catalog-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "catalog", filter: "id=eq.main" },
        (payload) => {
          const data = payload.new?.data || {};
          setProducts(data.products || []);
          setCategories(data.categories && data.categories.length ? data.categories : DEFAULT_CATEGORIES);
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      supabase.removeChannel(channel);
    };
  }, []);

  function setMeta(name, content) {
    let tag = document.querySelector(`meta[name="${name}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", name);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  }

  function setFavicon() {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%230A0A0A'/><text x='50' y='66' font-family='Helvetica' font-weight='700' font-size='44' fill='%23FAFAF8' text-anchor='middle'>A</text></svg>`;
    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = `data:image/svg+xml,${svg}`;
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  }

  async function persist(nextProducts, nextCategories) {
    const data = { products: nextProducts, categories: nextCategories || categories };
    setProducts(nextProducts);
    if (nextCategories) setCategories(nextCategories);
    try {
      const json = JSON.stringify(data);
      // Garde contre les payloads trop gros (limite raisonnable par ligne)
      if (json.length > 8 * 1024 * 1024) {
        showToast("Trop de données — réduisez la taille ou le nombre de photos");
        return;
      }
      const { error } = await supabase
        .from("catalog")
        .update({ data, updated_at: new Date().toISOString() })
        .eq("id", "main");

      if (error) throw error;
    } catch (e) {
      console.error("Erreur de sauvegarde Supabase:", e);
      showToast("Erreur de sauvegarde — " + (e?.message || "réessayez"));
    }
  }

  function navigate(path) {
    window.location.hash = path;
  }

  const isAdminRoute = route === `/${ADMIN_SECRET_PATH}` || route.startsWith(`/${ADMIN_SECRET_PATH}/`);
  const isProductRoute = route.startsWith("/produit/");
  const productIdFromRoute = isProductRoute ? decodeURIComponent(route.replace("/produit/", "")) : null;

  const hasSocial = SOCIAL_LINKS.instagram || SOCIAL_LINKS.tiktok;

  return (
    <div style={styles.root}>
      <GlobalStyle />
      {toast && <div style={styles.toast}>{toast}</div>}

      <header style={styles.header}>
        <button className="av-btn" onClick={() => navigate("/")} style={styles.logo} aria-label="Ashvex — accueil">
          ASHVEX
        </button>
        <nav style={styles.nav}>
          {route !== "/" && (
            <button className="av-btn" style={styles.navLink} onClick={() => navigate("/")}>
              Boutique
            </button>
          )}
          {route !== "/contact" && (
            <button className="av-btn" style={styles.navLink} onClick={() => navigate("/contact")}>
              Contact
            </button>
          )}
        </nav>
      </header>

      {isAdminRoute ? (
        <AdminGate
          authed={authed}
          setAuthed={setAuthed}
          products={products}
          categories={categories}
          persist={persist}
          showToast={showToast}
        />
      ) : isProductRoute ? (
        <ProductPage
          product={products.find((p) => p.id === productIdFromRoute)}
          loaded={loaded}
          navigate={navigate}
        />
      ) : route === "/contact" ? (
        <AboutView />
      ) : (
        <HomeView products={products} categories={categories} loaded={loaded} navigate={navigate} />
      )}

      <footer style={styles.footer}>
        <div style={styles.footerRow}>
          <span>ASHVEX — MAISON DE LUXE STREETWEAR</span>
          <span style={{ opacity: 0.5 }}>Précommande directe via WhatsApp</span>
        </div>
        {hasSocial && (
          <div style={styles.footerSocial}>
            {SOCIAL_LINKS.instagram && (
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                Instagram
              </a>
            )}
            {SOCIAL_LINKS.tiktok && (
              <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                TikTok
              </a>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; }
      .ashvex-grain {
        background-image: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.02) 0%, transparent 40%),
          radial-gradient(circle at 80% 60%, rgba(255,255,255,0.015) 0%, transparent 45%);
      }
      .av-btn { transition: all 0.2s ease; cursor: pointer; }
      .av-btn:hover { opacity: 0.75; }
      .av-btn:disabled { opacity: 0.3; cursor: not-allowed; }
      .av-btn:focus-visible { outline: 2px solid #FAFAF8; outline-offset: 2px; }
      .av-card { transition: transform 0.25s ease, border-color 0.25s ease; cursor: pointer; }
      .av-card:hover { transform: translateY(-3px); border-color: #ffffff55 !important; }
      .av-size { transition: all 0.15s ease; cursor: pointer; }
      .av-size:hover:not(:disabled) { background: #FAFAF8 !important; color: #0A0A0A !important; }
      .av-swatch { transition: all 0.15s ease; cursor: pointer; }
      .av-thumb { transition: opacity 0.15s ease; cursor: pointer; }
      .av-thumb:hover { opacity: 0.7; }
      input::placeholder, textarea::placeholder { color: #6a6a66; }
      a, button { font-family: inherit; }
      ::selection { background: #ffffff22; }
      @media (max-width: 720px) {
        .admin-grid { grid-template-columns: 1fr !important; }
        .product-layout { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );
}

/* ---------------- HOME / CATALOG ---------------- */

function HomeView({ products, categories, loaded, navigate }) {
  const [activeCat, setActiveCat] = useState("Tout");

  const filtered = useMemo(() => {
    if (activeCat === "Tout") return products;
    return products.filter((p) => p.category === activeCat);
  }, [products, activeCat]);

  return (
    <main className="ashvex-grain" style={styles.shop}>
      <section style={styles.hero}>
        <div style={styles.heroEyebrow}>COLLECTION — PRÉCOMMANDE</div>
        <h1 style={styles.heroTitle}>ASHVEX</h1>
        <p style={styles.heroSub}>
          Pièces en édition limitée. Chaque précommande est confirmée directement, de la main à la main.
        </p>
      </section>

      <div style={styles.catBar}>
        <button
          className="av-btn"
          style={{ ...styles.catChip, ...(activeCat === "Tout" ? styles.catChipActive : {}) }}
          onClick={() => setActiveCat("Tout")}
        >
          Tout
        </button>
        {categories.map((c) => (
          <button
            key={c}
            className="av-btn"
            style={{ ...styles.catChip, ...(activeCat === c ? styles.catChipActive : {}) }}
            onClick={() => setActiveCat(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {!loaded ? (
        <div style={styles.emptyState}>Chargement…</div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyState}>Aucune pièce disponible dans cette catégorie.</div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((p, i) => {
            const firstVariant = (p.variants || [])[0];
            const cover = firstVariant?.images?.[0];
            const stock = productTotalStock(p);
            const soldOut = p.hasSizes && stock === 0;
            const priceDisplay = firstVariant?.price;

            return (
              <article
                className="av-card"
                key={p.id}
                style={styles.card}
                onClick={() => navigate(`/produit/${p.id}`)}
              >
                <div style={styles.cardImageWrap}>
                  {cover ? (
                    <img src={cover} alt={p.name} style={styles.cardImage} />
                  ) : (
                    <div style={styles.cardImagePlaceholder}>ASHVEX</div>
                  )}
                  <span style={styles.cardIndex}>{String(i + 1).padStart(2, "0")}</span>
                  {soldOut && <span style={styles.soldOutBadge}>ÉPUISÉ</span>}
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.cardCategory}>{p.category}</div>
                  <h3 style={styles.cardName}>{p.name}</h3>
                  <div style={styles.cardFooter}>
                    {priceDisplay && <span style={styles.cardPrice}>{priceDisplay} €</span>}
                    <span style={styles.viewLink}>Voir →</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

/* ---------------- PRODUCT PAGE ---------------- */

function ProductPage({ product, loaded, navigate }) {
  const [variantIdx, setVariantIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);

  useEffect(() => {
    setVariantIdx(0);
    setImgIdx(0);
    setSelectedSize(null);
  }, [product?.id]);

  useEffect(() => {
    setImgIdx(0);
    setSelectedSize(null);
  }, [variantIdx]);

  if (!loaded) {
    return <div style={styles.emptyState}>Chargement…</div>;
  }
  if (!product) {
    return (
      <main style={styles.about}>
        <div style={styles.aboutInner}>
          <h2 style={styles.loginTitle}>Article introuvable</h2>
          <button className="av-btn" style={styles.primaryBtn} onClick={() => navigate("/")}>
            Retour à la boutique
          </button>
        </div>
      </main>
    );
  }

  const variant = (product.variants || [])[variantIdx];
  const images = variant?.images || [];
  const stock = variant ? variantStock(variant) : 0;
  const soldOut = product.hasSizes && stock === 0;

  function preorderLink() {
    let msg = `Bonjour Ashvex, je souhaite précommander : ${product.name}`;
    if (variant?.colorName) msg += ` — Coloris ${variant.colorName}`;
    if (selectedSize) msg += ` — Taille ${selectedSize}`;
    if (variant?.price) msg += ` — ${variant.price}€`;
    msg += ".";
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  const sizeList = variant?.sizes || [];
  const selectedSizeEntry = sizeList.find((s) => s.label === selectedSize);
  const canOrder = !product.hasSizes || (selectedSize && (selectedSizeEntry?.stock || 0) > 0);

  return (
    <main style={styles.productMain}>
      <button className="av-btn" style={styles.backLink} onClick={() => navigate("/")}>
        ← Retour à la boutique
      </button>

      <div className="product-layout" style={styles.productLayout}>
        <div style={styles.productGallery}>
          <div style={styles.productMainImageWrap}>
            {images[imgIdx] ? (
              <img src={images[imgIdx]} alt={product.name} style={styles.productMainImage} />
            ) : (
              <div style={styles.cardImagePlaceholder}>ASHVEX</div>
            )}
          </div>
          {images.length > 1 && (
            <div style={styles.thumbRow}>
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className="av-thumb"
                  onClick={() => setImgIdx(i)}
                  style={{ ...styles.thumb, ...(i === imgIdx ? styles.thumbActive : {}) }}
                />
              ))}
            </div>
          )}
        </div>

        <div style={styles.productInfo}>
          <div style={styles.heroEyebrow}>{product.category}</div>
          <h1 style={styles.productName}>{product.name}</h1>
          {variant?.price && <div style={styles.productPrice}>{variant.price} €</div>}
          {product.desc && <p style={styles.productDesc}>{product.desc}</p>}

          {(product.variants || []).length > 1 && (
            <div style={styles.variantBlock}>
              <div style={styles.variantLabel}>Coloris</div>
              <div style={styles.swatchRow}>
                {product.variants.map((v, i) => (
                  <button
                    key={v.id}
                    className="av-swatch av-btn"
                    onClick={() => setVariantIdx(i)}
                    style={{
                      ...styles.swatch,
                      ...(i === variantIdx ? styles.swatchActive : {}),
                    }}
                  >
                    {v.colorName || `Coloris ${i + 1}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.hasSizes && (
            <div style={styles.variantBlock}>
              <div style={styles.variantLabel}>Taille</div>
              <div style={styles.sizeRow}>
                {sizeList.map((s) => {
                  const avail = s.stock || 0;
                  const isSel = selectedSize === s.label;
                  return (
                    <button
                      key={s.label}
                      type="button"
                      className="av-size"
                      disabled={avail === 0}
                      onClick={() => setSelectedSize(s.label)}
                      style={{
                        ...styles.sizeChip,
                        ...(isSel ? styles.sizeChipActive : {}),
                        ...(avail === 0 ? styles.sizeChipDisabled : {}),
                      }}
                      title={avail === 0 ? "Épuisé" : `${avail} en stock`}
                    >
                      {s.label}
                    </button>
                  );
                })}
                {sizeList.length === 0 && (
                  <span style={{ fontSize: 12, color: "#6a6a66" }}>Aucune taille définie</span>
                )}
              </div>
            </div>
          )}

          {soldOut ? (
            <span style={{ ...styles.soldOutText, fontSize: 14, marginTop: 20 }}>Épuisé</span>
          ) : (
            <a
              className="av-btn"
              href={canOrder ? preorderLink() : undefined}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!canOrder) e.preventDefault();
              }}
              style={{
                ...styles.preorderBtn,
                ...styles.preorderBtnLarge,
                ...(canOrder ? {} : styles.preorderBtnDisabled),
              }}
            >
              {product.hasSizes && !selectedSize ? "Choisir une taille" : "Pré-commander via WhatsApp"}
            </a>
          )}
        </div>
      </div>
    </main>
  );
}

/* ---------------- ABOUT / CONTACT ---------------- */

function AboutView() {
  return (
    <main style={styles.about}>
      <div style={styles.aboutInner}>
        <div style={styles.heroEyebrow}>CONTACT</div>
        <h2 style={styles.loginTitle}>Nous écrire</h2>
        <p style={styles.aboutText}>
          Pour toute question sur une précommande, une pièce, ou une collaboration, contactez-nous
          directement via WhatsApp depuis n'importe quelle fiche article, ou retrouvez-nous sur les
          réseaux sociaux ci-dessous.
        </p>
        <div style={styles.aboutSocial}>
          {SOCIAL_LINKS.instagram ? (
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" style={styles.aboutSocialLink}>
              Instagram →
            </a>
          ) : (
            <span style={styles.aboutSocialPlaceholder}>Instagram — bientôt</span>
          )}
          {SOCIAL_LINKS.tiktok ? (
            <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" style={styles.aboutSocialLink}>
              TikTok →
            </a>
          ) : (
            <span style={styles.aboutSocialPlaceholder}>TikTok — bientôt</span>
          )}
        </div>
      </div>
    </main>
  );
}

/* ---------------- ADMIN (hidden route + password gate) ---------------- */

function AdminGate({ authed, setAuthed, products, categories, persist, showToast }) {
  const [passInput, setPassInput] = useState("");
  const [authError, setAuthError] = useState("");

  function handleLogin(e) {
    e.preventDefault();
    if (passInput === ADMIN_PASSWORD) {
      setAuthed(true);
      setAuthError("");
    } else {
      setAuthError("Mot de passe incorrect");
    }
  }

  if (!authed) {
    return (
      <main style={styles.loginWrap}>
        <form onSubmit={handleLogin} style={styles.loginForm}>
          <div style={styles.heroEyebrow}>ACCÈS RÉSERVÉ</div>
          <h2 style={styles.loginTitle}>Espace privé</h2>
          <input
            type="password"
            value={passInput}
            onChange={(e) => setPassInput(e.target.value)}
            placeholder="Mot de passe"
            style={styles.input}
            autoFocus
          />
          {authError && <div style={styles.errorText}>{authError}</div>}
          <button type="submit" className="av-btn" style={styles.primaryBtn}>
            Entrer
          </button>
        </form>
      </main>
    );
  }

  return (
    <AdminPanel products={products} categories={categories} persist={persist} showToast={showToast} setAuthed={setAuthed} />
  );
}

function emptyVariant() {
  return { id: uid(), colorName: "", images: [], price: "", sizes: [] };
}

function emptyProductForm() {
  return {
    name: "",
    category: "",
    desc: "",
    hasSizes: false,
    variants: [emptyVariant()],
  };
}

function AdminPanel({ products, categories, persist, showToast, setAuthed }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProductForm());
  const [newCategory, setNewCategory] = useState("");
  const fileRef = useRef(null);
  const [activeVariantForUpload, setActiveVariantForUpload] = useState(0);

  function startNew() {
    setEditingId(null);
    setForm(emptyProductForm());
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category || "",
      desc: p.desc || "",
      hasSizes: !!p.hasSizes,
      variants: (p.variants || [emptyVariant()]).map((v) => ({
        ...v,
        sizes: (v.sizes || []).map((s) => ({ ...s, stock: String(s.stock ?? "") })),
      })),
    });
  }

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const tooBig = files.find((f) => f.size > 4 * 1024 * 1024);
    if (tooBig) {
      showToast("Une image dépasse 4MB — choisissez une photo plus légère");
      return;
    }
    try {
      const dataUrls = await Promise.all(files.map(fileToDataUrl));
      setForm((f) => {
        const variants = [...f.variants];
        const v = { ...variants[activeVariantForUpload] };
        v.images = [...(v.images || []), ...dataUrls];
        variants[activeVariantForUpload] = v;
        return { ...f, variants };
      });
      showToast(`${dataUrls.length} photo(s) ajoutée(s)`);
    } catch (err) {
      showToast("Erreur lors du chargement de l'image");
    }
    e.target.value = "";
  }

  function removeImage(variantIdx, imgIdx) {
    setForm((f) => {
      const variants = [...f.variants];
      const v = { ...variants[variantIdx] };
      v.images = v.images.filter((_, i) => i !== imgIdx);
      variants[variantIdx] = v;
      return { ...f, variants };
    });
  }

  function addVariant() {
    setForm((f) => ({ ...f, variants: [...f.variants, emptyVariant()] }));
  }

  function removeVariant(idx) {
    setForm((f) => {
      if (f.variants.length <= 1) return f;
      return { ...f, variants: f.variants.filter((_, i) => i !== idx) };
    });
  }

  function updateVariant(idx, patch) {
    setForm((f) => {
      const variants = [...f.variants];
      variants[idx] = { ...variants[idx], ...patch };
      return { ...f, variants };
    });
  }

  function applySizePreset(idx, presetName) {
    const labels = SIZE_PRESETS[presetName];
    if (!labels) return;
    setForm((f) => {
      const variants = [...f.variants];
      const existing = variants[idx].sizes || [];
      const existingMap = Object.fromEntries(existing.map((s) => [s.label, s.stock]));
      variants[idx] = {
        ...variants[idx],
        sizes: labels.map((label) => ({ label, stock: existingMap[label] ?? "" })),
      };
      return { ...f, variants };
    });
  }

  function addCustomSize(idx) {
    setForm((f) => {
      const variants = [...f.variants];
      variants[idx] = {
        ...variants[idx],
        sizes: [...(variants[idx].sizes || []), { label: "", stock: "" }],
      };
      return { ...f, variants };
    });
  }

  function updateSizeLabel(variantIdx, sizeIdx, label) {
    setForm((f) => {
      const variants = [...f.variants];
      const sizes = [...variants[variantIdx].sizes];
      sizes[sizeIdx] = { ...sizes[sizeIdx], label };
      variants[variantIdx] = { ...variants[variantIdx], sizes };
      return { ...f, variants };
    });
  }

  function updateSizeStock(variantIdx, sizeIdx, stock) {
    setForm((f) => {
      const variants = [...f.variants];
      const sizes = [...variants[variantIdx].sizes];
      sizes[sizeIdx] = { ...sizes[sizeIdx], stock };
      variants[variantIdx] = { ...variants[variantIdx], sizes };
      return { ...f, variants };
    });
  }

  function removeSize(variantIdx, sizeIdx) {
    setForm((f) => {
      const variants = [...f.variants];
      variants[variantIdx] = {
        ...variants[variantIdx],
        sizes: variants[variantIdx].sizes.filter((_, i) => i !== sizeIdx),
      };
      return { ...f, variants };
    });
  }

  async function saveProduct(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast("Le nom est requis");
      return;
    }
    if (!form.category) {
      showToast("Choisissez une catégorie");
      return;
    }
    const cleanVariants = form.variants.map((v) => {
      const sizes = (v.sizes || [])
        .filter((s) => s.label.trim() !== "")
        .map((s) => ({ label: s.label.trim(), stock: Math.max(0, parseInt(s.stock, 10) || 0) }));
      return { ...v, sizes };
    });
    const payload = { ...form, variants: cleanVariants };

    let next;
    if (editingId) {
      next = products.map((p) => (p.id === editingId ? { ...p, ...payload } : p));
      showToast("Article modifié");
    } else {
      next = [...products, { id: uid(), ...payload }];
      showToast("Article ajouté");
    }
    await persist(next);
    startNew();
  }

  async function deleteProduct(id) {
    const next = products.filter((p) => p.id !== id);
    await persist(next);
    showToast("Article supprimé");
    if (editingId === id) startNew();
  }

  async function addCategory() {
    const c = newCategory.trim();
    if (!c) return;
    if (categories.includes(c)) {
      showToast("Catégorie déjà existante");
      return;
    }
    const nextCats = [...categories, c];
    await persist(products, nextCats);
    setNewCategory("");
    showToast("Catégorie ajoutée");
  }

  return (
    <main style={styles.admin}>
      <div style={styles.adminTopBar}>
        <span style={{ fontSize: 12, color: "#8a8a85", letterSpacing: 1 }}>ESPACE ADMIN</span>
        <button className="av-btn" style={styles.navLinkGhost} onClick={() => setAuthed(false)}>
          Déconnexion
        </button>
      </div>

      <div className="admin-grid" style={styles.adminGrid}>
        <section style={styles.adminFormCol}>
          <div style={styles.heroEyebrow}>{editingId ? "MODIFIER LA PIÈCE" : "NOUVELLE PIÈCE"}</div>
          <form onSubmit={saveProduct} style={styles.adminForm}>
            <label style={styles.label}>
              Nom de l'article
              <input
                style={styles.input}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex. HOODIE NOIR 01"
              />
            </label>

            <label style={styles.label}>
              Catégorie
              <select
                style={styles.input}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">— Choisir —</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            <div style={styles.newCatRow}>
              <input
                style={{ ...styles.input, flex: 1 }}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Nouvelle catégorie…"
              />
              <button type="button" className="av-btn" style={styles.smallBtn} onClick={addCategory}>
                + Ajouter
              </button>
            </div>

            <label style={styles.label}>
              Description (optionnel)
              <textarea
                style={{ ...styles.input, minHeight: 70, resize: "vertical" }}
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
                placeholder="Détails, matière, édition limitée…"
              />
            </label>

            <label style={{ ...styles.label, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={form.hasSizes}
                onChange={(e) => setForm({ ...form, hasSizes: e.target.checked })}
                style={{ width: 16, height: 16 }}
              />
              Cet article a des tailles (S/M/L/XL)
            </label>

            <div style={styles.variantsEditor}>
              <div style={styles.variantsEditorHeader}>
                <span style={styles.variantLabel}>Coloris / Modèles</span>
                <button type="button" className="av-btn" style={styles.smallBtn} onClick={addVariant}>
                  + Ajouter un coloris
                </button>
              </div>

              {form.variants.map((v, idx) => (
                <div key={v.id} style={styles.variantBox}>
                  <div style={styles.variantBoxHeader}>
                    <input
                      style={{ ...styles.input, flex: 1 }}
                      value={v.colorName}
                      onChange={(e) => updateVariant(idx, { colorName: e.target.value })}
                      placeholder={`Nom du coloris (ex. Noir)`}
                    />
                    {form.variants.length > 1 && (
                      <button
                        type="button"
                        className="av-btn"
                        style={styles.smallBtnDanger}
                        onClick={() => removeVariant(idx)}
                      >
                        Suppr.
                      </button>
                    )}
                  </div>

                  <input
                    style={styles.input}
                    value={v.price}
                    onChange={(e) => updateVariant(idx, { price: e.target.value })}
                    placeholder="Prix (€)"
                  />

                  <div>
                    <button
                      type="button"
                      className="av-btn"
                      style={{ ...styles.uploadZone, height: 80, flexDirection: "row", gap: 8 }}
                      onClick={() => {
                        setActiveVariantForUpload(idx);
                        fileRef.current?.click();
                      }}
                    >
                      <span style={{ color: "#8a8a85", fontSize: 13 }}>
                        + Ajouter des photos ({(v.images || []).length})
                      </span>
                    </button>
                    {v.images?.length > 0 && (
                      <div style={styles.variantThumbRow}>
                        {v.images.map((img, i) => (
                          <div key={i} style={styles.variantThumbItem}>
                            <img src={img} alt="" style={styles.variantThumbImg} />
                            <button
                              type="button"
                              className="av-btn"
                              style={styles.removeThumbBtn}
                              onClick={() => removeImage(idx, i)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {form.hasSizes && (
                    <div style={styles.sizeEditor}>
                      <div style={styles.presetRow}>
                        <select
                          style={{ ...styles.input, fontSize: 12 }}
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) applySizePreset(idx, e.target.value);
                            e.target.value = "";
                          }}
                        >
                          <option value="">Appliquer un modèle de tailles…</option>
                          {Object.keys(SIZE_PRESETS).map((name) => (
                            <option key={name} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="av-btn"
                          style={styles.smallBtn}
                          onClick={() => addCustomSize(idx)}
                        >
                          + Taille libre
                        </button>
                      </div>

                      {(v.sizes || []).length > 0 && (
                        <div style={styles.sizeEditorList}>
                          {v.sizes.map((s, sIdx) => (
                            <div key={sIdx} style={styles.sizeEditorRow}>
                              <input
                                style={{ ...styles.sizeStockInput, flex: 2, textAlign: "left" }}
                                value={s.label}
                                onChange={(e) => updateSizeLabel(idx, sIdx, e.target.value)}
                                placeholder="Ex. 42 EU"
                              />
                              <input
                                type="number"
                                min="0"
                                style={{ ...styles.sizeStockInput, flex: 1 }}
                                value={s.stock}
                                onChange={(e) => updateSizeStock(idx, sIdx, e.target.value)}
                                placeholder="Stock"
                              />
                              <button
                                type="button"
                                className="av-btn"
                                style={styles.removeSizeBtn}
                                onClick={() => removeSize(idx, sIdx)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" className="av-btn" style={styles.primaryBtn}>
                {editingId ? "Enregistrer" : "Ajouter"}
              </button>
              {editingId && (
                <button type="button" className="av-btn" style={styles.ghostBtn} onClick={startNew}>
                  Annuler
                </button>
              )}
            </div>
          </form>
        </section>

        <section style={styles.adminListCol}>
          <div style={styles.heroEyebrow}>PIÈCES EN LIGNE ({products.length})</div>
          <div style={styles.adminList}>
            {products.map((p) => {
              const stock = productTotalStock(p);
              const cover = p.variants?.[0]?.images?.[0];
              return (
                <div key={p.id} style={styles.adminRow}>
                  <div style={styles.adminRowThumb}>
                    {cover ? <img src={cover} alt="" style={styles.adminThumbImg} /> : <span style={{ fontSize: 9, color: "#6a6a66" }}>—</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.adminRowName}>{p.name}</div>
                    <div style={styles.adminRowPrice}>
                      {p.category}
                      {p.hasSizes && (
                        <span style={{ marginLeft: 8, color: stock === 0 ? "#d97373" : "#8a8a85" }}>
                          · stock: {stock}
                        </span>
                      )}
                      <span style={{ marginLeft: 8 }}>· {p.variants?.length || 0} coloris</span>
                    </div>
                  </div>
                  <button className="av-btn" style={styles.smallBtn} onClick={() => startEdit(p)}>
                    Modifier
                  </button>
                  <button className="av-btn" style={styles.smallBtnDanger} onClick={() => deleteProduct(p.id)}>
                    Suppr.
                  </button>
                </div>
              );
            })}
            {products.length === 0 && <div style={{ color: "#6a6a66", fontSize: 13, padding: "20px 0" }}>Aucune pièce pour le moment.</div>}
          </div>
        </section>
      </div>
    </main>
  );
}

const FONT_DISPLAY = "'Bebas Neue', Impact, sans-serif";
const FONT_BODY = "'Cormorant Garamond', Georgia, serif";
const FONT_UI = "Helvetica, Arial, sans-serif";

const styles = {
  root: { minHeight: "100vh", background: "#0A0A0A", color: "#FAFAF8", fontFamily: FONT_UI, display: "flex", flexDirection: "column" },
  toast: { position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", background: "#FAFAF8", color: "#0A0A0A", padding: "10px 20px", fontSize: 13, letterSpacing: 1, zIndex: 100 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 28px", borderBottom: "1px solid #ffffff14", position: "sticky", top: 0, background: "#0A0A0Aee", backdropFilter: "blur(6px)", zIndex: 10, flexWrap: "wrap", gap: 10 },
  logo: { fontFamily: FONT_DISPLAY, fontSize: 24, letterSpacing: 4, background: "none", border: "none", color: "#FAFAF8", padding: 0 },
  nav: { display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" },
  navLink: { background: "none", border: "none", color: "#FAFAF8", fontSize: 12, letterSpacing: 2, textTransform: "uppercase" },
  navLinkGhost: { background: "none", border: "1px solid #ffffff33", color: "#FAFAF8", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", padding: "8px 14px" },
  shop: { flex: 1, padding: "0 0 60px" },
  hero: { padding: "70px 28px 40px", textAlign: "center", borderBottom: "1px solid #ffffff14" },
  heroEyebrow: { fontSize: 11, letterSpacing: 4, color: "#8a8a85", marginBottom: 14 },
  heroTitle: { fontFamily: FONT_DISPLAY, fontSize: "clamp(56px, 12vw, 120px)", letterSpacing: 6, margin: "0 0 18px", lineHeight: 1 },
  heroSub: { fontFamily: FONT_BODY, fontStyle: "italic", fontSize: 18, color: "#c9c9c5", maxWidth: 480, margin: "0 auto", lineHeight: 1.5 },
  catBar: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", padding: "24px 28px 0" },
  catChip: { background: "none", border: "1px solid #ffffff33", color: "#c9c9c5", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", padding: "8px 16px" },
  catChipActive: { background: "#FAFAF8", color: "#0A0A0A", borderColor: "#FAFAF8" },
  emptyState: { textAlign: "center", padding: "80px 20px", color: "#6a6a66", fontFamily: FONT_BODY, fontSize: 18 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 1, background: "#ffffff14", margin: "32px 28px 0", border: "1px solid #ffffff14" },
  card: { background: "#0A0A0A", border: "1px solid transparent", display: "flex", flexDirection: "column" },
  cardImageWrap: { position: "relative", aspectRatio: "4 / 5", background: "#141412", overflow: "hidden" },
  cardImage: { width: "100%", height: "100%", objectFit: "cover" },
  cardImagePlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT_DISPLAY, fontSize: 28, letterSpacing: 4, color: "#3a3a37" },
  cardIndex: { position: "absolute", top: 12, left: 12, fontFamily: FONT_UI, fontSize: 11, letterSpacing: 1, color: "#FAFAF8", background: "#0A0A0Aaa", padding: "3px 8px" },
  soldOutBadge: { position: "absolute", top: 12, right: 12, fontFamily: FONT_UI, fontSize: 10, letterSpacing: 1.5, color: "#0A0A0A", background: "#FAFAF8", padding: "4px 9px", fontWeight: 700 },
  cardBody: { padding: 20, display: "flex", flexDirection: "column", gap: 6, flex: 1 },
  cardCategory: { fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#6a6a66" },
  cardName: { fontFamily: FONT_UI, fontSize: 14, letterSpacing: 1.5, margin: 0, textTransform: "uppercase" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, gap: 10 },
  cardPrice: { fontFamily: FONT_BODY, fontSize: 18, color: "#FAFAF8" },
  viewLink: { fontSize: 11, letterSpacing: 1, color: "#8a8a85", textTransform: "uppercase" },
  preorderBtn: { background: "#FAFAF8", color: "#0A0A0A", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", padding: "10px 16px", textDecoration: "none", fontFamily: FONT_UI, fontWeight: 600, whiteSpace: "nowrap", display: "inline-block", textAlign: "center" },
  preorderBtnLarge: { padding: "16px 24px", fontSize: 12, marginTop: 24, width: "fit-content" },
  preorderBtnDisabled: { opacity: 0.3, pointerEvents: "none" },
  soldOutText: { fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: "#6a6a66" },
  sizeRow: { display: "flex", gap: 6, marginTop: 2 },
  sizeChip: { width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #ffffff33", background: "none", color: "#FAFAF8", fontSize: 12, letterSpacing: 0.5 },
  sizeChipActive: { background: "#FAFAF8", color: "#0A0A0A", borderColor: "#FAFAF8" },
  sizeChipDisabled: { opacity: 0.25, textDecoration: "line-through", cursor: "not-allowed" },

  /* Product page */
  productMain: { flex: 1, padding: "32px 28px 80px", maxWidth: 1100, margin: "0 auto", width: "100%" },
  backLink: { background: "none", border: "none", color: "#8a8a85", fontSize: 12, letterSpacing: 1, marginBottom: 24, padding: 0 },
  productLayout: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 50 },
  productGallery: { display: "flex", flexDirection: "column", gap: 12 },
  productMainImageWrap: { aspectRatio: "4 / 5", background: "#141412", overflow: "hidden" },
  productMainImage: { width: "100%", height: "100%", objectFit: "cover" },
  thumbRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  thumb: { width: 64, height: 64, objectFit: "cover", opacity: 0.5, border: "1px solid transparent" },
  thumbActive: { opacity: 1, borderColor: "#FAFAF8" },
  productInfo: { display: "flex", flexDirection: "column" },
  productName: { fontFamily: FONT_DISPLAY, fontSize: 42, letterSpacing: 2, margin: "0 0 8px", lineHeight: 1.05 },
  productPrice: { fontFamily: FONT_BODY, fontSize: 24, color: "#FAFAF8", marginBottom: 16 },
  productDesc: { fontFamily: FONT_BODY, fontSize: 17, color: "#c9c9c5", lineHeight: 1.6, marginBottom: 8 },
  variantBlock: { marginTop: 22 },
  variantLabel: { fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#8a8a85", marginBottom: 10, display: "block" },
  swatchRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  swatch: { background: "none", border: "1px solid #ffffff33", color: "#c9c9c5", fontSize: 12, padding: "8px 14px" },
  swatchActive: { background: "#FAFAF8", color: "#0A0A0A", borderColor: "#FAFAF8" },

  loginWrap: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 28 },
  loginForm: { width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 14, textAlign: "center" },
  loginTitle: { fontFamily: FONT_DISPLAY, fontSize: 36, letterSpacing: 3, margin: "0 0 10px" },
  errorText: { color: "#d97373", fontSize: 12, textAlign: "left" },
  input: { background: "#141412", border: "1px solid #ffffff22", color: "#FAFAF8", padding: "12px 14px", fontSize: 14, fontFamily: FONT_UI, width: "100%" },
  primaryBtn: { background: "#FAFAF8", color: "#0A0A0A", border: "none", padding: "12px 20px", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 },
  ghostBtn: { background: "none", border: "1px solid #ffffff33", color: "#FAFAF8", padding: "12px 20px", fontSize: 12, letterSpacing: 2, textTransform: "uppercase" },

  about: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 28 },
  aboutInner: { maxWidth: 460, textAlign: "center" },
  aboutText: { fontFamily: FONT_BODY, fontSize: 17, color: "#c9c9c5", lineHeight: 1.6, margin: "16px 0 28px" },
  aboutSocial: { display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" },
  aboutSocialLink: { color: "#FAFAF8", fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", textDecoration: "none", borderBottom: "1px solid #FAFAF8" },
  aboutSocialPlaceholder: { color: "#5a5a57", fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase" },

  admin: { flex: 1, padding: "24px 28px 80px", maxWidth: 1100, margin: "0 auto", width: "100%" },
  adminTopBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  adminGrid: { display: "grid", gridTemplateColumns: "minmax(300px, 420px) 1fr", gap: 40 },
  adminFormCol: {},
  adminForm: { display: "flex", flexDirection: "column", gap: 16, marginTop: 16 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#8a8a85" },
  newCatRow: { display: "flex", gap: 8, marginTop: -8 },
  uploadZone: { minHeight: 80, border: "1px dashed #ffffff33", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", background: "#141412", width: "100%" },
  variantsEditor: { display: "flex", flexDirection: "column", gap: 14, borderTop: "1px solid #ffffff14", paddingTop: 16, marginTop: 4 },
  variantsEditorHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  variantBox: { display: "flex", flexDirection: "column", gap: 10, padding: 14, background: "#141412", border: "1px solid #ffffff14" },
  variantBoxHeader: { display: "flex", gap: 8 },
  variantThumbRow: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 },
  variantThumbItem: { position: "relative", width: 56, height: 56 },
  variantThumbImg: { width: "100%", height: "100%", objectFit: "cover" },
  removeThumbBtn: { position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "#0A0A0A", border: "1px solid #ffffff55", color: "#FAFAF8", fontSize: 11, lineHeight: 1, padding: 0 },
  sizeStockGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 },
  sizeStockLabel: { display: "flex", flexDirection: "column", gap: 4, fontSize: 11, color: "#8a8a85", textAlign: "center" },
  sizeStockInput: { background: "#0A0A0A", border: "1px solid #ffffff22", color: "#FAFAF8", padding: "8px", fontSize: 13, textAlign: "center", width: "100%" },
  sizeEditor: { display: "flex", flexDirection: "column", gap: 10 },
  presetRow: { display: "flex", gap: 8 },
  sizeEditorList: { display: "flex", flexDirection: "column", gap: 6 },
  sizeEditorRow: { display: "flex", gap: 6, alignItems: "center" },
  removeSizeBtn: { width: 28, height: 32, background: "none", border: "1px solid #d9737355", color: "#d97373", fontSize: 14, padding: 0, flexShrink: 0 },
  adminListCol: {},
  adminList: { display: "flex", flexDirection: "column", gap: 1, marginTop: 16, background: "#ffffff14" },
  adminRow: { display: "flex", alignItems: "center", gap: 12, padding: 12, background: "#0A0A0A" },
  adminRowThumb: { width: 44, height: 44, background: "#141412", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
  adminThumbImg: { width: "100%", height: "100%", objectFit: "cover" },
  adminRowName: { fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  adminRowPrice: { fontSize: 11, color: "#8a8a85", marginTop: 2 },
  smallBtn: { background: "none", border: "1px solid #ffffff33", color: "#FAFAF8", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", padding: "7px 10px", whiteSpace: "nowrap" },
  smallBtnDanger: { background: "none", border: "1px solid #d9737355", color: "#d97373", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", padding: "7px 10px", whiteSpace: "nowrap" },

  footer: { borderTop: "1px solid #ffffff14", padding: "20px 28px", display: "flex", flexDirection: "column", gap: 10, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "#8a8a85" },
  footerRow: { display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
  footerSocial: { display: "flex", gap: 16 },
  socialLink: { color: "#8a8a85", textDecoration: "none" },
};
