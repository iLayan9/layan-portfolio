(() => {
  const box = document.querySelector('[data-qt]');
  if (!box) return;
  // boxes are in px of the 393 × 852 screen
  const I = [
    { k: 'Nobody wants to chase', ev: '6 of 10 named late repayments as their worst experience, and 7 cover the gap rather than ask twice.',
      d: 'The app does the asking. Automatic reminders go out before and after the due date, and the organizer gets a confirmation the moment someone pays. Green, yellow and red mark paid, due soon and overdue.',
      img: 'notifications', hl: [22, 136, 350, 336] },
    { k: 'Who paid, who hasn\'t?', ev: 'Organizers tracked payments from memory and WhatsApp screenshots.',
      d: 'Every group card shows progress in plain words: "2 of 3 paid" and how much is left, so nobody has to scroll a chat to find out.',
      img: 'groups', hl: [18, 426, 360, 210] },
    { k: 'Fewer steps', ev: 'The one participant who tried a splitting app quit because of too many steps.',
      d: 'Splitting is one screen: topic, amount, a last payment date and the members. One slide splits the bill and sends everyone their share.',
      img: 'split', hl: [28, 325, 345, 296], hl2: [90, 731, 213, 62] },
    { k: 'A date to pay by', ev: 'One participant wished the app would collect everyone\'s share on the agreed date.',
      d: 'Every bill carries a last payment date, and pending bills on Home show a countdown, so the deadline is shared, not remembered by one person.',
      img: 'home', hl: [160, 444, 58, 42], hl2: [17, 292, 218, 206] },
    { k: 'Trust comes first', ev: '6 of 10 would trust an app with their money only if a bank or official authority backs it.',
      d: 'Data safety is answered up front in the FAQ. The bigger answer isn\'t a screen: I recorded integration with banks and official platforms as a product requirement.',
      img: 'faq', hl: [22, 634, 350, 80] }
  ];
  const list = box.querySelector('.qt-list'), img = box.querySelector('.qt-phone img');
  const [h1, h2] = box.querySelectorAll('.qt-hl');
  list.innerHTML = I.map((x, i) => `<button type="button" role="tab" data-i="${i}"><span>${String(i + 1).padStart(2, '0')}</span><b>${x.k}</b><em>${x.ev}</em><p>${x.d}</p></button>`).join('');
  const place = (el, r) => {
    if (!r) { el.hidden = true; return; }
    el.hidden = false;
    el.style.left = (r[0] / 393 * 100) + '%'; el.style.top = (r[1] / 852 * 100) + '%';
    el.style.width = (r[2] / 393 * 100) + '%'; el.style.height = (r[3] / 852 * 100) + '%';
  };
  const show = (i) => {
    const x = I[i];
    list.querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-selected', i === j));
    img.src = `../assets/img/qatiah/${x.img}.webp`; img.alt = `${x.k}: ${x.img} screen`;
    place(h1, x.hl); place(h2, x.hl2);
  };
  list.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (b) show(+b.dataset.i); });
  show(0);
})();

/* ---------- Component viewer ---------- */
(() => {
  const box = document.querySelector('[data-comp]');
  if (!box) return;
  const C = [
    ['Bill card', 'c-split', 'Primary and secondary variants. Who it\'s split with, a one-tap Split Now, and the countdown to the payment date.'],
    ['Group card', 'c-group', 'Payment progress as a bar and in words: what\'s left and how many have paid.'],
    ['Payment states', 'c-notif', 'Paid, due soon and overdue, each tied to a semantic color and icon so the state reads before the text.'],
    ['History item', 'c-history', 'Category icon, date, amount and how many people shared it.'],
    ['Navigation', 'c-nav', 'Bottom navigation with four states. The active tab expands into a labeled pill.'],
    ['Buttons', 'c-buttons', 'Primary, secondary and outline, each in large, medium and small.'],
    ['Selection', 'c-gender', 'Radio cards with a large hit area for one-handed use.']
  ];
  const tabs = box.querySelector('.qt-comp-tabs'), img = box.querySelector('img'), p = box.querySelector('.qt-comp-stage p');
  tabs.innerHTML = C.map((c, i) => `<button type="button" role="tab" data-c="${i}">${c[0]}</button>`).join('');
  const show = i => {
    tabs.querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-selected', i === j));
    img.src = `../assets/img/qatiah/${C[i][1]}.webp`; img.alt = C[i][0] + ' component'; p.textContent = C[i][2];
  };
  tabs.addEventListener('click', e => { const b = e.target.closest('[data-c]'); if (b) show(+b.dataset.c); });
  show(0);
})();
