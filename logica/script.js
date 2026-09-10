// --- ENGENHARIA DE IDIOMAS EXPANDIDA ---
const ESTILOS = {
    "Comum (Humano)": { 
        consoantes: ["b","c","d","f","g","h","j","l","m","n","p","r","s","t","v","z","br","cr","dr","fr","gr","pr","tr"], 
        vogais: ["a","e","i","o","u"],
        estruturas: ["CV", "CVC", "CV"]
    },
    "Élfico (Suave)": { 
        consoantes: ["l","m","n","r","s","th","f","v","c","dh","sh","ph","y"], 
        vogais: ["a","e","i","o","y","ae","ea","ia","ie"],
        estruturas: ["CV", "V", "CV", "CVC"]
    },
    "Orc (Gutural)": { 
        consoantes: ["k","g","r","z","b","d","gh","kr","gr","th","kh","sk","zug","sn","uk"], 
        vogais: ["a","o","u","ur"],
        estruturas: ["CVC", "CV", "CVC"]
    },
    "Anão (Firme)": { 
        consoantes: ["d","g","k","m","r","t","v","z","br","dr","gr","khr","thor","grim","krag"], 
        vogais: ["a","e","i","o","u"],
        estruturas: ["CVC", "CV", "CVC"]
    },
    "Celestial (Anjos)": { 
        consoantes: ["l","m","s","v","th","z","ph","r","sh"], 
        vogais: ["a","e","i","ae","io","ia","uel","ael"],
        estruturas: ["CV", "V", "CV"]
    },
    "Abissal (Demônios)": { 
        consoantes: ["x","z","k","v","q","zh","kh","vr","rrh","gx","tz","xz"], 
        vogais: ["o","u","ou","uo","a"],
        estruturas: ["CVC", "CVC", "CV"]
    },
    "Feérico (Fadas)": { 
        consoantes: ["f","l","m","n","s","w","sh","th","ly","ny"], 
        vogais: ["e","i","y","ie","ei","ia","ae"],
        estruturas: ["CV", "V", "CV"]
    },
    "Cyberpunk (Sci-Fi)": { 
        consoantes: ["x","z","k","v","c","n","t","r","nx","px","qv","zk"], 
        vogais: ["a","e","i","o","u","y","io"],
        estruturas: ["CVC", "CV", "CCV"]
    }
};

// Dicionário de significados massivamente expandido
const SIGNIFICADOS = {
    "Pessoa": [
        "O Sábio", "O Implacável", "A Sombra", "O Guardião", "O Exilado", "Mão de Ferro", 
        "Voz do Vento", "Coração Valente", "O Ilusionista", "Sangue Real", "O Andarilho", 
        "A Lança da Alvorada", "O Tecelão do Destino", "Mão Aberta", "O Caçador Noturno", 
        "Voz de Prata", "Olhos de Serpente", "O Renegado", "Espada do Sol", "Lorde das Sombras", 
        "Pássaro de Fogo", "Filho da Tempestade", "A Feiticeira", "O Erudito", "Lança Quebrada", 
        "Espírito Livre", "Mestre das Chamas", "O Sentinela", "Andarilho dos Sonhos", "A Lenda"
    ],
    "Lugar": [
        "Vale Escondido", "Fortaleza", "Cidade Alta", "Ruínas Antigas", "Pico Nevado", 
        "Porto Seguro", "Floresta Densa", "Deserto das Cinzas", "O Abismo", "Santuário", 
        "Torre Esquecida", "Mar de Brumas", "Vale dos Ossos", "Encruzilhada", "Gruta Profunda", 
        "Muralha de Pedra", "Cume do Trovão", "Jardim Suspenso", "Pântano Negro", "Oásis da Esperança",
        "Refúgio dos Perdidos", "Abismo Sem Fim", "Cultura Esquecida", "Portão de Ouro"
    ],
    "Artefato": [
        "Lâmina do Destino", "Amuleto Perdido", "Escudo Intransponível", "Relíquia Ancestral", 
        "Cajado das Eras", "Coroa de Espinhos", "Anel do Poder", "Orbe Cristalino", "Manuscrito Negro",
        "Cálice Sagrado", "Adaga Venenosa", "Livro dos Mortos", "Manto da Invisibilidade", "Espelho da Verdade",
        "Pedra de Sangue", "Selo Real", "Machado Guerreiro", "Arco do Luar"
    ],
    "Geral": [
        "Luz Guiadora", "Ecos do Passado", "Fogo da Montanha", "Sopro do Vento", "A Aurora", 
        "O Crepúsculo", "Chama Eterna", "Rio de Estrelas", "A Escuridão", "Sombra Lunar",
        "Canto da Sereia", "A Promessa", "Vento do Norte", "Segredo Ancestral", "Espírito Selvagem"
    ]
};

let historicoNomes = [];

window.onload = function() {
    const selectEstilo = document.getElementById("estilo");
    if (!selectEstilo) return;
    for (let estilo in ESTILOS) {
        let option = document.createElement("option");
        option.value = estilo;
        option.text = estilo;
        selectEstilo.appendChild(option);
    }
};

