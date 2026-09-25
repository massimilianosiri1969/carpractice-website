(() => {
  const root = document.querySelector('.language-showcase');
  if (!root) return;
  const preview = document.getElementById('languagePreview');
  const locale = document.getElementById('languageLocale');
  const buttons = [...root.querySelectorAll('[data-lang]')];
  const translations = {
    it: ['Italiano','OPERATIVITÀ','Scansiona targa o carica foto','Usa la fotocamera oppure scegli una foto della targa dal dispositivo','Ricerca manualmente','Digita il numero di targa','Ricerca pratiche','Veicoli','Operatori','Acquista crediti'],
    en: ['English','OPERATIONS','Scan plate or upload a photo','Use your camera or choose a plate photo from your device','Search manually','Type the license plate number','Search cases','Vehicles','Operators','Buy credits'],
    de: ['Deutsch','BETRIEB','Kennzeichen scannen oder Foto hochladen','Kamera verwenden oder Kennzeichenfoto vom Gerät auswählen','Manuell suchen','Kennzeichen eingeben','Vorgänge suchen','Fahrzeuge','Mitarbeiter','Guthaben kaufen'],
    fr: ['Français','OPÉRATIONS','Scanner la plaque ou importer une photo','Utilisez l’appareil photo ou choisissez une photo de la plaque','Recherche manuelle','Saisissez la plaque','Rechercher des dossiers','Véhicules','Opérateurs','Acheter des crédits'],
    es: ['Español','OPERACIONES','Escanear matrícula o subir foto','Usa la cámara o elige una foto de la matrícula del dispositivo','Buscar manualmente','Introduce la matrícula','Buscar expedientes','Vehículos','Operadores','Comprar créditos'],
    pt: ['Português','OPERAÇÕES','Digitalizar matrícula ou carregar foto','Usa a câmara ou escolhe uma foto da matrícula no dispositivo','Pesquisa manual','Introduz a matrícula','Pesquisar processos','Veículos','Operadores','Comprar créditos'],
    ru: ['Русский','ОПЕРАЦИИ','Сканировать номер или загрузить фото','Используйте камеру или выберите фото номера на устройстве','Поиск вручную','Введите номер автомобиля','Поиск дел','Автомобили','Операторы','Купить кредиты'],
    zh: ['中文','操作','扫描车牌或上传照片','使用相机或从设备中选择车牌照片','手动搜索','输入车牌号','搜索案件','车辆','操作员','购买积分'],
    hi: ['हिन्दी','संचालन','नंबर प्लेट स्कैन करें या फ़ोटो अपलोड करें','कैमरा इस्तेमाल करें या डिवाइस से नंबर प्लेट की फ़ोटो चुनें','मैन्युअल खोज','नंबर प्लेट दर्ज करें','मामले खोजें','वाहन','ऑपरेटर','क्रेडिट खरीदें'],
    ja: ['日本語','業務','ナンバープレートを読み取るか写真をアップロード','カメラを使うか端末からナンバープレートの写真を選択','手動検索','ナンバープレートを入力','案件を検索','車両','担当者','クレジットを購入']
  };
  const fields = ['eyebrow','scan','scanHelp','manual','manualHelp','cases','vehicles','operators','credits'];
  let current = 0;
  let timer;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const setLanguage = (index, animate = true) => {
    current = index;
    const code = buttons[index].dataset.lang;
    const values = translations[code];
    const render = () => {
      fields.forEach((field, i) => { preview.querySelector(`[data-copy="${field}"]`).textContent = values[i + 1]; });
      locale.textContent = `${values[0]} · ${code.toUpperCase()}`;
      preview.lang = code;
      buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      preview.classList.remove('changing');
    };
    if (animate && !reduced.matches) { preview.classList.add('changing'); setTimeout(render, 230); } else render();
    root.dataset.playing = 'false';
    void root.offsetWidth;
    root.dataset.playing = 'true';
  };
  const stop = () => { clearInterval(timer); root.dataset.playing = 'false'; };
  const start = () => {
    if (reduced.matches || document.hidden) return;
    stop();
    root.dataset.playing = 'true';
    timer = setInterval(() => setLanguage((current + 1) % buttons.length), 3800);
  };
  buttons.forEach((button, index) => button.addEventListener('click', () => { stop(); setLanguage(index); }));
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', event => { if (!root.contains(event.relatedTarget)) start(); });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  reduced.addEventListener?.('change', () => reduced.matches ? stop() : start());
  start();
})();
