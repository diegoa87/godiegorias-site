/* Preferencias de visualización locales. Sin llamadas de red ni datos personales. */
(() => {
  const en = document.documentElement.lang === 'en';
  const t = (es,english) => en ? english : es;
  const key = 'godiego-display-v1';
  const defaults = {size:0,contrast:false,links:false,spacing:false,motion:false,font:false,line:false,align:false,saturation:false};
  let prefs = {...defaults};
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    for (const k of Object.keys(defaults)) if (typeof saved?.[k] === typeof defaults[k]) prefs[k] = saved[k];
  } catch {}
  if (![0,1,2].includes(prefs.size)) prefs.size = 0;

  const launcher = document.createElement('button');
  launcher.id = 'accessibility-toggle';
  launcher.type = 'button';
  launcher.setAttribute('aria-haspopup','dialog');
  launcher.setAttribute('aria-controls','display-panel');
  launcher.setAttribute('aria-expanded','false');
  launcher.innerHTML = '<span aria-hidden="true">Aa</span> '+t('Accesibilidad','Accessibility');
  const panel = document.createElement('dialog');
  panel.id = 'display-panel';
  panel.setAttribute('aria-labelledby','display-title');
  panel.setAttribute('aria-describedby','display-description');
  panel.innerHTML = `<div class="display-heading"><h2 id="display-title">${t('Accesibilidad','Accessibility')}</h2><button type="button" id="display-close" aria-label="${t('Cerrar ajustes','Close settings')}">×</button></div><p id="display-description">${t('Ajusta la lectura a tu manera. Preferencias guardadas solo en este navegador.','Adjust reading to suit you. Preferences are saved only in this browser.')}</p><div class="display-options"></div><button type="button" id="display-reset">${t('Restablecer ajustes','Reset settings')}</button><p class="display-note">${t('Estas ayudas no sustituyen la accesibilidad del sitio ni garantizan conformidad WCAG.','These options do not replace accessible design or guarantee WCAG conformance.')}</p><a href="#contacto" id="display-statement">${t('Informar una barrera de accesibilidad','Report an accessibility barrier')}</a><p class="display-status" role="status" aria-live="polite"></p>`;
  const labels = {size:t('Texto de lectura (no títulos)','Reading text (not headings)'),contrast:t('Alto contraste','High contrast'),links:t('Resaltar enlaces','Highlight links'),spacing:t('Espaciado de texto','Text spacing'),motion:t('Reducir movimiento','Reduce motion'),font:t('Fuente sencilla (Arial)','Simple font (Arial)'),line:t('Mayor altura de línea','Increased line height'),align:t('Alinear texto a la izquierda','Left-align text'),saturation:t('Imágenes en escala de grises','Grayscale images')};
  for (const k of Object.keys(defaults)) {
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.preference = k;
    b.addEventListener('click', () => { prefs[k] = k === 'size' ? (prefs.size+1)%3 : !prefs[k]; apply(); announce(labels[k]); });
    panel.querySelector('.display-options').append(b);
  }
  document.body.append(launcher,panel);
  const sizes = new Map();
  let resizeTimer, focusContact = false;
  function scale() {
    for (const e of sizes.keys()) e.style.removeProperty('font-size');
    sizes.clear();
    if (!prefs.size) return;
    for (const e of document.querySelectorAll('main *, footer *')) {
      if (e.closest('h1,h2,h3')) continue;
      if (e.children.length === 0 || [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
        sizes.set(e,parseFloat(getComputedStyle(e).fontSize));
    }
    for (const [e,size] of sizes) e.style.setProperty('font-size',`${size*(1+prefs.size*.25)}px`,'important');
  }
  function announce(label) { panel.querySelector('.display-status').textContent = label+' — '+t('ajuste actualizado','setting updated'); }
  function apply() {
    for (const k of Object.keys(defaults)) document.documentElement.classList.toggle('display-'+k,!!prefs[k]);
    for (const b of panel.querySelectorAll('[data-preference]')) {
      const k = b.dataset.preference;
      b.textContent = labels[k]+' · '+(k === 'size' ? `${100+prefs.size*25}%` : prefs[k] ? t('Activado','On') : t('Desactivado','Off'));
      if (k !== 'size') b.setAttribute('aria-pressed',String(prefs[k]));
    }
    scale();
    try { localStorage.setItem(key,JSON.stringify(prefs)); } catch {}
  }
  launcher.addEventListener('click', () => {
    const menu = document.querySelector('.menu');
    if (menu?.getAttribute('aria-expanded') === 'true') menu.click();
    panel.showModal(); launcher.setAttribute('aria-expanded','true');
    document.body.classList.add('display-panel-open');
    panel.querySelector('#display-close').focus();
  });
  panel.addEventListener('close', () => {
    launcher.setAttribute('aria-expanded','false');
    document.body.classList.remove('display-panel-open');
    if (focusContact) {
      const contact = document.querySelector('#contacto');
      if (contact) { contact.setAttribute('tabindex','-1'); contact.focus(); }
      focusContact = false;
    } else launcher.focus();
  });
  panel.querySelector('#display-close').addEventListener('click',() => panel.close());
  panel.querySelector('#display-reset').addEventListener('click',() => {
    prefs = {...defaults}; apply();
    try { localStorage.removeItem(key); } catch {}
    announce(t('Ajustes restablecidos','Settings reset'));
  });
  panel.querySelector('#display-statement').addEventListener('click',() => { focusContact = true; panel.close(); });
  panel.addEventListener('keydown',event => {
    if (event.key !== 'Tab') return;
    const items = [...panel.querySelectorAll('button,a[href]')];
    if (event.shiftKey && document.activeElement === items[0]) {event.preventDefault();items.at(-1).focus();}
    else if (!event.shiftKey && document.activeElement === items.at(-1)) {event.preventDefault();items[0].focus();}
  });
  window.addEventListener('resize',() => { clearTimeout(resizeTimer); resizeTimer = setTimeout(scale,100); });
  apply();
})();
