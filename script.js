const apiUrl = "https://sheetdb.io/api/v1/qhnwkr61uiplq";

/* SLIDESHOW DA HOMEPAGE */

let slides = [];
let currentSlide = 0;
let slideshowInterval = null;

const slideImg = document.querySelector(".slide-img");
const slideTitle = document.querySelector(".slide-title");
const slideDesc = document.querySelector(".slide-desc");
const slideLink = document.querySelector(".slide-link");

const prevBtn = document.querySelector(".slider-btn.prev");
const nextBtn = document.querySelector(".slider-btn.next");

async function carregarSlides() {
  if (!slideImg || !slideTitle || !slideDesc || !slideLink) {
    return;
  }

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("Não foi possível carregar os momentos.");
    }

    const data = await response.json();

    slides = data.filter(item =>
      item.ativo &&
      item.ativo.toLowerCase().trim() === "sim" &&
      item.foto1
    );

    if (slides.length > 0) {
      currentSlide = 0;
      mostrarSlide(currentSlide);

      if (slides.length > 1) {
        slideshowInterval = setInterval(nextSlide, 5000);
      }
    }
  } catch (error) {
    console.error("Erro ao carregar o slideshow:", error);
  }
}

function mostrarSlide(index) {
  if (!slides.length || !slideImg) {
    return;
  }

  const slide = slides[index];

  slideImg.src = slide.foto1;
  slideImg.alt = slide.titulo || "Momento da Fundação";

  slideTitle.textContent = slide.titulo || "";
  slideDesc.textContent = slide.descricao || "";

  slideLink.href =
    slide.link || "https://www.instagram.com/fcsnsp/";
}

function nextSlide() {
  if (!slides.length) {
    return;
  }

  currentSlide = (currentSlide + 1) % slides.length;
  mostrarSlide(currentSlide);
}

function prevSlide() {
  if (!slides.length) {
    return;
  }

  currentSlide =
    (currentSlide - 1 + slides.length) % slides.length;

  mostrarSlide(currentSlide);
}

if (nextBtn) {
  nextBtn.addEventListener("click", function(event) {
    event.preventDefault();
    nextSlide();
  });
}

if (prevBtn) {
  prevBtn.addEventListener("click", function(event) {
    event.preventDefault();
    prevSlide();
  });
}

carregarSlides();


/* MENU SANDUÍCHE */

const toggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".mobile-menu");

if (toggle && menu) {
  toggle.addEventListener("click", () => {
    menu.classList.toggle("active");
  });

  menu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      menu.classList.remove("active");
    });
  });
}


/* BOTÃO VOLTAR AO TOPO */

const backToTop = document.querySelector(".back-to-top");

if (backToTop) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      backToTop.classList.add("show");
    } else {
      backToTop.classList.remove("show");
    }
  });

  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}


/* GALERIA DAS PÁGINAS DE SERVIÇOS */

const galeria = document.querySelector(".galeria-grid");
const fotosGaleria = galeria
  ? Array.from(galeria.querySelectorAll("img"))
  : [];

let fotoAtual = 0;
let galeriaInterval = null;
let toqueInicialX = 0;

function galeriaEstaNoMobile() {
  return window.matchMedia("(max-width: 900px)").matches;
}

function mostrarFotoGaleria(index) {
  if (!galeria || !fotosGaleria.length) {
    return;
  }

  fotoAtual =
    (index + fotosGaleria.length) % fotosGaleria.length;

  if (galeriaEstaNoMobile()) {
    galeria.style.transform =
      `translateX(-${fotoAtual * 100}%)`;
  } else {
    fotoAtual = 0;
    galeria.style.transform = "none";
  }
}

function proximaFotoGaleria() {
  if (!galeriaEstaNoMobile() || fotosGaleria.length < 2) {
    return;
  }

  mostrarFotoGaleria(fotoAtual + 1);
}

function iniciarGaleriaAutomatica() {
  if (galeriaInterval) {
    clearInterval(galeriaInterval);
    galeriaInterval = null;
  }

  if (
    galeria &&
    galeriaEstaNoMobile() &&
    fotosGaleria.length > 1
  ) {
    galeriaInterval = setInterval(
      proximaFotoGaleria,
      3500
    );
  }
}

if (galeria && fotosGaleria.length) {
  mostrarFotoGaleria(0);
  iniciarGaleriaAutomatica();

  galeria.addEventListener(
    "touchstart",
    event => {
      toqueInicialX = event.touches[0].clientX;
    },
    { passive: true }
  );

  galeria.addEventListener(
    "touchend",
    event => {
      const toqueFinalX =
        event.changedTouches[0].clientX;

      const distancia = toqueInicialX - toqueFinalX;

      if (Math.abs(distancia) < 40) {
        return;
      }

      if (distancia > 0) {
        mostrarFotoGaleria(fotoAtual + 1);
      } else {
        mostrarFotoGaleria(fotoAtual - 1);
      }

      iniciarGaleriaAutomatica();
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    mostrarFotoGaleria(0);
    iniciarGaleriaAutomatica();
  });
}
