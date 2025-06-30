document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll("nav button");
  const pages = document.querySelectorAll(".page");

  function showPage(pageId) {
    pages.forEach((section) => {
      section.classList.remove("active");
      if (section.id === pageId) {
        section.classList.add("active");
      }
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-page");
      showPage(target);
      history.pushState(null, "", `#${target}`);
    });
  });

  const hash = window.location.hash.replace("#", "") || "home";
  showPage(hash);

  // NOVO: SPA funcionando com os links do hamburguer também
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

// animação de franks kafka
const elementos = document.querySelectorAll('.um');

elementos.forEach(el => {
  const letras = el.textContent.split('');
  el.innerHTML = letras.map((letra, i) =>
    `<span style="display:inline-block; animation: balanco 1s ease-in-out infinite; animation-delay: ${i * 0.1}s">${letra}</span>`
  ).join('');
});
