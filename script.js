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

let monitoramentoAtivo = false;
let intervalo = null;
let rotacaoAtual = 850;
let acelerando = false;
let soltando = false;
let ultimoTempo = 0;

function atualizarRotacao() {
  rpm.textContent = rotacaoAtual;
  rpmDigital.textContent = rotacaoAtual;

  const angulo = -135 + (rotacaoAtual / 8000) * 270;
  ponteiro.style.transform = `rotate(${angulo}deg)`;

  turbo.textContent = Math.max(0, (rotacaoAtual - 2500) / 3500).toFixed(1);
}

function atualizarOutrosIndicadores() {
  temperatura.textContent = Math.floor(Math.random() * 5) + 85;
  oleo.textContent = Math.max(1.0, 4.5 - rotacaoAtual / 4000).toFixed(1);
}

function pararComandos() {
  acelerando = false;
  soltando = false;
}

function cicloMotor(tempo) {
  if (!monitoramentoAtivo) return;

  if (ultimoTempo === 0) ultimoTempo = tempo;

  const delta = Math.min((tempo - ultimoTempo) / 1000, 0.05);
  ultimoTempo = tempo;

  if (acelerando) {
    rotacaoAtual += 2500 * delta;
  } else if (soltando) {
    rotacaoAtual -= 2500 * delta;
  } else if (rotacaoAtual > 850) {
    rotacaoAtual = Math.max(850, rotacaoAtual - 1200 * delta);
  } else {
    rotacaoAtual = 850;
  }

  rotacaoAtual = Math.max(800, Math.min(8000, rotacaoAtual));
  rotacaoAtual = Math.round(rotacaoAtual);

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
