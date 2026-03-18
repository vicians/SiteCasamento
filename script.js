// ================= 1. CONFIGURAÇÃO GLOBAL =================
const supabaseUrl = 'https://ziagzhrpdamhwewylqcm.supabase.co';
// Usando a chave anon que você forneceu
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYWd6aHJwZGFtaHdld3lscWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NTg3MDUsImV4cCI6MjA4OTQzNDcwNX0.E3fFLimI_CgmpHNf1pwNX0etnua3G1DxiE5D-WfUbrQ';

// Renomeado para evitar conflito com o objeto global da biblioteca
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

const modal = document.getElementById("pixModal");

// ================= 2. LÓGICA DA LISTA DE PRESENTES =================
async function carregarPresentes() {
    const grid = document.getElementById('lista-dinamica');
    
    try {
        // Usando a instância renomeada
        const { data: presentes, error } = await supabaseClient
            .from('presentes')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        if (!presentes || presentes.length === 0) {
            grid.innerHTML = '<p>Nenhum presente cadastrado ainda.</p>';
            return;
        }

        grid.innerHTML = ''; 

        presentes.forEach(presente => {
            const valorFormatado = Number(presente.valor).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            const cardHTML = `
                <div class="gift-card">
                    <div class="gift-icon">${presente.icone}</div>
                    <h3>${presente.titulo}</h3>
                    <span class="gift-price">${valorFormatado}</span>
                    <button class="btn-gift" onclick="abrirModalPix('${presente.titulo}')">Presentear</button>
                </div>
            `;
            grid.insertAdjacentHTML('beforeend', cardHTML);
        });
    } catch (err) {
        console.error("Erro no Supabase:", err);
        grid.innerHTML = '<p>Erro ao carregar presentes. Verifique o console.</p>';
    }
}

// ================= 3. LÓGICA DO MODAL E PIX =================
function abrirModalPix(nomePresente) {
    document.getElementById("modalGiftName").innerText = nomePresente;
    if (modal) modal.style.display = "flex"; 
}

function fecharModal() {
    if (modal) modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) fecharModal();
}

function copiarPix() {
    const pixKeyInput = document.getElementById("pixKey");
    pixKeyInput.select();
    pixKeyInput.setSelectionRange(0, 99999);
    
    navigator.clipboard.writeText(pixKeyInput.value).then(() => {
        const btn = document.querySelector('.btn-copy');
        const originalText = btn.innerText;
        btn.innerText = 'Copiado!';
        setTimeout(() => { btn.innerText = originalText; }, 2000);
    });
}

// ================= 4. LÓGICA DO RSVP (GOOGLE SHEETS) =================
const formRSVP = document.getElementById("formRSVP");

if(formRSVP) {
    formRSVP.addEventListener("submit", function(e) {
        e.preventDefault();
        const nome = document.getElementById("nome").value;
        const quantidade = document.getElementById("quantidade").value;
        const botao = document.querySelector("#formRSVP .btn-submit");
        const spinner = document.getElementById("spinner");

        botao.disabled = true;
        botao.style.opacity = 0.6;
        spinner.style.display = "block";

        fetch("https://script.google.com/macros/s/AKfycbyFngrVGxc4fVswFZRbzqVkmCmObHREDHkzdnkm_in982LM8bkJa9aUbJ4o4rDfvOfdbA/exec", {
            method: "POST",
            body: new URLSearchParams({nome, quantidade})
        })
        .then(() => {
            spinner.style.display = "none";
            formRSVP.style.display = "none";
            document.getElementById("agradecimento").style.display = "block";
        })
        .catch(error => {
            console.error("Erro RSVP:", error);
            spinner.style.display = "none";
            botao.disabled = false;
            botao.style.opacity = 1;
            alert("Erro ao enviar confirmação.");
        });
    });
}

// Inicializa a busca de presentes
carregarPresentes();

// ================= 5. CONTADOR REGRESSIVO =================
function iniciarContagemRegressiva() {
    // Defina a data do casamento aqui (Ano, Mês - 1, Dia, Hora, Min)
    // Janeiro é 0, Novembro é 10
    const dataCasamento = new Date(2026, 10, 20, 17, 0, 0).getTime();

    const intervalo = setInterval(() => {
        const agora = new Date().getTime();
        const diferenca = dataCasamento - agora;

        if (diferenca < 0) {
            clearInterval(intervalo);
            document.getElementById("countdown").innerHTML = "<h3>É HOJE! 🎉</h3>";
            return;
        }

        const d = Math.floor(diferenca / (1000 * 60 * 60 * 24));
        const h = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diferenca % (1000 * 60)) / 1000);

        document.getElementById("days").innerText = d < 10 ? '0' + d : d;
        document.getElementById("hours").innerText = h < 10 ? '0' + h : h;
        document.getElementById("minutes").innerText = m < 10 ? '0' + m : m;
        document.getElementById("seconds").innerText = s < 10 ? '0' + s : s;
    }, 1000);
}

// Inicia o timer
iniciarContagemRegressiva();