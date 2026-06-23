diff --git a/App.jsx b/App.jsx
index cab8df51d4efb7bd116abd78e5ffca191fff8a8e..702333714d326b2694b892f9330f41763c0c5540 100644
--- a/App.jsx
+++ b/App.jsx
@@ -1,26 +1,26 @@
-import React, { useState, useEffect, useRef, useMemo } from "react";
+import React, { useState, useEffect, useRef } from "react";
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
@@ -72,52 +72,52 @@ function productTotalStock(p) {
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
-    document.title = "ASHVEX — Maison de luxe streetwear";
-    setMeta("description", "ASHVEX — pièces en édition limitée, précommande directe. Maison de luxe streetwear.");
+    document.title = "ASHVEX — Assistant IA WhatsApp pour services locaux";
+    setMeta("description", "ASHVEX transforme les messages WhatsApp des services locaux en devis qualifiés, relances et rendez-vous confirmés.");
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
@@ -226,52 +226,52 @@ export default function AshvexSite() {
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
-          <span>ASHVEX — MAISON DE LUXE STREETWEAR</span>
-          <span style={{ opacity: 0.5 }}>Précommande directe via WhatsApp</span>
+          <span>ASHVEX — AUTOMATISATION WHATSAPP POUR SERVICES LOCAUX</span>
+          <span style={{ opacity: 0.5 }}>Devis qualifiés · relances · rendez-vous</span>
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
@@ -282,130 +282,132 @@ function GlobalStyle() {
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
 
-function HomeView({ products, categories, loaded, navigate }) {
-  const [activeCat, setActiveCat] = useState("Tout");
+function HomeView() {
+  const proofPoints = [
+    "Réponse instantanée aux demandes reçues le soir, le week-end ou pendant un chantier",
+    "Qualification automatique: ville, urgence, photos, budget, disponibilité et type de service",
+    "Relance douce des prospects qui hésitent avant qu'ils appellent un concurrent",
+  ];
 
-  const filtered = useMemo(() => {
-    if (activeCat === "Tout") return products;
-    return products.filter((p) => p.category === activeCat);
-  }, [products, activeCat]);
+  const offers = [
+    { name: "Plombiers", pain: "urgences perdues car personne ne répond assez vite" },
+    { name: "Nettoyage Airbnb", pain: "planning, photos et devis dispersés dans les messages" },
+    { name: "Réparation mobile", pain: "clients qui veulent un prix clair avant de se déplacer" },
+    { name: "Coachs & salons", pain: "rendez-vous oubliés et demandes répétitives" },
+  ];
 
   return (
     <main className="ashvex-grain" style={styles.shop}>
       <section style={styles.hero}>
-        <div style={styles.heroEyebrow}>COLLECTION — PRÉCOMMANDE</div>
+        <div style={styles.heroEyebrow}>BUSINESS 2026 — SERVICE B2B RÉCURRENT</div>
         <h1 style={styles.heroTitle}>ASHVEX</h1>
         <p style={styles.heroSub}>
-          Pièces en édition limitée. Chaque précommande est confirmée directement, de la main à la main.
+          Un assistant IA WhatsApp pour les petites entreprises de service qui perdent des clients parce
+          qu'elles répondent trop tard. Objectif: vendre une installation + un abonnement mensuel.
         </p>
+        <div style={styles.heroActions}>
+          <a className="av-btn" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour Ashvex, je veux voir une démo de l'assistant IA WhatsApp.")}`} target="_blank" rel="noopener noreferrer" style={styles.preorderBtn}>
+            Demander une démo
+          </a>
+          <button className="av-btn" style={styles.ghostBtn} onClick={() => window.location.hash = "/contact"}>
+            Voir le plan
+          </button>
+        </div>
       </section>
 
-      <div style={styles.catBar}>
-        <button
-          className="av-btn"
-          style={{ ...styles.catChip, ...(activeCat === "Tout" ? styles.catChipActive : {}) }}
-          onClick={() => setActiveCat("Tout")}
-        >
-          Tout
-        </button>
-        {categories.map((c) => (
-          <button
-            key={c}
-            className="av-btn"
-            style={{ ...styles.catChip, ...(activeCat === c ? styles.catChipActive : {}) }}
-            onClick={() => setActiveCat(c)}
-          >
-            {c}
-          </button>
-        ))}
-      </div>
+      <section style={styles.businessSection}>
+        <div style={styles.sectionHeader}>
+          <div style={styles.heroEyebrow}>PROBLÈME RÉEL</div>
+          <h2 style={styles.sectionTitle}>Les artisans et services locaux vivent dans WhatsApp, mais répondent trop lentement.</h2>
+          <p style={styles.sectionText}>
+            Les clients cherchent une réponse rapide: prix, disponibilité, preuve, rendez-vous. ASHVEX
+            capture la demande, pose les bonnes questions, prépare le devis et relance automatiquement.
+          </p>
+        </div>
+        <div style={styles.valueGrid}>
+          {proofPoints.map((point, i) => (
+            <article key={point} style={styles.valueCard}>
+              <span style={styles.cardIndexStatic}>{String(i + 1).padStart(2, "0")}</span>
+              <p style={styles.valueText}>{point}</p>
+            </article>
+          ))}
+        </div>
+      </section>
 
-      {!loaded ? (
-        <div style={styles.emptyState}>Chargement…</div>
-      ) : filtered.length === 0 ? (
-        <div style={styles.emptyState}>Aucune pièce disponible dans cette catégorie.</div>
-      ) : (
+      <section style={styles.businessSectionAlt}>
+        <div style={styles.sectionHeader}>
+          <div style={styles.heroEyebrow}>NICHE À ATTAQUER</div>
+          <h2 style={styles.sectionTitle}>Commencer par les métiers où chaque lead vaut cher.</h2>
+        </div>
         <div style={styles.grid}>
-          {filtered.map((p, i) => {
-            const firstVariant = (p.variants || [])[0];
-            const cover = firstVariant?.images?.[0];
-            const stock = productTotalStock(p);
-            const soldOut = p.hasSizes && stock === 0;
-            const priceDisplay = firstVariant?.price;
-
-            return (
-              <article
-                className="av-card"
-                key={p.id}
-                style={styles.card}
-                onClick={() => navigate(`/produit/${p.id}`)}
-              >
-                <div style={styles.cardImageWrap}>
-                  {cover ? (
-                    <img src={cover} alt={p.name} style={styles.cardImage} />
-                  ) : (
-                    <div style={styles.cardImagePlaceholder}>ASHVEX</div>
-                  )}
-                  <span style={styles.cardIndex}>{String(i + 1).padStart(2, "0")}</span>
-                  {soldOut && <span style={styles.soldOutBadge}>ÉPUISÉ</span>}
-                </div>
-                <div style={styles.cardBody}>
-                  <div style={styles.cardCategory}>{p.category}</div>
-                  <h3 style={styles.cardName}>{p.name}</h3>
-                  <div style={styles.cardFooter}>
-                    {priceDisplay && <span style={styles.cardPrice}>{priceDisplay} €</span>}
-                    <span style={styles.viewLink}>Voir →</span>
-                  </div>
-                </div>
-              </article>
-            );
-          })}
+          {offers.map((offer) => (
+            <article key={offer.name} style={styles.card}>
+              <div style={styles.cardBody}>
+                <div style={styles.cardCategory}>Marché cible</div>
+                <h3 style={styles.cardName}>{offer.name}</h3>
+                <p style={styles.cardCopy}>{offer.pain}</p>
+                <span style={styles.viewLink}>Pack démo en 48h →</span>
+              </div>
+            </article>
+          ))}
         </div>
-      )}
+      </section>
+
+      <section style={styles.businessSection}>
+        <div style={styles.planBox}>
+          <div style={styles.heroEyebrow}>MODÈLE 5K/MOIS</div>
+          <h2 style={styles.sectionTitle}>20 clients à 250€/mois = 5 000€/mois.</h2>
+          <p style={styles.sectionText}>
+            Offre simple: 497€ d'installation pour configurer le script, la FAQ, les relances et le tableau
+            de suivi, puis 149€ à 299€/mois selon le volume. Peu d'inventaire, marge élevée, amélioration
+            continue avec chaque conversation réelle.
+          </p>
+        </div>
+      </section>
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
@@ -540,72 +542,61 @@ function ProductPage({ product, loaded, navigate }) {
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
-        <div style={styles.heroEyebrow}>CONTACT</div>
-        <h2 style={styles.loginTitle}>Nous écrire</h2>
+        <div style={styles.heroEyebrow}>PLAN D'ACTION</div>
+        <h2 style={styles.loginTitle}>Lancer Ashvex en 30 jours</h2>
         <p style={styles.aboutText}>
-          Pour toute question sur une précommande, une pièce, ou une collaboration, contactez-nous
-          directement via WhatsApp depuis n'importe quelle fiche article, ou retrouvez-nous sur les
-          réseaux sociaux ci-dessous.
+          Semaine 1: choisir une niche locale et créer une démo WhatsApp. Semaine 2: contacter 100
+          entreprises avec une vidéo personnalisée. Semaine 3: installer les 3 premiers clients à prix
+          fondateur. Semaine 4: transformer les résultats en études de cas et augmenter le prix.
         </p>
         <div style={styles.aboutSocial}>
-          {SOCIAL_LINKS.instagram ? (
-            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" style={styles.aboutSocialLink}>
-              Instagram →
-            </a>
-          ) : (
-            <span style={styles.aboutSocialPlaceholder}>Instagram — bientôt</span>
-          )}
-          {SOCIAL_LINKS.tiktok ? (
-            <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" style={styles.aboutSocialLink}>
-              TikTok →
-            </a>
-          ) : (
-            <span style={styles.aboutSocialPlaceholder}>TikTok — bientôt</span>
-          )}
+          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour Ashvex, je veux lancer l'offre IA WhatsApp.")}`} target="_blank" rel="noopener noreferrer" style={styles.aboutSocialLink}>
+            Lancer par WhatsApp →
+          </a>
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
@@ -1094,51 +1085,63 @@ function AdminPanel({ products, categories, persist, showToast, setAuthed }) {
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
-  heroSub: { fontFamily: FONT_BODY, fontStyle: "italic", fontSize: 18, color: "#c9c9c5", maxWidth: 480, margin: "0 auto", lineHeight: 1.5 },
+  heroSub: { fontFamily: FONT_BODY, fontStyle: "italic", fontSize: 18, color: "#c9c9c5", maxWidth: 680, margin: "0 auto", lineHeight: 1.5 },
+  heroActions: { display: "flex", gap: 12, justifyContent: "center", alignItems: "center", flexWrap: "wrap", marginTop: 28 },
+  businessSection: { padding: "70px 28px", borderBottom: "1px solid #ffffff14" },
+  businessSectionAlt: { padding: "70px 0", borderBottom: "1px solid #ffffff14" },
+  sectionHeader: { maxWidth: 760, margin: "0 auto 30px", textAlign: "center" },
+  sectionTitle: { fontFamily: FONT_DISPLAY, fontSize: "clamp(34px, 6vw, 58px)", letterSpacing: 2, lineHeight: 1, margin: "0 0 18px" },
+  sectionText: { fontFamily: FONT_BODY, fontSize: 19, color: "#c9c9c5", lineHeight: 1.55, margin: 0 },
+  valueGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 1, background: "#ffffff14", border: "1px solid #ffffff14", maxWidth: 1050, margin: "0 auto" },
+  valueCard: { background: "#0A0A0A", padding: 28, minHeight: 170, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 26 },
+  cardIndexStatic: { fontSize: 11, letterSpacing: 1, color: "#8a8a85" },
+  valueText: { fontFamily: FONT_BODY, fontSize: 20, color: "#FAFAF8", lineHeight: 1.45, margin: 0 },
+  cardCopy: { fontFamily: FONT_BODY, fontSize: 17, color: "#c9c9c5", lineHeight: 1.5, margin: "10px 0 18px" },
+  planBox: { maxWidth: 820, margin: "0 auto", padding: "34px", background: "#141412", border: "1px solid #ffffff22", textAlign: "center" },
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
