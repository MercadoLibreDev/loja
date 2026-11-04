const $ = (id) => document.getElementById(id);

const formatarPreco = (valor) =>
  Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

function salvar(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch (erro) {
    return false;
  }
}

function carregar(chave, valorPadrao) {
  try {
    const salvo = localStorage.getItem(chave);
    return salvo ? JSON.parse(salvo) : valorPadrao;
  } catch (erro) {
    return valorPadrao;
  }
}

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

  $("iconeTema").textContent = escuro ? "☀️" : "🌑";

  document.querySelector('meta[name="theme-color"]').content =
    escuro ? "#101216" : "#f7f8fa";
}

aplicarTema(carregar(chaveTema, "claro") === "escuro");

$("modoEscuro").addEventListener("click", () => {
  const escuro = document.documentElement.dataset.tema !== "escuro";

  aplicarTema(escuro);
  salvar(chaveTema, escuro ? "escuro" : "claro");
});

// ATALHO PARA A PESQUISA

document.addEventListener("keydown", (evento) => {
  if (
    (evento.ctrlKey || evento.metaKey) &&
    evento.key.toLowerCase() === "k"
  ) {
    evento.preventDefault();
    $("pesquisa").focus();
  }

  if (evento.key === "Escape" && document.activeElement === $("pesquisa")) {
    $("pesquisa").value = "";
    filtrarLivros("");
    botoesCategoria.forEach((b) => b.classList.remove("active"));
    $("pesquisa").blur();
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

    salvar("mercadolivro-nome", "");
    return;
  }

  document.querySelector(".hero h1").textContent =
    `Olá, ${nome}. Sua próxima ideia começa aqui.`;

  $("mensagemBoasVindas").textContent =
    `Bem-vindo(a) ao MercadoLivro, ${nome}!`;

  salvar("mercadolivro-nome", nome);
  mostrarToast(`Página personalizada para ${nome}.`);
}

const nomeSalvo = carregar("mercadolivro-nome", "");

if (nomeSalvo) {
  $("nomeUsuario").value = nomeSalvo;
  personalizarBoasVindas();
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

// FILTRO POR CATEGORIA

const botoesCategoria = document.querySelectorAll(".category-tile");

botoesCategoria.forEach((botao) => {
  botao.addEventListener("click", () => {
    const categoria = botao.dataset.categoria;

    botoesCategoria.forEach((b) => b.classList.remove("active"));
    botao.classList.add("active");

    $("pesquisa").value = categoria;
    filtrarLivros(categoria);

    $("livros").scrollIntoView({
      behavior: "smooth"
    });
  });
});

$("pesquisa").addEventListener("input", (evento) => {
  if (evento.target.value.trim() === "") {
    botoesCategoria.forEach((b) => b.classList.remove("active"));
  }
  filtrarLivros(evento.target.value);
});

// MAIS VENDIDOS

const listaPadrao = [
  "Código Limpo",
  "Python Crash Course",
  "O Programador Pragmático"
];

let maisVendidos = carregar(
  "mercadolivro-mais-vendidos",
  listaPadrao
);

if (!Array.isArray(maisVendidos) || maisVendidos.length !== 3) {
  maisVendidos = [...listaPadrao];
}

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

  salvar("mercadolivro-mais-vendidos", maisVendidos);
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

let carrinho = carregar("mercadolivro-carrinho", []);

if (!Array.isArray(carrinho)) {
  carrinho = [];
}

carrinho = carrinho.filter((livro) =>
  livro &&
  typeof livro.nome === "string" &&
  Number.isFinite(Number(livro.preco)) &&
  Number.isInteger(Number(livro.quantidade)) &&
  Number(livro.quantidade) > 0
).map((livro) => ({
  nome: livro.nome,
  preco: Number(livro.preco),
  quantidade: Number(livro.quantidade)
}));

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
  $("avisoCarrinho").textContent = "";

  salvar("mercadolivro-carrinho", carrinho);
}

// ADICIONAR LIVROS

document.querySelectorAll(".add-button").forEach((botao) => {
  botao.addEventListener("click", () => {
    const nome = botao.dataset.nome;
    const preco = Number(botao.dataset.preco);

    if (!nome || !Number.isFinite(preco) || preco < 0) {
      mostrarToast("Não foi possível adicionar este livro.");
      return;
    }

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

  carrinho = [];

  atualizarCarrinho();

  mostrarToast("Carrinho esvaziado.");
});

// PRÉVIA DO LIVRO

function mostrarPrevia(nome, preco, categoria, descricao, imagemSrc) {
  const area = $("areaPrevia");

  if (area.dataset.livro === nome) {
    area.replaceChildren();
    area.dataset.livro = "";
    return;
  }

  area.dataset.livro = nome;
  area.replaceChildren();

  const imagem = document.createElement("img");
  imagem.src = imagemSrc;
  imagem.alt = "Capa do livro " + nome;
  imagem.style.width = "75px";
  imagem.style.maxHeight = "110px";
  imagem.style.objectFit = "contain";

  const info = document.createElement("div");

  const cat = document.createElement("span");
  cat.style.display = "block";
  cat.style.color = "var(--blue)";
  cat.style.fontSize = "9px";
  cat.style.fontWeight = "800";
  cat.style.letterSpacing = "1px";
  cat.style.marginBottom = "4px";
  cat.textContent = categoria;

  const titulo = document.createElement("strong");
  titulo.style.display = "block";
  titulo.style.fontSize = "15px";
  titulo.style.lineHeight = "1.3";
  titulo.style.marginBottom = "6px";
  titulo.textContent = nome;

  const desc = document.createElement("p");
  desc.style.color = "var(--muted)";
  desc.style.fontSize = "12px";
  desc.style.lineHeight = "1.5";
  desc.style.marginBottom = "8px";
  desc.textContent = descricao;

  const price = document.createElement("span");
  price.style.fontWeight = "700";
  price.style.fontSize = "14px";
  price.textContent = formatarPreco(preco);

  info.append(cat, titulo, desc, price);

  imagem.addEventListener("error", () => {
    imagem.remove();
  });

  area.append(imagem, info);
}

document.querySelectorAll(".preview-button").forEach((botao) => {
  botao.addEventListener("click", () => {
    const nome = botao.dataset.nome;
    const preco = Number(botao.dataset.preco);
    const categoria = botao.dataset.categoria;
    const descricao = botao.dataset.descricao;
    const imagem = botao.dataset.imagem;

    mostrarPrevia(nome, preco, categoria, descricao, imagem);
    $("previa").scrollIntoView({ behavior: "smooth", block: "center" });
  });
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
