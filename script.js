const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT_rkfrxq2yU3-LoMW5ud-l6AXRkZfVnPABf0mesQWt6QFG2fzZ0VVU-ixBRTHtt4JsHf1RvSPPPWrn/pub?output=csv";

async function carregarFeed() {

  const resposta = await fetch(csvUrl);
  const texto = await resposta.text();

  const linhas = texto.split("\n").slice(1);

  const feed = document.querySelector(".instagram-feed");

  feed.innerHTML = "";

  linhas.forEach(linha => {

    const colunas = linha.split(",");

    const titulo = colunas[1];
    const imagem = colunas[3];
    const link = colunas[4];
    const ativo = colunas[6];

    if (ativo && ativo.trim() === "sim") {

      const card = `
        <a href="${link}" target="_blank" class="instagram-post">

          <img src="${imagem}" alt="${titulo}">

        </a>
      `;

      feed.innerHTML += card;

    }

  });

}

carregarFeed();
