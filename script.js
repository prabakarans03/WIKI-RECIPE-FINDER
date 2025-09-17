async function searchRecipe() {
  const query = document.getElementById("recipeInput").value.trim();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<p> Searching...</p>";

  if (!query) {
    resultsDiv.innerHTML = "<p> Please enter a recipe name.</p>";
    return;
  }

 
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&origin=*`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    resultsDiv.innerHTML = "";

    if (!data.search || data.search.length === 0) {
      resultsDiv.innerHTML = "<p> No recipes found.</p>";
      return;
    }

    data.search.forEach(item => {
      const div = document.createElement("div");
      div.className = "recipe";

      div.innerHTML = `<strong>${item.label}</strong><br>`;
      if (item.aliases && item.aliases.length > 0) {
        div.innerHTML += `<small><b>Also known as:</b> ${item.aliases.join(", ")}</small><br>`;
      }
      if (item.description) {
        div.innerHTML += `<em>${item.description}</em><br>`;
      }

      div.innerHTML += `<a href="details.html?id=${item.id}">
                          View Details
                        </a><br><br>
                        <a href="https://www.wikidata.org/wiki/${item.id}" target="_blank">🔗 View on Wikidata</a>`;

      resultsDiv.appendChild(div);
    });
  } catch (error) {
    resultsDiv.innerHTML = "<p> Error fetching data.</p>";
    console.error(error);
  }
}
