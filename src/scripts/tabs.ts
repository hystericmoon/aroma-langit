// Accessible tabs for any [data-tabs] container holding role="tab" buttons.
document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((box) => {
  const tabs = Array.from(box.querySelectorAll<HTMLButtonElement>(':scope > [role="tablist"] > [role="tab"]'));
  if (!tabs.length) return;
  const select = (i: number, focus = false) => {
    tabs.forEach((t, k) => {
      const on = k === i;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls') || '');
      if (panel) panel.hidden = !on;
    });
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', (e) => {
      const n = { ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 }[e.key];
      if (n === undefined) return;
      e.preventDefault();
      select(n, true);
    });
  });
});
