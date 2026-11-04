const $ = (id) => document.getElementById(id);

const formatarPreco = (valor) =>
  valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

function mostrarToast(mensagem) {
  const toast = $("toast");

  toast.textContent = mensagem;
  toast.classList.add("show");

  clearTimeout(mostrarToast.timer);

  mostrarToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

// MODO CLARO E ESCURO

const chaveTema = "mercadolivro-tema";

function aplicarTema(escuro) {
  document.documentElement.dataset.tema = escuro ? "escuro" : "claro";

  $("modoEscuro").setAttribute("aria-pressed", String(escuro));

  $("modoEscuro").setAttribute(
    "aria-label",
    escuro ? "Ativar modo claro" : "Ativar modo escuro"
  );

  $("iconeTema").textContent = escuro ? "☀" : "☾";

  document.querySelector('meta[name="theme-color"]').content =
    escuro ? "#101216" : "#f7f8fa";
}

let temaInicial = false;

try {
  temaInicial = localStorage.getItem(chaveTema) === "escuro";
} catch (erro) {}

aplicarTema(temaInicial);

$("modoEscuro").addEventListener("click", () => {
  const escuro = document.documentElement.dataset.tema !== "escuro";

  aplicarTema(escuro);

  try {
    localStorage.setItem(chaveTema, escuro ? "escuro" : "claro");
  } catch (erro) {
    mostrarToast("O tema mudou, mas não foi possível salvar a preferência.");
  }
});

// PERSONALIZAÇÃO COM NOME

function personalizarBoasVindas() {
  const nome = $("nomeUsuario").value.trim();

  if (!nome) {
    document.querySelector(".hero h1").innerHTML =
      'Ideias melhores começam com <em>boas leituras.</em>';

    $("mensagemBoasVindas").textContent =
      "Sua experiência começa por aqui.";

    return;
  }

  document.querySelector(".hero h1").textContent =
    `Olá, ${nome}. Sua próxima ideia começa aqui.`;

  $("mensagemBoasVindas").textContent =
    `Bem-vindo(a) ao MercadoLivro, ${nome}!`;

  mostrarToast(`Página personalizada para ${nome}.`);
}

$("atualizarTitulo").addEventListener("click", personalizarBoasVindas);

$("nomeUsuario").addEventListener("keydown", (evento) => {
  if (evento.key === "Enter") {
    personalizarBoasVindas();
  }
});

// PESQUISA DOS LIVROS

function filtrarLivros(termo) {
  const busca = termo.trim().toLocaleLowerCase("pt-BR");

  const cards = [...document.querySelectorAll(".product-card")];

  let encontrados = 0;

  cards.forEach((card) => {
    const texto = (
      card.textContent + " " + card.dataset.categorias
    ).toLocaleLowerCase("pt-BR");

    const corresponde = !busca || texto.includes(busca);

    card.hidden = !corresponde;

    if (corresponde) {
      encontrados++;
    }
  });

  $("infoBusca").textContent =
    `${encontrados} ${encontrados === 1 ? "livro" : "livros"}`;

  $("semResultado").hidden = encontrados !== 0;
}

$("pesquisa").addEventListener("input", (evento) => {
  filtrarLivros(evento.target.value);
});

// FILTRO POR CATEGORIA

document.querySelectorAll(".category-tile").forEach((botao) => {
  botao.addEventListener("click", () => {
    const categoria = botao.dataset.categoria;

    $("pesquisa").value = categoria;

    filtrarLivros(categoria);

    $("livros").scrollIntoView({
      behavior: "smooth"
    });
  });
});

// MAIS VENDIDOS

const maisVendidos = [
  "Código Limpo",
  "Python Crash Course",
  "O Programador Pragmático"
];

function renderizarMaisVendidos() {
  const lista = $("listaMaisVendidos");

  lista.replaceChildren();

  maisVendidos.forEach((nome) => {
    const item = document.createElement("li");

    item.textContent = nome;

    lista.appendChild(item);
  });
}

$("atualizarMaisVendido").addEventListener("click", () => {
  const nome = $("nomeMaisVendido").value.trim();

  const posicao = Number($("posicaoMaisVendido").value);

  const aviso = $("avisoMaisVendido");

  if (
    !nome ||
    !Number.isInteger(posicao) ||
    posicao < 1 ||
    posicao > 3
  ) {
    aviso.textContent =
      "Digite o nome do livro e uma posição entre 1 e 3.";

    aviso.className = "feedback error";

    return;
  }

  maisVendidos[posicao - 1] = nome;

  renderizarMaisVendidos();

  aviso.textContent = `A posição ${posicao} foi atualizada.`;

  aviso.className = "feedback";

  $("nomeMaisVendido").value = "";
  $("posicaoMaisVendido").value = "";
});

// CALENDÁRIO DE LANÇAMENTOS

const lancamentos = [
  "Janeiro — novidades em programação.",
  "Fevereiro — livros de tecnologia.",
  "Março — inteligência artificial.",
  "Abril — desenvolvimento web."
];

$("consultarLancamento").addEventListener("click", () => {
  const numero = Number($("numeroLancamento").value);

  const resultado = $("resultadoLancamento");

  if (
    !Number.isInteger(numero) ||
    numero < 1 ||
    numero > lancamentos.length
  ) {
    resultado.textContent = "Digite um número de 1 a 4.";

    resultado.className = "feedback error";

    return;
  }

  resultado.textContent = lancamentos[numero - 1];

  resultado.className = "feedback";
});

// CARRINHO DE COMPRAS

const carrinho = [];

function atualizarCarrinho() {
  const lista = $("listaCarrinho");

  lista.replaceChildren();

  if (carrinho.length === 0) {
    const vazio = document.createElement("li");

    vazio.className = "cart-empty";

    vazio.textContent =
      "Seu carrinho está vazio. Adicione um livro para começar.";

    lista.appendChild(vazio);
  }

  let quantidadeTotal = 0;
  let valorTotal = 0;

  carrinho.forEach((livro, indice) => {
    quantidadeTotal += livro.quantidade;

    valorTotal += livro.preco * livro.quantidade;

    const item = document.createElement("li");

    const nome = document.createElement("span");

    nome.className = "cart-item-name";
    nome.textContent = livro.nome;

    const preco = document.createElement("span");

    preco.className = "cart-item-price";

    preco.textContent = formatarPreco(
      livro.preco * livro.quantidade
    );

    const controles = document.createElement("div");

    controles.className = "quantity-controls";

    // DIMINUIR QUANTIDADE

    const menos = document.createElement("button");

    menos.type = "button";
    menos.textContent = "−";

    menos.setAttribute(
      "aria-label",
      `Diminuir quantidade de ${livro.nome}`
    );

    menos.addEventListener("click", () => {
      livro.quantidade--;

      if (livro.quantidade <= 0) {
        carrinho.splice(indice, 1);
      }

      atualizarCarrinho();
    });

    // QUANTIDADE

    const quantidade = document.createElement("span");

    quantidade.textContent = livro.quantidade;

    // AUMENTAR QUANTIDADE

    const mais = document.createElement("button");

    mais.type = "button";
    mais.textContent = "+";

    mais.setAttribute(
      "aria-label",
      `Aumentar quantidade de ${livro.nome}`
    );

    mais.addEventListener("click", () => {
      livro.quantidade++;

      atualizarCarrinho();
    });

    // REMOVER LIVRO

    const remover = document.createElement("button");

    remover.type = "button";
    remover.textContent = "×";
    remover.className = "remove";

    remover.setAttribute(
      "aria-label",
      `Remover ${livro.nome}`
    );

    remover.addEventListener("click", () => {
      carrinho.splice(indice, 1);

      atualizarCarrinho();
    });

    controles.append(
      menos,
      quantidade,
      mais,
      remover
    );

    item.append(
      nome,
      preco,
      controles
    );

    lista.appendChild(item);
  });

  $("quantidade").textContent = quantidadeTotal;

  $("quantidadeCarrinho").textContent = quantidadeTotal;

  $("total").textContent = formatarPreco(valorTotal);
}

// ADICIONAR LIVROS

document.querySelectorAll(".add-button").forEach((botao) => {
  botao.addEventListener("click", () => {
    const nome = botao.dataset.nome;

    const preco = Number(botao.dataset.preco);

    const existente = carrinho.find(
      (livro) => livro.nome === nome
    );

    if (existente) {
      existente.quantidade++;
    } else {
      carrinho.push({
        nome,
        preco,
        quantidade: 1
      });
    }

    atualizarCarrinho();

    mostrarToast(`${nome} adicionado ao carrinho.`);
  });
});

// ESVAZIAR CARRINHO

$("esvaziar").addEventListener("click", () => {
  if (carrinho.length === 0) {
    mostrarToast("O carrinho já está vazio.");

    return;
  }

  carrinho.length = 0;

  atualizarCarrinho();

  mostrarToast("Carrinho esvaziado.");
});

// PRÉVIA DO LIVRO

$("gerarPrevia").addEventListener("click", () => {
  const area = $("areaPrevia");

  if (area.childElementCount) {
    mostrarToast("A prévia já está aberta.");

    return;
  }

  const imagem = document.createElement("img");

  imagem.src =
    "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg";

  imagem.alt = "Capa do livro Código Limpo";

  const texto = document.createElement("p");

  texto.textContent =
    "Código Limpo — uma leitura sobre qualidade e manutenção de software.";

  imagem.addEventListener("error", () => {
    imagem.remove();

    texto.textContent =
      "A capa da prévia não carregou. Confira sua conexão com a internet.";
  });

  area.append(imagem, texto);
});

// AVISO PARA CAPAS QUE NÃO CARREGAREM

document.querySelectorAll(".cover img").forEach((imagem) => {
  imagem.addEventListener("error", () => {
    const capa = imagem.closest(".cover");

    imagem.remove();

    const aviso = document.createElement("span");

    aviso.className = "cover-fallback";

    aviso.textContent = imagem.alt;

    capa.appendChild(aviso);
  });
});

// ANO AUTOMÁTICO NO RODAPÉ

$("ano").textContent = new Date().getFullYear();

// INICIALIZAÇÃO

renderizarMaisVendidos();

atualizarCarrinho();
