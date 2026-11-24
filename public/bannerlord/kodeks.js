(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = s => String(s).toLocaleLowerCase("tr")
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c")
    .normalize("NFD").replace(/[̀-ͯ]/g, "");

  /* ---------- folyolardan arama dizini ---------- */
  const folios = $$("article.folio");
  const entries = folios.map((el, i) => {
    const name = $("h3", el).textContent.trim();
    const keys = $$("kbd", el).map(k => k.textContent).join(" ");
    return {
      i, el, id: el.dataset.mod, anchor: el.id, name, cat: el.dataset.cat,
      no: $(".folio-no", el).textContent.match(/\d+/)[0],
      sum: ($(".folio-incipit", el).textContent || "").trim().replace(/\s+/g, " "),
      _name: norm(name + " " + el.dataset.mod),
      _head: norm(keys + " " + $$("h5", el).map(h => h.textContent).join(" ")),
      _body: norm(el.textContent),
    };
  });
  const byId = Object.fromEntries(entries.map(e => [e.id, e]));
  const byAnchor = Object.fromEntries(entries.map(e => [e.anchor, e]));
  const score = (e, terms) => {
    let s = 0;
    for (const t of terms) {
      if (e._name.includes(t)) s += e._name.startsWith(t) ? 12 : 8;
      else if (e._head.includes(t)) s += 3;
      else if (e._body.includes(t)) s += 1;
      else return 0;
    }
    return s;
  };
  const termsOf = q => norm(q).split(/\s+/).filter(Boolean);

  /* ---------- dizin süzgeci ---------- */
  const rows = $$("#rows tr");
  const rowById = Object.fromEntries(rows.map(r => [r.dataset.mod, r]));
  const q = $("#q"), cat = $("#cat"), tagBoxes = $$(".tags input"), count = $("#count"), empty = $("#empty");
  const applyFilter = () => {
    const terms = termsOf(q.value);
    const tags = tagBoxes.filter(b => b.checked).map(b => b.value);
    let shown = 0;
    const ranked = [];
    for (const e of entries) {
      const r = rowById[e.id];
      const rowTags = (r.dataset.tags || "").split("|");
      let ok = (!cat.value || r.dataset.cat === cat.value) && tags.every(t => rowTags.includes(t));
      const s = ok && terms.length ? score(e, terms) : 1;
      ok = ok && s > 0;
      r.hidden = !ok;
      if (ok) { shown++; ranked.push([r, s, e.i]); }
    }
    if (terms.length) ranked.sort((a, b) => b[1] - a[1] || a[2] - b[2]);
    else ranked.sort((a, b) => a[2] - b[2]);
    const tbody = $("#rows");
    ranked.forEach(([r]) => tbody.appendChild(r));
    count.textContent = shown === entries.length ? `${shown} mod listeleniyor.` : `${entries.length} modun ${shown} tanesi listeleniyor.`;
    empty.hidden = shown > 0;
  };
  let t;
  q.addEventListener("input", () => { clearTimeout(t); t = setTimeout(applyFilter, 80); });
  cat.addEventListener("change", applyFilter);
  q.form.addEventListener("submit", e => e.preventDefault());
  tagBoxes.forEach(b => b.addEventListener("change", applyFilter));
  $("#rows").addEventListener("click", e => {
    const r = e.target.closest("tr[data-mod]");
    if (r && !e.target.closest("a")) openFolio(r.dataset.mod);
  });

  /* ---------- folyo paneli ---------- */
  const panel = $("#panel"), sheet = $(".panel-sheet", panel), body = $("#panelBody");
  const prevBtn = $("#prevBtn"), nextBtn = $("#nextBtn"), pos = $("#panelPos");
  let current = null, returnFocus = null;
  const lock = on => document.body.classList.toggle("locked", on);

  function openFolio(id, updateHash = true) {
    const e = byId[id];
    if (!e) return;
    if (!panel.classList.contains("open")) returnFocus = document.activeElement;
    current = e;
    const clone = e.el.cloneNode(true);
    clone.removeAttribute("id");
    $("h3", clone).id = "panelTitle";
    body.replaceChildren(clone);
    body.scrollTop = 0;
    prevBtn.disabled = e.i === 0;
    nextBtn.disabled = e.i === entries.length - 1;
    pos.textContent = `Folyo ${e.no} / ${entries.length}`;
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add("open"));
    lock(true);
    sheet.focus({ preventScroll: true });
    if (updateHash) history.replaceState(null, "", "#" + e.anchor);
  }
  function closeFolio() {
    if (panel.hidden) return;
    panel.classList.remove("open");
    lock(false);
    current = null;
    history.replaceState(null, "", location.pathname + location.search);
    const done = () => { if (!panel.classList.contains("open")) panel.hidden = true; };
    matchMedia("(prefers-reduced-motion: reduce)").matches ? done() : setTimeout(done, 450);
    if (returnFocus) returnFocus.focus({ preventScroll: true });
  }
  prevBtn.addEventListener("click", () => current && openFolio(entries[current.i - 1].id));
  nextBtn.addEventListener("click", () => current && openFolio(entries[current.i + 1].id));
  panel.addEventListener("click", e => { if (e.target.closest("[data-close]")) closeFolio(); });

  document.addEventListener("click", e => {
    const a = e.target.closest("a[data-mod]");
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    if (!finder.hidden) closeFinder();
    openFolio(a.dataset.mod);
  });

  /* ---------- mod bulucu ---------- */
  const finder = $("#finder"), fq = $("#fq"), flist = $("#fList");
  let found = [], sel = 0;
  const renderFinder = () => {
    const terms = termsOf(fq.value);
    found = terms.length
      ? entries.map(e => [e, score(e, terms)]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1] || a[0].i - b[0].i).slice(0, 30).map(x => x[0])
      : entries.slice(0, 30);
    sel = 0;
    flist.innerHTML = found.length
      ? found.map((e, k) => `<li role="option" id="fo${k}" data-k="${k}" aria-selected="${k === 0}"><span class="f">f. ${e.no}</span><span class="n">${esc(e.name)}</span><span class="s">${esc(e.sum.slice(0, 140))}</span></li>`).join("")
      : `<li aria-disabled="true"><span></span><span class="s">Eşleşen mod yok. Daha kısa bir kelime dene.</span></li>`;
    fq.setAttribute("aria-activedescendant", found.length ? "fo0" : "");
  };
  const select = k => {
    if (!found.length) return;
    sel = (k + found.length) % found.length;
    $$("li", flist).forEach((li, i) => li.setAttribute("aria-selected", String(i === sel)));
    $("#fo" + sel).scrollIntoView({ block: "nearest" });
    fq.setAttribute("aria-activedescendant", "fo" + sel);
  };
  function openFinder() {
    closeFolio();
    finder.hidden = false;
    requestAnimationFrame(() => finder.classList.add("open"));
    lock(true);
    fq.value = "";
    renderFinder();
    fq.focus();
  }
  function closeFinder() {
    finder.classList.remove("open");
    finder.hidden = true;
    lock(false);
  }
  $("#openFinder").addEventListener("click", openFinder);
  finder.addEventListener("click", e => { if (e.target.closest("[data-fclose]")) closeFinder(); });
  fq.addEventListener("input", renderFinder);
  flist.addEventListener("click", e => { const li = e.target.closest("li[data-k]"); if (li) { const id = found[+li.dataset.k].id; closeFinder(); openFolio(id); } });
  fq.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); select(sel + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); select(sel - 1); }
    else if (e.key === "Enter" && found[sel]) { const id = found[sel].id; closeFinder(); openFolio(id); }
  });

  /* ---------- klavye ---------- */
  document.addEventListener("keydown", e => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); finder.hidden ? openFinder() : closeFinder(); return; }
    if (e.key === "Escape") { finder.hidden ? closeFolio() : closeFinder(); return; }
    if (e.key === "/" && !typing && finder.hidden) { e.preventDefault(); openFinder(); return; }
    if (current && !typing) {
      if (e.key === "ArrowRight" && !nextBtn.disabled) nextBtn.click();
      if (e.key === "ArrowLeft" && !prevBtn.disabled) prevBtn.click();
    }
    if (e.key === "Tab" && !panel.hidden) {
      const f = $$("button:not([disabled]), a[href]", sheet);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------- menü ve konum ---------- */
  const menuBtn = $("#menuBtn"), navLinks = $("#navLinks");
  menuBtn.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  navLinks.addEventListener("click", e => {
    if (e.target.closest("a")) { navLinks.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
  });
  const spy = new IntersectionObserver(list => list.forEach(en => {
    if (!en.isIntersecting) return;
    $$("a", navLinks).forEach(a => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + en.target.id)));
  }), { rootMargin: "-40% 0px -55% 0px" });
  $$("a", navLinks).forEach(a => { const s = $(a.getAttribute("href")); if (s) spy.observe(s); });

  /* ---------- doğrudan bağlantı ---------- */
  const fromHash = () => {
    const e = byAnchor[decodeURIComponent(location.hash.slice(1))];
    if (e) openFolio(e.id, false);
  };
  addEventListener("hashchange", fromHash);
  fromHash();
})();

/* ---------- doğrudan indirme: "Paketi kur" tıklandığında indirir ve talimatlara kaydırır ---------- */
(() => {
  "use strict";
  const kurBtn = document.getElementById("paketiKurBtn");
  const indirBtn = document.querySelector("#indirDugme a[href]");
  if (kurBtn && indirBtn) {
    kurBtn.addEventListener("click", () => {
      const a = document.createElement("a");
      a.href = indirBtn.href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }
  const kaydir = () => {
    if (/^#indir(=|$)/.test(location.hash)) {
      document.getElementById("indir")?.scrollIntoView();
    }
  };
  addEventListener("hashchange", kaydir);
  kaydir();
})();
