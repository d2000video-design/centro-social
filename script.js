const apiUrl = "https://sheetdb.io/api/v1/qhnwkr61uiplq";

async function carregarFeed() {
  const resposta = await fetch(apiUrl);
  const dados = await resposta.json();

  const feed = document.querySelector(".instagram-feed");
  feed.innerHTML = "";

  dados.forEach(item => {
    if (item.ativo && item.ativo.toLowerCase().trim() === "sim") {
      feed.innerHTML += `
        <a href="${item.link}" target="_blank" class="instagram-post">
          <img src="${item.foto1}" alt="${item.titulo}">
        </a>
      `;
    }
  });
}

carregarFeed();
const toggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".mobile-menu");

toggle.addEventListener("click", () => {
  menu.classList.toggle("active");
});
