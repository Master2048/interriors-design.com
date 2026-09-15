import fs from "node:fs";

const cssPath = "css/style.css";
let css = fs.readFileSync(cssPath, "utf8");

const marker = "/* =========================================================\n   Project pages\n   ========================================================= */";
if (!css.includes(marker)) {
  throw new Error("Project pages marker not found");
}

if (css.includes("Services index (hub page)")) {
  console.log("services-index already present");
} else {
  const insert = `/* =========================================================
   Inner-page hero
   ========================================================= */
.page-hero{
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
}
.page-hero__media{
  position: absolute;
  inset: 0;
  z-index: 0;
  background: #08090c;
}
.page-hero__media picture,
.page-hero__media img{
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 40%;
}
.page-hero__overlay{
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(6,6,7,0.58) 0%, rgba(6,6,7,0.48) 42%, rgba(6,6,7,0.72) 100%),
    linear-gradient(90deg, rgba(6,6,7,0.36) 0%, rgba(6,6,7,0.18) 50%, rgba(6,6,7,0.36) 100%);
  pointer-events: none;
}
.page-hero__content{
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 880px;
  margin-inline: auto;
  text-align: center;
  padding-top: var(--sp-4);
  padding-bottom: var(--sp-6);
  box-sizing: border-box;
}

/* =========================================================
   Services index (hub page)
   Photo-led tiles: title and one line sit on the still.
   ========================================================= */
.services-index{
  padding: var(--section-pad) 0;
  background:
    radial-gradient(90% 70% at 10% 12%, var(--cool-glow), transparent 58%),
    radial-gradient(70% 50% at 92% 80%, var(--cool-glow-soft), transparent 52%),
    linear-gradient(180deg, var(--cool-high) 0%, var(--cool-mid) 48%, var(--cool-deep) 100%);
}
.services-index .section-head{
  margin-bottom: var(--sp-12);
}
.services-index__grid{
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-6);
}
.service-tile{
  flex: 1 1 calc(50% - var(--sp-6));
  min-width: min(100%, 300px);
  margin: 0;
}
.service-tile__link{
  position: relative;
  display: block;
  height: 100%;
  color: inherit;
  text-decoration: none;
  overflow: hidden;
  border-radius: var(--radius-lg);
  isolation: isolate;
}
.service-tile__link:focus-visible{
  outline: 2px solid var(--accent-300);
  outline-offset: 3px;
}
.service-tile__link::after{
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(180deg, rgba(6,7,10,0.08) 28%, rgba(6,7,10,0.55) 68%, rgba(6,7,10,0.88) 100%);
  pointer-events: none;
  transition: background 500ms var(--ease);
}
.service-tile__link:hover::after,
.service-tile__link:focus-visible::after{
  background:
    linear-gradient(180deg, rgba(6,7,10,0.16) 18%, rgba(6,7,10,0.62) 64%, rgba(6,7,10,0.92) 100%);
}
.service-tile__media{
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: #08090c;
}
.service-tile__media picture,
.service-tile__media img{
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 800ms var(--ease);
}
.service-tile__link:hover .service-tile__media img,
.service-tile__link:focus-visible .service-tile__media img{
  transform: scale(1.045);
}
.service-tile__body{
  position: absolute;
  left: var(--sp-5);
  right: var(--sp-5);
  bottom: var(--sp-5);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-4) var(--sp-5);
  text-align: center;
  text-wrap: balance;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(9, 13, 20, 0.58);
  backdrop-filter: blur(20px) saturate(140%);
  -webkit-backdrop-filter: blur(20px) saturate(140%);
  transition:
    background 500ms var(--ease),
    border-color 500ms var(--ease);
}
.service-tile__link:hover .service-tile__body,
.service-tile__link:focus-visible .service-tile__body{
  background: rgba(9, 13, 20, 0.7);
  border-color: rgba(239, 133, 53, 0.35);
}
.service-tile__title{
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.35rem, 1.1rem + 0.8vw, 1.85rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--white);
  line-height: 1.15;
}
.service-tile__lead{
  margin: 0;
  max-width: 38ch;
  min-height: calc(1.55em * 2);
  color: rgba(245,243,239,0.86);
  font-size: var(--fs-sm);
  line-height: 1.55;
}
.portfolio-tile__meta{
  margin: 0 0 var(--sp-1);
  color: var(--accent-300);
  font-size: var(--fs-xs);
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.portfolio-index .service-tile__body{
  gap: var(--sp-2);
}

@media (max-width: 720px){
  .page-hero{
    height: 420px;
  }
  .page-hero__media img{ object-position: center 38%; }
  .page-hero__content{
    padding-top: var(--sp-3);
    padding-bottom: var(--sp-6);
    padding-inline: var(--sp-1);
  }
  .services-index{ padding: var(--sp-16) 0; }
  .services-index .section-head{ margin-bottom: var(--sp-8); }
  .services-index__grid{ gap: var(--sp-4); }
  .service-tile{ flex-basis: 100%; min-width: 0; }
  .service-tile__media{ aspect-ratio: 16 / 11; }
  .service-tile__body{
    left: var(--sp-3);
    right: var(--sp-3);
    bottom: var(--sp-3);
    padding: var(--sp-4) var(--sp-4);
    gap: var(--sp-1);
  }
}

`;

  css = css.replace(marker, insert + marker);
  console.log("inserted page-hero + services-index");
}

/* Ensure project-hero positions relative and overrides content */
if (!css.includes(".project-hero{ position: relative;")) {
  css = css.replace(
    ".project-hero{ min-height: min(760px, 84vh); }",
    ".project-hero{ position: relative; min-height: min(760px, 84vh); height: auto; }"
  );
  console.log("updated project-hero positioning");
}

fs.writeFileSync(cssPath, css);
console.log("wrote", cssPath, "lines", css.split(/\n/).length);
