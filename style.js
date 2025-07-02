// SPA Navigation Script
// =======================
// Controla a navegação entre seções com botões e links do menu hamburguer

document.addEventListener("DOMContentLoaded", function () {
  // Seleciona todos os botões de navegação (desktop e mobile)
  const buttons = document.querySelectorAll("nav button");
  const pages = document.querySelectorAll(".page");

  // Função que exibe a página solicitada e esconde as demais
  function showPage(pageId) {
    pages.forEach((section) => {
      section.classList.remove("active");
      if (section.id === pageId) {
        section.classList.add("active");
      }
    });
  }

  // Evento de clique para os botões (desktop + menu hamburguer)
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-page");
      showPage(target);
      history.pushState(null, "", `#${target}`);
    });
  });

  // Verifica se existe hash na URL ao carregar a página
  const hash = window.location.hash.replace("#", "") || "home";
  showPage(hash);

  // Caso ainda existam <a> tags no menu hamburguer (opcional)
  const hamburgerLinks = document.querySelectorAll(".navigation a");
  const hamburgerCheckbox = document.getElementById("toggleCheck");

  hamburgerLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").replace("#", "");
      showPage(targetId);
      history.pushState(null, "", `#${targetId}`);
      hamburgerCheckbox.checked = false; // Fecha o menu
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
