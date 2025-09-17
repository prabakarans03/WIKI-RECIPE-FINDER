async function loadRecipeDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  const sparqlQuery = `
    SELECT ?item ?itemLabel ?description ?image ?alias
           ?countryLabel ?cuisineLabel ?cultureLabel 
           ?instanceOfLabel ?subclassOfLabel
           ?ingredientLabel ?subjectLabel
           ?mediaLabel ?commonsCat ?wikipedia ?wikibooks ?wikinews
           ?wikiquote ?wikisource ?wikiversity ?wikivoyage ?wiktionary
    WHERE {
      BIND(wd:${id} AS ?item)
      OPTIONAL { ?item schema:description ?description FILTER(LANG(?description)="en") }
      OPTIONAL { ?item skos:altLabel ?alias FILTER(LANG(?alias)="en") }
      OPTIONAL { ?item wdt:P18 ?image }
      OPTIONAL { ?item wdt:P495 ?country }
      OPTIONAL { ?item wdt:P2012 ?cuisine }
      OPTIONAL { ?item wdt:P2596 ?culture }
      OPTIONAL { ?item wdt:P31 ?instanceOf }
      OPTIONAL { ?item wdt:P279 ?subclassOf }
      OPTIONAL { ?item wdt:P527 ?ingredient }
      OPTIONAL { ?item wdt:P921 ?subject }
      OPTIONAL { ?item wdt:P1659 ?media }
      OPTIONAL { ?item wdt:P373 ?commonsCat }
      OPTIONAL { ?wikipedia schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/>. }
      OPTIONAL { ?wikibooks schema:about ?item ; schema:isPartOf <https://en.wikibooks.org/>. }
      OPTIONAL { ?wikinews schema:about ?item ; schema:isPartOf <https://en.wikinews.org/>. }
      OPTIONAL { ?wikiquote schema:about ?item ; schema:isPartOf <https://en.wikiquote.org/>. }
      OPTIONAL { ?wikisource schema:about ?item ; schema:isPartOf <https://en.wikisource.org/>. }
      OPTIONAL { ?wikiversity schema:about ?item ; schema:isPartOf <https://en.wikiversity.org/>. }
      OPTIONAL { ?wikivoyage schema:about ?item ; schema:isPartOf <https://en.wikivoyage.org/>. }
      OPTIONAL { ?wiktionary schema:about ?item ; schema:isPartOf <https://en.wiktionary.org/>. }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
  `;
  
  const url = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(sparqlQuery);

  try {
    const response = await fetch(url, { headers: { "Accept": "application/sparql-results+json" } });
    const data = await response.json();
    const bindings = data.results.bindings;

    if (!bindings.length) {
      document.getElementById("detailsTable").innerHTML = "<tr><td>No details found</td></tr>";
      return;
    }

    const recipe = {
      name: bindings[0].itemLabel?.value || "empty",
      description: bindings[0].description?.value || "empty",
      image: bindings[0].image?.value || null,
      aliases: [...new Set(bindings.map(b => b.alias?.value).filter(Boolean))],
      country: [...new Set(bindings.map(b => b.countryLabel?.value).filter(Boolean))],
      cuisine: [...new Set(bindings.map(b => b.cuisineLabel?.value).filter(Boolean))],
      culture: [...new Set(bindings.map(b => b.cultureLabel?.value).filter(Boolean))],
      instanceOf: [...new Set(bindings.map(b => b.instanceOfLabel?.value).filter(Boolean))],
      subclassOf: [...new Set(bindings.map(b => b.subclassOfLabel?.value).filter(Boolean))],
      ingredients: [...new Set(bindings.map(b => b.ingredientLabel?.value).filter(Boolean))],
      subjects: [...new Set(bindings.map(b => b.subjectLabel?.value).filter(Boolean))],
      media: [...new Set(bindings.map(b => b.mediaLabel?.value).filter(Boolean))],
      commonsCat: bindings[0].commonsCat?.value || "empty",
      links: {
        wikipedia: bindings[0].wikipedia?.value || "empty",
        wikibooks: bindings[0].wikibooks?.value || "empty",
        wikinews: bindings[0].wikinews?.value || "empty",
        wikiquote: bindings[0].wikiquote?.value || "empty",
        wikisource: bindings[0].wikisource?.value || "empty",
        wikiversity: bindings[0].wikiversity?.value || "empty",
        wikivoyage: bindings[0].wikivoyage?.value || "empty",
        wiktionary: bindings[0].wiktionary?.value || "empty",
      }
    };

    // Title + Image
    document.getElementById("recipeTitle").innerText = recipe.name;
    if (recipe.image) {
      document.getElementById("recipeImage").innerHTML = `<img src="${recipe.image}" alt="${recipe.name}">`;
    }

    // Build table
    const rows = [
      ["Description", recipe.description],
      ["Aliases", recipe.aliases.length ? recipe.aliases.join(", ") : "empty"],
      ["Country of origin", recipe.country.length ? recipe.country.join(", ") : "empty"],
      ["Cuisine", recipe.cuisine.length ? recipe.cuisine.join(", ") : "empty"],
      ["Cultural background", recipe.culture.length ? recipe.culture.join(", ") : "empty"],
      ["Instance of", recipe.instanceOf.length ? recipe.instanceOf.join(", ") : "empty"],
      ["Subclass of", recipe.subclassOf.length ? recipe.subclassOf.join(", ") : "empty"],
      ["Main ingredients", recipe.ingredients.length ? recipe.ingredients.join(", ") : "empty"],
      ["Main subjects", recipe.subjects.length ? recipe.subjects.join(", ") : "empty"],
      ["Related media", recipe.media.length ? recipe.media.join(", ") : "empty"],
      ["Commons category", recipe.commonsCat !== "empty" ? `<a href="https://commons.wikimedia.org/wiki/Category:${recipe.commonsCat}" target="_blank">${recipe.commonsCat}</a>` : "empty"],
      ["Wikidata page", `<a href="https://www.wikidata.org/wiki/${id}" target="_blank">🔗 View on Wikidata</a>`],
      ["Wikipedia", recipe.links.wikipedia !== "empty" ? `<a href="${recipe.links.wikipedia}" target="_blank">Wikipedia</a>` : "empty"],
      ["Wikibooks", recipe.links.wikibooks !== "empty" ? `<a href="${recipe.links.wikibooks}" target="_blank">Wikibooks</a>` : "empty"],
      ["Wikinews", recipe.links.wikinews !== "empty" ? `<a href="${recipe.links.wikinews}" target="_blank">Wikinews</a>` : "empty"],
      ["Wikiquote", recipe.links.wikiquote !== "empty" ? `<a href="${recipe.links.wikiquote}" target="_blank">Wikiquote</a>` : "empty"],
      ["Wikisource", recipe.links.wikisource !== "empty" ? `<a href="${recipe.links.wikisource}" target="_blank">Wikisource</a>` : "empty"],
      ["Wikiversity", recipe.links.wikiversity !== "empty" ? `<a href="${recipe.links.wikiversity}" target="_blank">Wikiversity</a>` : "empty"],
      ["Wikivoyage", recipe.links.wikivoyage !== "empty" ? `<a href="${recipe.links.wikivoyage}" target="_blank">Wikivoyage</a>` : "empty"],
      ["Wiktionary", recipe.links.wiktionary !== "empty" ? `<a href="${recipe.links.wiktionary}" target="_blank">Wiktionary</a>` : "empty"],
    ];

    document.getElementById("detailsTable").innerHTML = rows
      .map(r => `<tr><th>${r[0]}</th><td>${r[1]}</td></tr>`)
      .join("");

  } catch (err) {
    console.error(err);
    document.getElementById("detailsTable").innerHTML = "<tr><td>Error loading details</td></tr>";
  }
}

loadRecipeDetails();
