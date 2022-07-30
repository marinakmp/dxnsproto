(() => {
  const CLASS_ACTIVE = '_active';
  const SCOPE_3DMARK_NAME = '3dmark';
  const _doc = document;
  const gamesPlaceholder = _doc.getElementById('gamesCollection');
  const dropdownToggle = _doc.getElementById('gamesToggle');
  let dataFetched;
  // let productsList, productCurrent;
  let gamesCollection = [];
  let graphLevels = {'graph1': [], 'graph2': []};

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
      const timeSpyVal = +product?.['3DMark_Time_Spy_CPU_score'];
      const is3dMark = g.dataset['graphScope'] === SCOPE_3DMARK_NAME;
      const timeSpyEl = g.querySelector('[data-graph="timespy"]');
      const bar3dmarkNodes = g.querySelectorAll('[data-benchmark]');
      let range = [];
      let closest;

      if (!is3dMark) {
        g.querySelectorAll('.graph-bar-title').forEach(b => {
          b.innerText === product['PCMark_Category']
            ? b.parentElement.classList.add(CLASS_ACTIVE)
            : b.parentElement.classList.remove(CLASS_ACTIVE);
        });

      } else {
        timeSpyEl.innerHTML = timeSpyVal;

        bar3dmarkNodes.forEach(b => {
          range.push(+b.dataset['benchmark']) ;
        });

        closest = range.reduce(function(prev, curr) {
          return (Math.abs(curr - timeSpyVal) < Math.abs(prev - timeSpyVal) ? curr : prev);
        });

        bar3dmarkNodes.forEach(b => {
          closest === +b.dataset['benchmark']
           ? b.classList.add(CLASS_ACTIVE)
           : b.classList.remove(CLASS_ACTIVE);
        });
      }
    });
  }

  // Game FPS
  function animateFPS(counters) {
    const speed = 200;

    counters.forEach(counter => {
      const animate = () => {
        const value = +counter.getAttribute('data-count');
        const data = +counter.innerText;
        const time = value / speed;

        if (data < value) {
          counter.innerText = Math.ceil(data + time);
          setTimeout(animate, 1);
        } else {
          counter.innerText = value;
        }
      }

      animate();
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
  function setGamesCollection(item) {
    let options = '';
    let activeClass;

    if(!item && item.length === 0) return;

    gamesCollection = Object.keys(item);

    gamesCollection.map((game,idx) => {
      activeClass = idx === 0 && CLASS_ACTIVE;
      options += `<li><a class="dropdown-item ${activeClass}" href="#${game}" data-index="${idx}">${game}</a></li>`;
    });

    dropdownToggle.innerText = gamesCollection[0];
    gamesPlaceholder.innerHTML = options;

    // Set FPS
    setFPS(item[gamesCollection[0]])
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
    const curTarget = e.currentTarget;
    const nextSelected = e.target;
    const nodes = gamesPlaceholder.querySelectorAll('a.dropdown-item');

    for (let node of nodes) {
      node.classList.remove(CLASS_ACTIVE)
    }

    nextSelected.classList.add(CLASS_ACTIVE);

    dropdownToggle.innerText = nextSelected.innerText;
    dropdownToggle.setAttribute('aria-expanded', 'false');

    curTarget && curTarget.classList.remove('_show');
  });

  // Fetch data - initial state
  fetchData().then(data => {
    dataFetched = data || [];
    const firstItem = data.length > 0 && data[0];

    if (!firstItem) return;

    // Set collection of games
    setGamesCollection(firstItem?.["Games"])

    // Set PCMark10 category active & category text
    updateGraphs(firstItem);

    // Set 3DMark category active & category text, time spy

  }).catch(error => {
    error.message;
  });


})();
