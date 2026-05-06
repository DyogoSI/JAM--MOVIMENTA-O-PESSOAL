function validateForm(form) {
    var atividade = parseInt(getValue("WKNumState"));
    var msg = "";

    // INÍCIO E CORREÇÃO
    if (atividade == 0 || atividade == 3 || atividade == 6) { 
        if (form.getValue("empresaColab") == null || form.getValue("empresaColab") == "") { msg += "- Empresa-Filial;\n"; }
        if (form.getValue("dptoObraColab") == null || form.getValue("dptoObraColab") == "") { msg += "- Dpto/Obra do Colaborador;\n"; }
        if (form.getValue("nomeColaborador") == null || form.getValue("nomeColaborador") == "") { msg += "- Nome do Colaborador;\n"; }
        
        var ckb1 = form.getValue("Ckb1"); // Dpto/Obra
        var ckb2 = form.getValue("Ckb2"); // Função
        var ckb3 = form.getValue("Ckb3"); // Horário
        var ckb5 = form.getValue("Ckb5"); // Salário

        if (ckb1 != "on" && ckb2 != "on" && ckb3 != "on" && ckb5 != "on") {
            msg += "\n- Selecione pelo menos uma movimentação (Departamento/Obra, Função, Horário ou Salário);\n";
        } else {
            if (form.getValue("dtMudanca") == null || form.getValue("dtMudanca") == "") { msg += "- Data da Mudança (Aplicação);\n"; }

            if (ckb1 == "on") {
                if (form.getValue("CodNovaSecao") == null || form.getValue("CodNovaSecao") == "") { msg += "- Novo Dpto/Obra;\n"; }
                if (form.getValue("txtMotivoSecao") == null || form.getValue("txtMotivoSecao") == "") { msg += "- Motivo da Alteração (Departamento/Obra);\n"; }
            }
            if (ckb2 == "on") {
                if (form.getValue("txtNovoFuncao") == null || form.getValue("txtNovoFuncao") == "") { msg += "- Descrição da Nova Função;\n"; }
                if (form.getValue("txtMotivoFuncao") == null || form.getValue("txtMotivoFuncao") == "") { msg += "- Motivo da Alteração (Função);\n"; }
            }
            if (ckb3 == "on") {
                if (form.getValue("CpNovoHorario") == null || form.getValue("CpNovoHorario") == "") { msg += "- Descrição do Novo Horário;\n"; }
            }
            if (ckb5 == "on") {
                if (form.getValue("NovoSalario") == null || form.getValue("NovoSalario") == "") { msg += "- Novo Salário;\n"; }
                if (form.getValue("cpNovaJornadaMensal") == null || form.getValue("cpNovaJornadaMensal") == "") { msg += "- Nova Jornada Mensal;\n"; }
                if (form.getValue("txtMotivoSalario") == null || form.getValue("txtMotivoSalario") == "") { msg += "- Motivo da Alteração (Salário);\n"; }
            }
        }
    }

    // ETAPA DO BPO (OPERAÇÃO IRHO)
    if (atividade == 4) { 
        if (form.getValue("cpDecisaoRH") == null || form.getValue("cpDecisaoRH") == "") { 
            msg += "- Decisão (Enviar solução ou Devolver);\n"; 
        }
        
        if (form.getValue("cpDecisaoRH") == "Incorreto" && (form.getValue("cpParecercol2") == null || form.getValue("cpParecercol2") == "")) { 
            msg += "- É obrigatório preencher o Parecer do BPO justificando a devolução.\n"; 
        }

        // SE O BPO DISSER QUE ESTÁ CORRETO, EXIGE A MARCAÇÃO DA FLAG NAS ABAS ATIVAS
        if (form.getValue("cpDecisaoRH") == "Correto") {
            if (form.getValue("Ckb1") == "on" && form.getValue("validaSecaoBPO") != "SIM") { 
                msg += "- Confirmação de [Validação BPO] obrigatória na aba de Departamento/Obra;\n"; 
            }
            if (form.getValue("Ckb2") == "on" && form.getValue("validaFuncaoBPO") != "SIM") { 
                msg += "- Confirmação de [Validação BPO] obrigatória na aba de Função;\n"; 
            }
            if (form.getValue("Ckb3") == "on" && form.getValue("validaHorarioBPO") != "SIM") { 
                msg += "- Confirmação de [Validação BPO] obrigatória na aba de Horário;\n"; 
            }
            if (form.getValue("Ckb5") == "on" && form.getValue("validaSalarioBPO") != "SIM") { 
                msg += "- Confirmação de [Validação BPO] obrigatória na aba de Salário;\n"; 
            }
        }
    }

    if (atividade == 11) {
        if (form.getValue("cpReaberturaChamado") == null || form.getValue("cpReaberturaChamado") == "") { 
            msg += "- Ação do Solicitante (Finalizar, Reencaminhar ou Cancelar);\n"; 
        }
    }

    if (msg != "") { throw "Por favor, preencha os seguintes campos obrigatórios:\n\n" + msg; }
}