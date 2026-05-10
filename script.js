const apiUrl = "https://sheetdb.io/api/v1/qhnwkr61uiplq";

let slides = [];
let currentSlide = 0;

const slideImg = document.querySelector(".slide-img");
const slideTitle = document.querySelector(".slide-title");
const slideDesc = document.querySelector(".slide-desc");
const slideLink = document.querySelector(".slide-link");

const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

async function carregarSlides() {

  const response = await fetch(apiUrl);
  const data = await response.json();

  slides = data.filter(item =>
    item.ativo &&
    item.ativo.toLowerCase().trim() === "sim"
  );

  if(slides.length > 0){
    mostrarSlide(currentSlide);
  }

}

function mostrarSlide(index){

  const slide = slides[index];

  slideImg.src = slide.foto1;
  slideImg.alt = slide.titulo;

  slideTitle.textContent = slide.titulo;
  slideDesc.textContent = slide.descricao;

  slideLink.href = slide.link;
}

function nextSlide(){

  currentSlide++;

  if(currentSlide >= slides.length){
    currentSlide = 0;
  }

  mostrarSlide(currentSlide);
}

function prevSlide(){

  currentSlide--;

  if(currentSlide < 0){
    currentSlide = slides.length - 1;
  }

  mostrarSlide(currentSlide);
}

nextBtn.addEventListener("click", function(event){

  event.preventDefault();
  nextSlide();

});

prevBtn.addEventListener("click", function(event){

  event.preventDefault();
  prevSlide();

});

setInterval(nextSlide, 5000);

carregarSlides();

const toggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".mobile-menu");

toggle.addEventListener("click", () => {
  menu.classList.toggle("active");
});

const backToTop = document.querySelector(".back-to-top");

window.addEventListener("scroll", () => {

  if(window.scrollY > 400){
    backToTop.classList.add("show");
  }else{
    backToTop.classList.remove("show");
  }

});

backToTop.addEventListener("click", () => {

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

});
