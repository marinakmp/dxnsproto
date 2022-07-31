(() => {
  const CLASS_ACTIVE = '_active';
  const SCOPE_3DMARK_NAME = '3dmark';
  const _doc = document;
  const gamesPlaceholder = _doc.getElementById('gamesCollection');
  const dropdownToggle = _doc.getElementById('gamesToggle');
  const gamesControlPrev = _doc.getElementById('gamesControlPrev');
  const gamesControlNext = _doc.getElementById('gamesControlNext');
  const productsSelectionEl = _doc.getElementById('productsSelection');
  let gamesCount;
  let dataFetched;
  let productCurrent;
  let productsList;
  let gamesCollection = [];

  // Fetch func
  async function fetchData(url = './api/benchmark.json') {
    const response = await fetch(url);

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    return await response.json();
  }

  // Update score graphs
  function updateGraphs(product) {
    const graphs = _doc.querySelectorAll('[data-graph-scope]');

    if (!product || graphs.length === 0) return;

    graphs.forEach( (g) => {
      const benchmarksData = dataFetched?.benchmarks;
      const timeSpyVal = +product?.['3DMark_Time_Spy_CPU_score'];
      const is3dMark = g.dataset['graphScope'] === SCOPE_3DMARK_NAME;
      const timeSpyEl = g.querySelector('[data-graph="timespy"]');
      const bar3dmarkNodes = g.querySelectorAll('[data-benchmark]');
      let range = [];
      let closest;
      let activeLevelKey;
      let activeLevelKeyEntry;
      let descriptionEl = g.querySelector('[data-graph="description"]');

      if (!is3dMark) {
        g.querySelectorAll('.graph-bar-title').forEach(b => {


          if (b.innerText === product['PCMark_Category']) {
            b.parentElement.classList.add(CLASS_ACTIVE);
            activeLevelKey = b.parentElement.dataset?.['benchmarkName'];
            descriptionEl && activeLevelKey && (descriptionEl.innerText = benchmarksData?.['pcmark']?.[activeLevelKey]?.text)

          } else {
            b.parentElement.classList.remove(CLASS_ACTIVE);
          }
        });

      } else {
        timeSpyEl.innerHTML = timeSpyVal;

        bar3dmarkNodes.forEach(b => {
          range.push(+b.dataset['benchmark']);
        });

        closest = range.reduce(function(prev, curr) {
          return (Math.abs(curr - timeSpyVal) < Math.abs(prev - timeSpyVal) ? curr : prev);
        });

        bar3dmarkNodes.forEach(b => {
          if (closest === +b.dataset['benchmark']) {
            b.classList.add(CLASS_ACTIVE);
            activeLevelKey = b.dataset?.['benchmarkName'];
          } else {
            b.classList.remove(CLASS_ACTIVE);
          }
        });

        activeLevelKeyEntry = benchmarksData?.['3dmark']?.[activeLevelKey];

        if (descriptionEl && activeLevelKeyEntry) {
          descriptionEl.innerHTML = `<strong>${activeLevelKeyEntry?.title}</strong> ${activeLevelKeyEntry?.text}`;
        }
      }
    });
  }

  // Game FPS

  function animateValue(obj, start, end, duration) {
    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      obj.innerHTML = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }


  function animateFPS(counters) {
    counters.forEach(counter => {
        const value = +counter.getAttribute('data-count');

        if (isNaN(value)) {
          counter.innerText = '?';
          return;
        }

        animateValue(counter, 0, value, 800);
    });
  }

  function setFPS(game) {
    const normalEl = _doc.querySelector('[data-fps="normal"]');
    const ultraEl = _doc.querySelector('[data-fps="ultra"]');

    'normal' in game && normalEl.setAttribute('data-count', game.normal);
    'ultra' in game && ultraEl.setAttribute('data-count', game.ultra)

    animateFPS(_doc.querySelectorAll('[data-fps]'));
  }

  // Games collection
  function setGamesCollection(games = {}) {
    let options = '';
    let activeClass;

    gamesCollection = Object.keys(games);
    gamesCount = gamesCollection.length;

    if(gamesCount === 0) return;

    gamesCollection.map((game,idx) => {
      activeClass = idx === 0 && CLASS_ACTIVE;
      options += `<li><a class="dropdown-item ${activeClass}" href="#${game}" data-index="${idx}" data-key="${game}">${game}</a></li>`;
    });

    dropdownToggle.innerText = gamesCollection[0];
    gamesPlaceholder.innerHTML = options;

    // Set controls state
    setControlsState(0);

    // Set FPS
    setFPS(games[gamesCollection[0]]);
  }

  // Dropdown toggle
  dropdownToggle.addEventListener('click', (e) => {
    const t = e.target;
    const ns = t && t.nextElementSibling;
    const isExpanded = t && t.getAttribute('aria-expanded') === 'true';

    if (!ns) return;

    t.setAttribute('aria-expanded', !isExpanded);
    isExpanded
        ? ns.classList.remove('_show')
        : ns.classList.add('_show') ;
  });

  // Dropdown selection
  gamesPlaceholder.addEventListener('click', (e) => {
    const nextSelected = e.target;
    const nodes = gamesPlaceholder.querySelectorAll('a.dropdown-item');
    const nextSelectedIdx = +nextSelected?.dataset?.['index'];

    for (let node of nodes) {
      node.classList.remove(CLASS_ACTIVE)
    }

    nextSelected.classList.add(CLASS_ACTIVE);

    dropdownToggle.textContent = nextSelected.textContent;
    dropdownToggle.setAttribute('aria-expanded', 'false');
    gamesPlaceholder.classList.remove('_show');

    // Set controls state
    setControlsState(nextSelectedIdx);

    // Set FPS
    setFPS(productCurrent['Games']?.[nextSelected.textContent]);

    e.preventDefault();
  });

  // Dropdown controls
  // State
  function setControlsState(idx) {
    if (isNaN(idx) || !gamesControlPrev || !gamesControlNext) return;

    if (idx === 0) {
      gamesControlPrev.setAttribute('disabled', 'disabled');
      gamesControlPrev.classList.add('_disabled');
    } else {
      gamesControlPrev.removeAttribute('disabled');
      gamesControlPrev.classList.remove('_disabled');
    }

    if (idx === gamesCount - 1) {
      gamesControlNext.setAttribute('disabled', 'disabled');
      gamesControlNext.classList.add('_disabled');
    } else {
      gamesControlNext.removeAttribute('disabled');
      gamesControlNext.classList.remove('_disabled');
    }
  }

  // Event handlers
  gamesControlPrev && gamesControlPrev.addEventListener('click', (e) => {
    const gameCurrent = gamesPlaceholder.querySelector(`a.${CLASS_ACTIVE}`);
    // If index invalid get first item on the list
    const gameIdx = +gameCurrent?.dataset?.['index'] || 0;
    let gamePrev;

    if (gameIdx === 0) {
      gamesControlPrev.setAttribute('disabled', 'disabled');
      gamesControlPrev.classList.add('_disabled');
    } else {
      gamesControlPrev.removeAttribute('disabled');
      gamesControlPrev.classList.remove('_disabled');
      gamePrev = gameIdx && gamesPlaceholder.querySelector('.dropdown-item[data-index="' + (gameIdx - 1) + '"]');
      gamePrev && gamePrev.click();
    }
  });

  gamesControlNext && gamesControlNext.addEventListener('click', (e) => {
    const gameCurrent = gamesPlaceholder.querySelector(`a.${CLASS_ACTIVE}`);
    // If index invalid get first item on the list
    const gameIdx = (+gameCurrent?.dataset?.['index'] ?? 0) + 1;
    let gameNext;

    if (gameIdx > gamesCount - 1) {
      gamesControlNext.setAttribute('disabled', 'disabled');
      gamesControlNext.classList.add('_disabled');
    } else {
      gamesControlNext.removeAttribute('disabled');
      gamesControlNext.classList.remove('_disabled');
      gameNext = gameIdx && gamesPlaceholder.querySelector('.dropdown-item[data-index="' + gameIdx + '"]');
      gameNext && gameNext.click();
    }
  });

  // Products list on change handler
  productsSelectionEl && productsSelectionEl.addEventListener('change', function () {
    const val = this.value;

    // Hide dropdown
    dropdownToggle.setAttribute('aria-expanded', 'false');
    gamesPlaceholder.classList.remove('_show');

    val && productsList.map((p) => {
      p.sku === val && (productCurrent = p);
    });

    if (!productCurrent) return;

    // Update FPS data
    gamesPlaceholder.querySelector('a._active').click();

    // Set controls state
    setControlsState(0);

    // Set benchmark data
    updateGraphs(productCurrent);
  });

  // Fetch data - initial state
  fetchData().then(data => {
    let productSkus = [];

    dataFetched = data;
    productCurrent = data?.products?.[0];
    productsList = data?.products || [];

    if (!productCurrent) return;

    // Set collection of games
    setGamesCollection(productCurrent?.["Games"])

    // Set benchmark data
    updateGraphs(productCurrent);

    // Set products list
    if (productsSelectionEl && productsList && productsList.length > 0) {
      productsList.map((p) => {
        !productSkus.includes(p?.sku) && productSkus.push(`<option value='${p?.sku}'">${p?.sku}</option>`)
      });
      productsSelectionEl.innerHTML = productSkus.join(',');
    }

  }).catch(error => {
    console.error(error.message);
  });
})();
