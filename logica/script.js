// --- ENGENHARIA DE IDIOMAS ---
const ESTILOS = {
    "Comum (Humano)": { consoantes: ["b","c","d","f","g","h","j","l","m","n","p","r","s","t","v","z"], vogais: ["a","e","i","o","u"] },
    "Élfico (Suave)": { consoantes: ["l","m","n","r","s","th","f","v","c"], vogais: ["a","e","i","o","y","ae","ea"] },
    "Orc (Gutural)": { consoantes: ["k","g","r","z","b","d","gh","kr","gr","th"], vogais: ["a","o","u"] },
    "Anão (Firme)": { consoantes: ["d","g","k","m","r","t","v","z","br","dr","gr"], vogais: ["a","e","i","o","u"] },
    "Celestial (Anjos)": { consoantes: ["l","m","s","v","th","z","ph"], vogais: ["a","e","i","ae","io","ia"] },
    "Abissal (Demônios)": { consoantes: ["x","z","k","v","q","zh","kh","vr"], vogais: ["o","u","ou","uo"] },
    "Feérico (Fadas)": { consoantes: ["f","l","m","n","s","w","sh"], vogais: ["e","i","y","ie","ei"] },
    "Cyberpunk (Sci-Fi)": { consoantes: ["x","z","k","v","c","n","t","r","nx"], vogais: ["a","e","i","o","u","y"] }
};

const SIGNIFICADOS = {
    "Pessoa": ["O Sábio", "O Implacável", "A Sombra", "O Guardião", "O Exilado", "Mão de Ferro", "Voz do Vento", "Coração Valente", "O Ilusionista", "Sangue Real"],
    "Lugar": ["Vale Escondido", "Fortaleza", "Cidade Alta", "Ruínas Antigas", "Pico Nevado", "Porto Seguro", "Floresta Densa", "Deserto das Cinzas", "O Abismo", "Santuário"],
    "Artefato": ["Lâmina do Destino", "Amuleto Perdido", "Escudo Intransponível", "Relíquia Ancestral", "Cajado das Eras", "Coroa de Espinhos", "Anel do Poder", "Orbe Cristalino", "Manuscrito Negro"],
    "Geral": ["Luz Guiadora", "Ecos do Passado", "Fogo da Montanha", "Sopro do Vento", "A Aurora", "O Crepúsculo", "Chama Eterna", "Rio de Estrelas"]
};

// Memória do aplicativo
let historicoNomes = [];

// Preencher a caixa de seleção de estilos ao carregar a página
window.onload = function() {
    const selectEstilo = document.getElementById("estilo");
    for (let estilo in ESTILOS) {
        let option = document.createElement("option");
        option.value = estilo;
        option.text = estilo;
        selectEstilo.appendChild(option);
    }
};

// Funções Utilitárias
function sortear(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function aplicarAcento(palavra) {
    const acentos = { 'a': ['á', 'ã', 'â'], 'e': ['é', 'ê'], 'i': ['í'], 'o': ['ó', 'ô'], 'u': ['ú'] };
    let letras = palavra.split('');
    for (let i = 0; i < letras.length; i++) {
        if (acentos[letras[i]] && Math.random() < 0.15) { // 15% de chance
            letras[i] = sortear(acentos[letras[i]]);
            break; 
        }
    }
    return letras.join('');
}

function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Motor Principal
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

    for (let i = 0; i < qtd; i++) {
        let qtdSilabas = Math.floor(Math.random() * (maxSilabas - minSilabas + 1)) + minSilabas;
        let palavra = "";

        for (let s = 0; s < qtdSilabas; s++) {
            palavra += sortear(regras.consoantes);
            palavra += sortear(regras.vogais);
        }

        if (usarAcentos) {
            palavra = aplicarAcento(palavra);
        }

        palavra = capitalizar(palavra);

        if (usarSignificados) {
            let conceito = sortear(SIGNIFICADOS[tipoSig]);
            palavra = `${palavra} - (${conceito})`;
        }

        // Evita repetidos na mesma rolagem
        if (!nomesGerados.includes(palavra)) {
            nomesGerados.push(palavra);
            // Adiciona ao histórico se ainda não existir lá
            if (!historicoNomes.includes(palavra)) {
                historicoNomes.push(palavra);
            }
        }
    }

    document.getElementById("caixa-texto").value = nomesGerados.join("\n");
}

// Funções da Interface
function copiarTexto() {
    const texto = document.getElementById("caixa-texto").value;
    if (!texto) {
        alert("Não há nomes para copiar! Gere alguns primeiro.");
        return;
    }
    navigator.clipboard.writeText(texto).then(() => {
        alert("Nomes copiados com sucesso!");
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

function exportarHistorico() {
    if (historicoNomes.length === 0) {
        alert("O histórico está vazio!");
        return;
    }
    
    // Criando um arquivo .txt direto no navegador!
    const conteudo = "--- Forja de Idiomas (Nomes Salvos) ---\n\n" + historicoNomes.join("\n");
    const blob = new Blob([conteudo], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "nomes_campanha.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
