// Page motion: smooth scroll, section entrances and line reveals.
// Everything here is an enhancement. Content is fully visible without it, and only
// elements that start below the fold are hidden before they animate in.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

function belowFold(el: Element) {
  return el.getBoundingClientRect().top > window.innerHeight * 0.92;
}

function initLenis() {
  if (reduce.matches) return;
  const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, anchors: { offset: -88 }, autoRaf: false });
  window.__lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

function initReveals() {
  if (reduce.matches) return;

  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    if (!belowFold(el)) return;
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line', autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 110, duration: 0.25, ease: 'power3.out', stagger: 0.03,
          scrollTrigger: { trigger: el, start: 'top 97%', once: true },
        });
      },
    });
    el.dataset.splitReady = String(split.lines.length);
  });

  // Entrances animate opacity and position only, never visibility, so content stays
  // in the tab order and in find-in-page before it has been scrolled to.
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((group) => {
    if (!belowFold(group)) return;
    const items = group.querySelectorAll<HTMLElement>('[data-reveal-item]');
    const targets = items.length ? Array.from(items) : Array.from(group.children);
    gsap.set(targets, { opacity: 0, y: 12 });
    let done = false;
    const reveal = (instant = false) => {
      if (done) return;
      done = true;
      gsap.to(targets, {
        opacity: 1, y: 0, duration: instant ? 0.15 : 0.25, ease: 'power3.out', stagger: instant ? 0 : 0.04,
        clearProps: 'transform,opacity',
      });
    };
    ScrollTrigger.create({ trigger: group, start: 'top 94%', once: true, onEnter: () => reveal() });
    group.addEventListener('focusin', () => reveal(true), { once: true });
  });
}

function initNav() {
  const nav = document.querySelector<HTMLElement>('[data-nav]');
  if (!nav) return;
  let last = window.scrollY;
  let hidden = false;
  const onScroll = () => {
    const y = window.scrollY;
    const open = nav.dataset.open === 'true';
    const shouldHide = !open && y > 160 && y > last + 4;
    const shouldShow = y < last - 4 || y < 160;
    if (shouldHide && !hidden) { nav.dataset.hidden = 'true'; hidden = true; }
    else if (shouldShow && hidden) { nav.dataset.hidden = 'false'; hidden = false; }
    nav.dataset.scrolled = String(y > 24);
    last = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  nav.addEventListener('focusin', () => { nav.dataset.hidden = 'false'; hidden = false; });
  onScroll();
}

function init() {
  document.documentElement.classList.add('motion-ready');
  initLenis();
  initNav();
  // Wait for fonts so line splits measure the real face.
  const go = () => {
    initReveals();
    ScrollTrigger.refresh();
  };
  if (document.fonts?.status === 'loaded') go();
  else document.fonts.ready.then(go, go);
}

init();
