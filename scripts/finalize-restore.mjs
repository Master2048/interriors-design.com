import fs from "node:fs";

const version = "20260915-14";
const files = fs.readdirSync(".").filter((f) => f.endsWith(".html"));
for (const f of files) {
  let t = fs.readFileSync(f, "utf8");
  const next = t
    .replace(/css\/style\.min\.css\?v=[^"'\s>]+/g, `css/style.min.css?v=${version}`)
    .replace(/js\/script\.min\.js\?v=[^"'\s>]+/g, `js/script.min.js?v=${version}`);
  if (next !== t) {
    fs.writeFileSync(f, next);
    console.log("bumped", f);
  }
}

let p = fs.readFileSync("portfolio.html", "utf8");
const projects = [
  ["Дизайн-проект", "Дом с тёплым очагом", "Кухня-столовая в тёплых природных тонах с акцентом на уют и дерево.", "Интерьер частного дома в тёплых природных тонах"],
  ["Дизайн-проект", "Дом на природе", "Современный минимализм, тёплое дерево, латунь и мягкий свет.", "Интерьер коттеджа с тёплым деревом и латунью"],
  ["Дизайн-проект", "Светлый простор", "Светлая классика с плавными линиями и панорамными окнами.", "Светлый интерьер частного дома с панорамными окнами"],
  ["Дизайн-проект", "Акцент бордо", "Терракотовые и бордовые акценты на фоне спокойной светлой отделки.", "Интерьер кухни-гостиной с бордовыми акцентами"],
  ["Реализация", "Дом с золотым светом", "Тёплое золото света, натуральные фактуры и мраморные акценты.", "Реализованный интерьер частного дома с тёплым светом"],
  ["Дизайн-проект", "Оливковый бархат", "Оливковый бархат, тёмное дерево и мягкий золотой свет.", "Интерьер дома с оливковыми и бархатными акцентами"],
];

for (let i = 0; i < 6; i++) {
  const id = i + 1;
  const [type, title, lead, alt] = projects[i];
  const re = new RegExp(
    `(href="project-${id}\\.html">[\\s\\S]*?<img src="assets/img/portfolio/project-${id}/01\\.webp" alt=")[^"]*("[\\s\\S]*?portfolio-tile__meta">)[^<]*(</p>[\\s\\S]*?service-tile__title">)[^<]*(</h3>[\\s\\S]*?service-tile__lead">)[^<]*(</p>)`
  );
  const before = p;
  p = p.replace(re, `$1${alt}$2${type}$3${title}$4${lead}$5`);
  console.log(p === before ? `no replace for ${id}` : `fixed project ${id}`);
}
fs.writeFileSync("portfolio.html", p);

const css = fs.readFileSync("css/style.css", "utf8");
const min = fs.readFileSync("css/style.min.css", "utf8");
console.log("style has page-hero block", css.includes("Inner-page hero"));
console.log("style has services-index", css.includes("Services index"));
console.log("min has page-hero{", min.includes(".page-hero{"));
console.log("min has service-tile", min.includes("service-tile"));
