// Função para obter o IP público do usuário via API
async function obterIPPublico() {
    try {
        let resposta = await fetch("https://api64.ipify.org?format=json");
        let dados = await resposta.json();
        document.getElementById("ipPublico").innerHTML = `<p><strong>Seu IP público:</strong> ${dados.ip}</p>`;
        
        // Insere o IP público automaticamente no campo para cálculo
        document.getElementById("ip").value = dados.ip;
    } catch (error) {
        document.getElementById("ipPublico").innerHTML = `<p style="color:red;">Não foi possível obter o IP público.</p>`;
    }
}

function calcularSubrede() {
    let ip = document.getElementById("ip").value;
    let mask = document.getElementById("mask").value;

    if (!validarIP(ip) || !validarIP(mask)) {
        document.getElementById("resultado").innerHTML = "<strong>Erro:</strong> Endereço IPv4 ou Máscara inválidos!";
        return;
    }

    let ipParts = ip.split('.').map(Number);
    let maskParts = mask.split('.').map(Number);
    
    let rede = calcularRede(ipParts, maskParts);
    let broadcast = calcularBroadcast(ipParts, maskParts);
    let bitsSubrede = contarBitsSubrede(maskParts);
    let totalSubredes = Math.pow(2, bitsSubrede);
    let bitsHost = contarBitsHost(maskParts);
    let totalHosts = Math.pow(2, bitsHost) - 2;
    let ipExplicacao = explicarPartesIP(ipParts, maskParts);
    let categoriaIP = identificarCategoria(ipParts);
    
    document.getElementById("resultado").innerHTML = `
        <h2>Resultados:</h2>
        <p><strong>Endereço de Rede:</strong> ${rede.join('.')}</p>
        <p><strong>Endereço de Broadcast:</strong> ${broadcast.join('.')}</p>
        <p><strong>Quantidade de Sub-redes:</strong> ${totalSubredes} sub-redes</p>
        <p><strong>Quantidade de Hosts por Sub-rede:</strong> ${totalHosts} hosts</p>
        <p><strong>Categoria do IP:</strong> ${categoriaIP}</p>

        <h3>Explicação detalhada:</h3>
        <p><strong>Estrutura do endereço IP:</strong> ${ipExplicacao}</p>

        <h3>Como foi feito o cálculo?</h3>
        <p><strong>Bits usados para sub-redes:</strong> ${bitsSubrede} bits (contados a partir da máscara de sub-rede)</p>
        <p><strong>Fórmula usada para calcular sub-redes:</strong> 2^${bitsSubrede} = ${totalSubredes}</p>
        <p><strong>Bits restantes para hosts:</strong> ${bitsHost} bits</p>
        <p><strong>Fórmula usada para calcular hosts por sub-rede:</strong> (2^${bitsHost}) - 2 = ${totalHosts}</p>
    `;
}


function validarIP(ip) {
    let regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return regex.test(ip);
}

function calcularRede(ip, mask) {
    return ip.map((octeto, i) => octeto & mask[i]);
}

function calcularBroadcast(ip, mask) {
    return ip.map((octeto, i) => octeto | (mask[i] ^ 255));
}

function contarBitsSubrede(mask) {
    let mascaraBinaria = mask.map(octeto => octeto.toString(2).padStart(8, '0')).join('');
    return mascaraBinaria.replace(/0/g, '').length - 16; // Subtrai 16 pois Classe B começa com /16
}

function contarBitsHost(mask) {
    return mask.map(octeto => (octeto ^ 255).toString(2).replace(/0/g, '').length).reduce((acc, val) => acc + val, 0);
}

function explicarPartesIP(ip, mask) {
    let mascaraBinaria = mask.map(octeto => octeto.toString(2).padStart(8, '0')).join('');
    let limiteRede = mascaraBinaria.lastIndexOf('1');

    let parteRede = ip.map((octeto, i) => i * 8 <= limiteRede ? `<strong>${octeto}</strong>` : octeto);
    let parteHost = ip.map((octeto, i) => i * 8 > limiteRede ? `<strong style="color:red">${octeto}</strong>` : octeto);

    return `A parte da <strong>rede</strong> do IP é: ${parteRede.join('.')} <br> 
            A parte do <strong style="color:red">host</strong> do IP é: ${parteHost.join('.')}`;
}

function identificarCategoria(ip) {
    let primeiroOcteto = ip[0];

    if (primeiroOcteto >= 1 && primeiroOcteto <= 126) {
        return "Classe A (Público)";
    } else if (primeiroOcteto >= 128 && primeiroOcteto <= 191) {
        return "Classe B (Público)";
    } else if (primeiroOcteto >= 192 && primeiroOcteto <= 223) {
        return "Classe C (Público)";
    } else if (primeiroOcteto >= 224 && primeiroOcteto <= 239) {
        return "Classe D (Multicast)";
    } else if (primeiroOcteto >= 240 && primeiroOcteto <= 255) {
        return "Classe E (Reservado)";
    } else if ((ip[0] === 10) || 
               (ip[0] === 172 && ip[1] >= 16 && ip[1] <= 31) || 
               (ip[0] === 192 && ip[1] === 168)) {
        return "Endereço Privado";
    } else {
        return "Desconhecido";
    }
}

window.onload = obterIPPublico;