function sortear(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function aplicarAcento(palavra) {
    const acentos = { 'a': ['á', 'ã', 'â'], 'e': ['é', 'ê'], 'i': ['í'], 'o': ['ó', 'ô'], 'u': ['ú'] };
    let letras = palavra.split('');
    for (let i = 0; i < letras.length; i++) {
        if (acentos[letras[i]] && Math.random() < 0.15) {
            letras[i] = sortear(acentos[letras[i]]);
            break; 
        }
    }
    return letras.join('');
}

function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function gerarSilaba(regras) {
    const estrutura = sortear(regras.estruturas);
    let silaba = "";
    for (let char of estrutura) {
        if (char === "C") silaba += sortear(regras.consoantes);
        else if (char === "V") silaba += sortear(regras.vogais);
    }
    return silaba;
}

function gerarNomes() {
    const estiloSelecionado = document.getElementById("estilo").value;
    const qtd = parseInt(document.getElementById("quantidade").value);
    let minSilabas = parseInt(document.getElementById("silabas-min").value);
    let maxSilabas = parseInt(document.getElementById("silabas-max").value);
    const usarAcentos = document.getElementById("usar-acentos").checked;
    const usarSignificados = document.getElementById("usar-significados").checked;
    const tipoSig = document.getElementById("tipo-significado").value;

    if (minSilabas > maxSilabas) {
        let temp = minSilabas;
        minSilabas = maxSilabas;
        maxSilabas = temp;
        document.getElementById("silabas-min").value = minSilabas;
        document.getElementById("silabas-max").value = maxSilabas;
    }

    const regras = ESTILOS[estiloSelecionado];
    let nomesGerados = [];
    let tentativas = 0;

    // Cópias locais dos significados para sorteio SEM REPOSIÇÃO durante a geração
    let significadosDisponiveis = [...SIGNIFICADOS[tipoSig]];

    while (nomesGerados.length < qtd && tentativas < 200) {
        tentativas++;
        let qtdSilabas = Math.floor(Math.random() * (maxSilabas - minSilabas + 1)) + minSilabas;
        let palavra = "";

        for (let s = 0; s < qtdSilabas; s++) {
            palavra += gerarSilaba(regras);
        }

        if (usarAcentos) {
            palavra = aplicarAcento(palavra);
        }

        palavra = capitalizar(palavra);

        if (usarSignificados) {
            // Se esgotar a lista de significados na mesma rodada, recarrega a lista
            if (significadosDisponiveis.length === 0) {
                significadosDisponiveis = [...SIGNIFICADOS[tipoSig]];
            }
            // Retira o significado da lista para que ele não se repita no mesmo lote
            let idxSignificado = Math.floor(Math.random() * significadosDisponiveis.length);
            let conceito = significadosDisponiveis.splice(idxSignificado, 1)[0];
            
            palavra = `${palavra} - (${conceito})`;
        }

        if (!nomesGerados.includes(palavra)) {
            nomesGerados.push(palavra);
            if (!historicoNomes.includes(palavra)) {
                historicoNomes.push(palavra);
            }
        }
    }

    document.getElementById("caixa-texto").value = nomesGerados.join("\n");
}

function copiarTexto() {
    const texto = document.getElementById("caixa-texto").value;
    if (!texto) {
        alert("Não há nomes para copiar! Gere alguns primeiro.");
        return;
    }
    navigator.clipboard.writeText(texto).then(() => {
        alert("Nomes copiados com sucesso!");
    }).catch(() => {
        alert("Erro ao copiar. Selecione o texto e copie manualmente.");
    });
}

function abrirHistorico() {
    if (historicoNomes.length === 0) {
        alert("O histórico está vazio!");
        return;
    }
    document.getElementById("contador-historico").innerText = `Total de nomes gerados: ${historicoNomes.length}`;
    document.getElementById("caixa-historico").value = historicoNomes.join("\n");
    document.getElementById("modal-historico").style.display = "flex";
}

function fecharHistorico() {
    document.getElementById("modal-historico").style.display = "none";
}

async function exportarHistorico() {
    if (historicoNomes.length === 0) {
        alert("O histórico está vazio! Gere alguns nomes primeiro.");
        return;
    }

    const textoExportacao = "--- Forja de Idiomas (Nomes Salvos) ---\n\n" + historicoNomes.join("\n");

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Nomes RPG - Forja de Idiomas',
                text: textoExportacao
            });
            return;
        } catch (err) {
            if (err.name !== 'AbortError') console.error(err);
        }
    }

    const blob = new Blob([textoExportacao], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nomes_campanha.txt";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

function rolarD20() {
    const display = document.getElementById("resultado-d20");
    let giros = 0;
    
    // Animação rápida de sorteio
    const animacao = setInterval(() => {
        display.style.color = "#ffffff";
        display.innerText = Math.floor(Math.random() * 20) + 1;
        giros++;
        
        if (giros > 8) {
            clearInterval(animacao);
            const valorFinal = Math.floor(Math.random() * 20) + 1;
            display.innerText = valorFinal;
            
            // Cores especiais para acerto/falha crítica
            if (valorFinal === 20) {
                display.style.color = "#4ade80"; // Verde Crítico
            } else if (valorFinal === 1) {
                display.style.color = "#f87171"; // Vermelho Falha
            } else {
                display.style.color = "#ffffff";
            }
        }
    }, 40);
}
