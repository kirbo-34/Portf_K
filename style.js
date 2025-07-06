// SPA Navigation Script
// =======================
// Controla a navegação entre seções com botões e links do menu hamburguer

document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll("button[data-page]");
  const pages = document.querySelectorAll(".page");
  const loader = document.getElementById("page-loader");

function showPage(pageId) {
  const loader = document.getElementById("page-loader");

  // Etapa 1: Fade-in do loader
  loader.style.display = "flex";
  setTimeout(() => {
    loader.classList.add("visible");
  }, 10); // atraso mínimo para forçar o transition

  // Etapa 2: Aguarda o loader aparecer + animação (800ms)
  setTimeout(() => {
    // Troca a página
    document.querySelectorAll(".page").forEach((section) => {
      section.classList.remove("active");
      if (section.id === pageId) {
        section.classList.add("active");
      }
    });

    // Etapa 3: Fade-out
    loader.classList.remove("visible");
    loader.classList.add("fade-out");

    // Etapa 4: Oculta completamente após o fade-out (400ms)
    setTimeout(() => {
      loader.classList.remove("fade-out");
      loader.style.display = "none";
    }, 400);

  }, 800); // tempo da animação de bolinhas
}

  // Clique nos botões (desktop/mobile)
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-page");
      showPage(target);
      history.pushState(null, "", `#${target}`);
    });
  });

  // Hash da URL ao carregar a página
  const hash = window.location.hash.replace("#", "") || "home";
  showPage(hash);

  // Links do menu hamburguer
  const hamburgerLinks = document.querySelectorAll(".navigation a, .navigation button");
  const hamburgerCheckbox = document.getElementById("toggleCheck");

  hamburgerLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("data-page") || link.getAttribute("href").replace("#", "");
      showPage(targetId);
      history.pushState(null, "", `#${targetId}`);
      if (hamburgerCheckbox) hamburgerCheckbox.checked = false;
    });
  });
});



/*
const botao = document.getElementById('btn');
const tt_cll = document.getElementById('tst_cll')
const Corpo =document.getElementById('corpo')

botao.addEventListener('click', () => {
  console.log("clicado")
  tt_cll.classList.toggle('ativo')
}) 

Corpo.addEventListener('click', () => {
  console.log("clicado")
  tt_cll.classList.toggle('ativo')
}) 
*/
