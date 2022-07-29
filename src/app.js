(() => {
  const _doc = document;
  const gamesPlaceholder = _doc.getElementById('gamesCollection');
  const gamesToggle = _doc.getElementById('gamesToggle');
  let dataFetched;
  // let productsList, productCurrent;
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

  // Games collection
  function setGamesCollection(item) {
    gamesCollection = Object.keys(item);
    let options = '';

    gamesCollection.map((game,idx) => {
      options += `<div data-index="${idx}" class="dropdown-item">${game}</div>`;
    });

    gamesToggle.innerText = gamesCollection[0];
    gamesPlaceholder.innerHTML = options;
  }

  // Fetch data - initial state
  fetchData().then(data => {
    dataFetched = data || [];

    // Set collection of games
    data.length > 0 && setGamesCollection(data[0]?.["Games"])

    // Set FPS

    // Set PCMark10 category active & category text

    // Set 3DMark category active & category text, time spy

  }).catch(error => {
    error.message;
  });


})();
