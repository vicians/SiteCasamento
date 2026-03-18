// ================= LÓGICA DO MODAL DE PRESENTES =================
const modal = document.getElementById("pixModal");

// Função acionada ao clicar em "Presentear"
function abrirModalPix(nomePresente) {
    // Atualiza o título do modal com o nome do presente escolhido
    document.getElementById("modalGiftName").innerText = nomePresente;
    // Exibe o modal na tela usando flexbox para centralizar
    modal.style.display = "flex"; 
}

// Função para fechar o modal no "X"
function fecharModal() {
    modal.style.display = "none";
}

// Fechar o modal se o usuário clicar fora da caixa branca
window.onclick = function(event) {
    if (event.target == modal) {
        fecharModal();
    }
}

// Função para copiar a chave PIX e dar um feedback visual
function copiarPix() {
    const pixKeyInput = document.getElementById("pixKey");
    
    // Seleciona o texto no input
    pixKeyInput.select();
    pixKeyInput.setSelectionRange(0, 99999); // Necessário para funcionar bem em celulares
    
    // Copia para a área de transferência
    navigator.clipboard.writeText(pixKeyInput.value).then(() => {
        const btn = document.querySelector('.btn-copy');
        const textoOriginal = btn.innerText;
        
        // Altera o botão temporariamente para mostrar que funcionou
        btn.innerText = 'Copiado!';
        btn.style.backgroundColor = 'var(--pink-btn)';
        
        // Volta ao estado original após 2 segundos
        setTimeout(() => {
            btn.innerText = textoOriginal;
            btn.style.backgroundColor = '#333';
        }, 2000);
    });
}

// ================= LÓGICA DO FORMULÁRIO RSVP (GOOGLE SHEETS) =================
const formRSVP = document.getElementById("formRSVP");

if(formRSVP) {
    formRSVP.addEventListener("submit", function(e) {
        e.preventDefault();

        const nome = document.getElementById("nome").value;
        const quantidade = document.getElementById("quantidade").value;
        const botao = document.querySelector("#formRSVP .btn-submit");
        const spinner = document.getElementById("spinner");

        // Desabilitar botão e mostrar mensagem de carregamento
        botao.disabled = true;
        botao.style.opacity = 0.6;
        spinner.style.display = "block";

        // Faz o envio para a sua planilha do Google
        fetch("https://script.google.com/macros/s/AKfycbyFngrVGxc4fVswFZRbzqVkmCmObHREDHkzdnkm_in982LM8bkJa9aUbJ4o4rDfvOfdbA/exec", {
            method: "POST",
            body: new URLSearchParams({nome, quantidade})
        })
        .then(response => response.text())
        .then(data => {
            // Esconde o formulário e mostra a mensagem de sucesso
            spinner.style.display = "none";
            formRSVP.style.display = "none";
            document.getElementById("agradecimento").style.display = "block";
            
            // Reabilita o botão (caso a página não seja recarregada)
            botao.disabled = false;
            botao.style.opacity = 1;
        })
        .catch(error => {
            spinner.style.display = "none";
            botao.disabled = false;
            botao.style.opacity = 1;
            alert("Erro ao enviar a confirmação. Por favor, verifique sua conexão e tente novamente.");
        });
    });
}