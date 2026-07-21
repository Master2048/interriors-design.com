import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const htmlPath = path.join(root, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const start = html.indexOf('  <!-- ============ PORTFOLIO');
const end = html.indexOf('  <!-- ============ VIZ A');
if (start < 0 || end < 0) throw new Error('portfolio markers not found');

const section = `  <!-- ============ PORTFOLIO — projects5 style ============ -->
  <section class="portfolio" id="portfolio">
    <div class="container">
      <div class="section-head">
        <p class="eyebrow" data-reveal>Портфолио</p>
        <h2 class="h2" data-reveal>Проекты, в которые<br>мы вложили душу</h2>
        <p class="section-head__text" data-reveal>
          Визуализации и фотографии готовых объектов — интерьеры, снятые изнутри
          и снаружи.
        </p>
      </div>

      <div class="portfolio__grid">

        <article class="project-card tilt-card" data-reveal data-tilt data-project="1" data-count="10" data-title="Дом с тёплым очагом" data-desc="Кухня-столовая в тёплых природных тонах с акцентом на уют и дерево.">
          <button class="project-card__btn" type="button" aria-label="Открыть галерею проекта «Дом с тёплым очагом»">
            <span class="project-card__media">
              <img src="assets/img/portfolio/project-1/01.jpg" alt="Дом с тёплым очагом — кухня со столовой зоной" width="1600" height="1000" loading="lazy" decoding="async">
            </span>
            <span class="project-card__body">
              <span class="project-card__meta">Дизайн-проект</span>
              <span class="project-card__title">Дом с тёплым очагом</span>
              <span class="project-card__desc">Кухня-столовая в тёплых природных тонах с акцентом на уют и дерево.</span>
              <span class="project-card__cta">Смотреть галерею<svg class="icon" width="16" height="16" aria-hidden="true"><use href="#icon-arrow-right"/></svg></span>
            </span>
          </button>
        </article>

        <article class="project-card tilt-card" data-reveal data-reveal-delay="1" data-tilt data-project="2" data-count="10" data-title="Дом на природе" data-desc="Современный минимализм: тёплое дерево, латунь и мягкий свет.">
          <button class="project-card__btn" type="button" aria-label="Открыть галерею проекта «Дом на природе»">
            <span class="project-card__media">
              <img src="assets/img/portfolio/project-2/01.jpg" alt="Дом на природе — кухня в дереве и латуни" width="1600" height="1000" loading="lazy" decoding="async">
            </span>
            <span class="project-card__body">
              <span class="project-card__meta">Дизайн-проект</span>
              <span class="project-card__title">Дом на природе</span>
              <span class="project-card__desc">Современный минимализм: тёплое дерево, латунь и мягкий свет.</span>
              <span class="project-card__cta">Смотреть галерею<svg class="icon" width="16" height="16" aria-hidden="true"><use href="#icon-arrow-right"/></svg></span>
            </span>
          </button>
        </article>

        <article class="project-card tilt-card" data-reveal data-reveal-delay="2" data-tilt data-project="3" data-count="10" data-title="Светлый простор" data-desc="Светлая классика с плавными линиями и панорамными окнами.">
          <button class="project-card__btn" type="button" aria-label="Открыть галерею проекта «Светлый простор»">
            <span class="project-card__media">
              <img src="assets/img/portfolio/project-3/01.jpg" alt="Светлый простор — обеденная зона с панорамными окнами" width="1600" height="1000" loading="lazy" decoding="async">
            </span>
            <span class="project-card__body">
              <span class="project-card__meta">Дизайн-проект</span>
              <span class="project-card__title">Светлый простор</span>
              <span class="project-card__desc">Светлая классика с плавными линиями и панорамными окнами.</span>
              <span class="project-card__cta">Смотреть галерею<svg class="icon" width="16" height="16" aria-hidden="true"><use href="#icon-arrow-right"/></svg></span>
            </span>
          </button>
        </article>

        <article class="project-card tilt-card" data-reveal data-tilt data-project="4" data-count="10" data-title="Акцент бордо" data-desc="Насыщенный акцент терракотового и бордового на фоне светлой отделки.">
          <button class="project-card__btn" type="button" aria-label="Открыть галерею проекта «Акцент бордо»">
            <span class="project-card__media">
              <img src="assets/img/portfolio/project-4/01.jpg" alt="Акцент бордо — кухня-гостиная с бордовыми фасадами" width="1600" height="1000" loading="lazy" decoding="async">
            </span>
            <span class="project-card__body">
              <span class="project-card__meta">Дизайн-проект</span>
              <span class="project-card__title">Акцент бордо</span>
              <span class="project-card__desc">Насыщенный акцент терракотового и бордового на фоне светлой отделки.</span>
              <span class="project-card__cta">Смотреть галерею<svg class="icon" width="16" height="16" aria-hidden="true"><use href="#icon-arrow-right"/></svg></span>
            </span>
          </button>
        </article>

        <article class="project-card tilt-card" data-reveal data-reveal-delay="1" data-tilt data-project="5" data-count="10" data-title="Дом с золотым светом" data-desc="Реализованный проект: тёплое золото света и мраморные акценты.">
          <button class="project-card__btn" type="button" aria-label="Открыть галерею проекта «Дом с золотым светом»">
            <span class="project-card__media">
              <img src="assets/img/portfolio/project-5/01.jpg" alt="Дом с золотым светом — реализованная столовая зона" width="1600" height="1000" loading="lazy" decoding="async">
            </span>
            <span class="project-card__body">
              <span class="project-card__meta">Реализация</span>
              <span class="project-card__title">Дом с золотым светом</span>
              <span class="project-card__desc">Реализованный проект: тёплое золото света и мраморные акценты.</span>
              <span class="project-card__cta">Смотреть галерею<svg class="icon" width="16" height="16" aria-hidden="true"><use href="#icon-arrow-right"/></svg></span>
            </span>
          </button>
        </article>

        <article class="project-card tilt-card" data-reveal data-reveal-delay="2" data-tilt data-project="6" data-count="10" data-title="Спа-эстетика" data-desc="Спокойные бежевые оттенки и текстильные акценты в зоне отдыха.">
          <button class="project-card__btn" type="button" aria-label="Открыть галерею проекта «Спа-эстетика»">
            <span class="project-card__media">
              <img src="assets/img/portfolio/project-6/01.jpg" alt="Спа-эстетика — ванная комната в бежевых тонах" width="1600" height="1000" loading="lazy" decoding="async">
            </span>
            <span class="project-card__body">
              <span class="project-card__meta">Дизайн-проект</span>
              <span class="project-card__title">Спа-эстетика</span>
              <span class="project-card__desc">Спокойные бежевые оттенки и текстильные акценты в зоне отдыха.</span>
              <span class="project-card__cta">Смотреть галерею<svg class="icon" width="16" height="16" aria-hidden="true"><use href="#icon-arrow-right"/></svg></span>
            </span>
          </button>
        </article>

      </div>
    </div>
  </section>


`;

html = html.slice(0, start) + section + html.slice(end);
fs.writeFileSync(htmlPath, html, 'utf8');
console.log('portfolio HTML updated');
