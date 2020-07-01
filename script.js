function Sobre() {
  document.getElementById('sobre').style.zIndex = 1;
  document.getElementById('sobre-nav').style.color = "#23446c";
  document.getElementById('termos').style.zIndex = -1;
  document.getElementById('termos-nav').style.color = "#b2c9c9";
  document.getElementById('contato').style.zIndex = -1;
  document.getElementById('contato-nav').style.color = "#b2c9c9";
}
function Termos() {
  document.getElementById('sobre').style.zIndex = -1;
  document.getElementById('sobre-nav').style.color = "#b2c9c9";
  document.getElementById('termos').style.zIndex = 1;
  document.getElementById('termos-nav').style.color = "#23446c";
  document.getElementById('contato').style.zIndex = -1;
  document.getElementById('contato-nav').style.color = "#b2c9c9";
}
function Contato() {
  document.getElementById('sobre').style.zIndex = -1;
  document.getElementById('sobre-nav').style.color = "#b2c9c9";
  document.getElementById('termos').style.zIndex = -1;
  document.getElementById('termos-nav').style.color = "#b2c9c9";
  document.getElementById('contato').style.zIndex = 1;
  document.getElementById('contato-nav').style.color = "#23446c";
  
}
