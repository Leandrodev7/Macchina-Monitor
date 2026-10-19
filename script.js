const botaoLigar = document.getElementById("botaoLigar");
const botaoAcelerar = document.getElementById("botaoAcelerar");
const botaoSoltar = document.getElementById("botaoSoltar");
const statusSistema = document.getElementById("status");

const rpm = document.getElementById("rpm");
const rpmDigital = document.getElementById("rpmDigital");
const ponteiro = document.getElementById("ponteiro");
const turbo = document.getElementById("turbo");
const temperatura = document.getElementById("temperatura");
const oleo = document.getElementById("oleo");
const shiftLight = document.getElementById("shiftLight");
const marcacoes = document.getElementById("marcacoes");

const RPM_MINIMO = 850;
const RPM_MAXIMO = 10000;
const RPM_TROCA = 8000;
function criarEscala() {
  marcacoes.innerHTML = "";

  for (let i = 0; i <= 10; i++) {
    const numero = document.createElement("span");
    numero.className = "marcacao";
    numero.textContent = i;

    const angulo = -135 + (i / 10) * 270;
    const raio = 37;
    const radianos = (angulo * Math.PI) / 180;

    const x = 50 + raio * Math.sin(radianos);
    const y = 50 - raio * Math.cos(radianos);

    numero.style.left = `${x}%`;
    numero.style.top = `${y}%`;
    numero.style.transform = "translate(-50%, -50%)";

    marcacoes.appendChild(numero);
  }

  for (let i = 0; i <= 50; i++) {
    const traco = document.createElement("span");
    const principal = i % 5 === 0;

    traco.className = principal ? "traco traco-principal" : "traco";

    const angulo = -135 + (i / 50) * 270;
    const radianos = (angulo * Math.PI) / 180;
    const raio = 44;

    const x = 50 + raio * Math.sin(radianos);
    const y = 50 - raio * Math.cos(radianos);

    traco.style.left = `${x}%`;
    traco.style.top = `${y}%`;
    traco.style.transform = `translate(-50%, -50%) rotate(${angulo}deg)`;

    marcacoes.appendChild(traco);
  }
}

let monitoramentoAtivo = false;
let intervalo = null;
let rotacaoAtual = RPM_MINIMO;
let acelerando = false;
let soltando = false;
let ultimoTempo = 0;
criarEscala();
function atualizarRotacao() {
  const rotacaoExibida = Math.round(rotacaoAtual);

  rpm.textContent = rotacaoExibida;
  rpmDigital.textContent = rotacaoExibida;

  // A escala vai de -135 graus, em 0 RPM, até +135 graus, em 10.000 RPM.
  const proporcao = rotacaoAtual / RPM_MAXIMO;
  const angulo = -135 + proporcao * 270;

  ponteiro.style.transform = `translate(-50%, -100%) rotate(${angulo}deg)`;

  turbo.textContent = Math.max(0, (rotacaoAtual - 2500) / 3500).toFixed(1);

  // Acende o alerta quando a rotação chega a 8.000 RPM.
  shiftLight.classList.toggle("ativo", rotacaoAtual >= RPM_TROCA);
}

function atualizarOutrosIndicadores() {
  if (!monitoramentoAtivo) return;

  temperatura.textContent = Math.floor(Math.random() * 5) + 85;

  const pressaoOleo = Math.max(1.0, 4.5 - rotacaoAtual / 4000);

  oleo.textContent = pressaoOleo.toFixed(1);
}

function pararComandos() {
  acelerando = false;
  soltando = false;
}

function cicloMotor(tempo) {
  if (!monitoramentoAtivo) return;

  if (ultimoTempo === 0) {
    ultimoTempo = tempo;
  }

  const delta = Math.min((tempo - ultimoTempo) / 1000, 0.05);
  ultimoTempo = tempo;

  if (acelerando) {
    rotacaoAtual += 2500 * delta;
  } else if (soltando) {
    rotacaoAtual -= 2500 * delta;
  } else if (rotacaoAtual > RPM_MINIMO) {
    rotacaoAtual = Math.max(RPM_MINIMO, rotacaoAtual - 1200 * delta);
  } else {
    rotacaoAtual = RPM_MINIMO;
  }

  rotacaoAtual = Math.max(RPM_MINIMO, Math.min(RPM_MAXIMO, rotacaoAtual));

  atualizarRotacao();

  requestAnimationFrame(cicloMotor);
}

botaoLigar.addEventListener("click", function () {
  if (!monitoramentoAtivo) {
    monitoramentoAtivo = true;
    ultimoTempo = 0;

    statusSistema.textContent = "Monitoramento ativo. Dados simulados.";
    botaoLigar.textContent = "Desligar monitoramento";

    atualizarRotacao();
    atualizarOutrosIndicadores();

    intervalo = setInterval(atualizarOutrosIndicadores, 2000);

    requestAnimationFrame(cicloMotor);
  } else {
    monitoramentoAtivo = false;
    pararComandos();

    clearInterval(intervalo);
    intervalo = null;
    ultimoTempo = 0;

    statusSistema.textContent = "Sistema desligado";
    botaoLigar.textContent = "Ligar monitoramento";

    atualizarRotacao();
  }
});

botaoAcelerar.addEventListener("pointerdown", function (evento) {
  evento.preventDefault();

  if (!monitoramentoAtivo) {
    statusSistema.textContent = "Ligue o monitoramento primeiro.";
    return;
  }

  acelerando = true;
  soltando = false;
});

botaoSoltar.addEventListener("pointerdown", function (evento) {
  evento.preventDefault();

  if (!monitoramentoAtivo) {
    statusSistema.textContent = "Ligue o monitoramento primeiro.";
    return;
  }

  soltando = true;
  acelerando = false;
});

function liberarBotoes() {
  pararComandos();
}

document.addEventListener("pointerup", liberarBotoes);
document.addEventListener("pointercancel", liberarBotoes);
window.addEventListener("blur", liberarBotoes);

atualizarRotacao();
