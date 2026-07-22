// ================= 1. CONFIGURAÇÃO GLOBAL =================
const supabaseUrl = 'https://ziagzhrpdamhwewylqcm.supabase.co';
// Usando a chave anon que você forneceu
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYWd6aHJwZGFtaHdld3lscWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NTg3MDUsImV4cCI6MjA4OTQzNDcwNX0.E3fFLimI_CgmpHNf1pwNX0etnua3G1DxiE5D-WfUbrQ';

// Renomeado para evitar conflito com o objeto global da biblioteca
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

const modal = document.getElementById("pixModal");
const giftsListModal = document.getElementById("giftsListModal");

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

        presentes.forEach((presente, index) => {
            let onclickAction;
            let btnClassAndId;
            let btnText;

            if (index === 0) {
                // O primeiro presente é sempre Pix
                onclickAction = `onclick="abrirModalPix('${presente.titulo}')"`;
                btnClassAndId = `class="btn-gift"`;
                btnText = `Presentear`;
            } else {
                // Os demais presentes serão físicos
                onclickAction = `onclick="toggleSelecaoPresente('${presente.id}', '${presente.titulo}')"`;
                btnClassAndId = `class="btn-gift" id="btn-presente-${presente.id}"`;
                btnText = `Selecionar`;
            }

            const cardHTML = `
                <div class="gift-card">
                    <div class="gift-icon" style="cursor: pointer;" ${onclickAction}>${presente.icone}</div>
                    <h3>${presente.titulo}</h3>
                    <button ${btnClassAndId} ${onclickAction}>${btnText}</button>
                </div>
            `;
            grid.insertAdjacentHTML('beforeend', cardHTML);
        });
    } catch (err) {
        console.error("Erro no Supabase:", err);
        grid.innerHTML = '<p>Erro ao carregar presentes. Verifique o console.</p>';
    }
}



let presentesSelecionados = [];

function toggleSelecaoPresente(idPresente, nomePresente) {
    const index = presentesSelecionados.findIndex(p => p.id === idPresente);
    const btn = document.getElementById(`btn-presente-${idPresente}`);
    
    if (index > -1) {
        // Desmarcar
        presentesSelecionados.splice(index, 1);
        btn.innerText = "Selecionar";
        btn.style.backgroundColor = "var(--pink-btn)"; 
    } else {
        // Marcar
        presentesSelecionados.push({ id: idPresente, nome: nomePresente });
        btn.innerText = "Selecionado ✔";
        btn.style.backgroundColor = "var(--pink-btn-hover)";
    }
    
    atualizarBarraReserva();
}

function atualizarBarraReserva() {
    const barra = document.getElementById('reservation-action');
    const textoCount = document.getElementById('reservation-count');
    
    if (!barra || !textoCount) return;
    
    if (presentesSelecionados.length > 0) {
        barra.style.display = "block";
        textoCount.innerText = `${presentesSelecionados.length} item(s) selecionado(s)`;
    } else {
        barra.style.display = "none";
    }
}

function prosseguirReserva() {
    const nomes = presentesSelecionados.map(p => p.nome).join("\\n- ");
    alert("Próximo passo: confirmar a reserva e enviar para o banco de dados!\\n\\nItens Selecionados:\\n- " + nomes);
}

// ================= 3. LÓGICA DO MODAL E PIX =================
function abrirModalPix(nomePresente) {
    document.getElementById("modalGiftName").innerText = nomePresente;
    if (modal) modal.style.display = "flex"; 
}

function fecharModal() {
    if (modal) modal.style.display = "none";
}

function abrirModalListaPresentes() {
    if (giftsListModal) giftsListModal.style.display = "flex";
}

function fecharModalListaPresentes() {
    if (giftsListModal) giftsListModal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) fecharModal();
    if (event.target == giftsListModal) fecharModalListaPresentes();
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

iniciarContagemRegressiva();


// ================= 6. LÓGICA DE REVELAÇÃO AO SCROLL =================
function revealOnScroll() {
    const reveals = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                // observer.unobserve(entry.target); // Descomente para animar apenas uma vez
            } else {
                entry.target.classList.remove("active"); // Comente para animar apenas uma vez
            }
        });
    }, {
        threshold: 0.15, 
        rootMargin: '0px 0px -100px 0px'
    });

    reveals.forEach(reveal => {
        observer.observe(reveal);
    });
}

// Inicializa a lógica de revelação
revealOnScroll();

// ================= 7. LÓGICA DE ESCONDER NAVBAR =================

let ultimoScroll = 0;

window.addEventListener('scroll', () => {
    const atualScroll = window.scrollY;
    const navbar = document.querySelector('.navbar');

    if (atualScroll <= 0) {
        navbar.classList.remove('navbar-hidden');
        return;
    }

    if (atualScroll > ultimoScroll && !navbar.classList.contains('navbar-hidden')) {
        // Scroll para baixo: Esconde
        navbar.classList.add('navbar-hidden');
    } else if (atualScroll < ultimoScroll && navbar.classList.contains('navbar-hidden')) {
        // Scroll para cima: Mostra
        navbar.classList.remove('navbar-hidden');
    }
    
    ultimoScroll = atualScroll;
});