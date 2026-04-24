function validateForm(form) {
    var atividade = parseInt(getValue("WKNumState"));
    var msg = "";

    // =========================================================
    // INÍCIO (0 ou 3) E CORREÇÃO (6)
    // =========================================================
    if (atividade == 0 || atividade == 3 || atividade == 6) { 
        if (form.getValue("nomeColaborador") == null || form.getValue("nomeColaborador") == "") { msg += "- Nome do Colaborador;\n"; }
        if (form.getValue("matricula") == null || form.getValue("matricula") == "") { msg += "- Matrícula;\n"; }
        if (form.getValue("dataAdmissao") == null || form.getValue("dataAdmissao") == "") { msg += "- Data da Admissão;\n"; }
        if (form.getValue("empresaColaborador") == null || form.getValue("empresaColaborador") == "") { msg += "- Empresa do Colaborador;\n"; }
        if (form.getValue("deptoObraColaborador") == null || form.getValue("deptoObraColaborador") == "") { msg += "- Dpto/Obra do Colaborador;\n"; }
        if (form.getValue("dataMudanca") == null || form.getValue("dataMudanca") == "") { msg += "- Data de Mudança;\n"; }
    }

    // =========================================================
    // RESPOSTA RH (Atividade 4)
    // =========================================================
    if (atividade == 4) { 
        if (form.getValue("cpDecisaoRH") == null || form.getValue("cpDecisaoRH") == "") { 
            msg += "- Decisão (Enviar solução ou Devolver);\n"; 
        }
        if (form.getValue("cpDecisaoRH") == "Incorreto" && (form.getValue("cpParecercol2") == null || form.getValue("cpParecercol2") == "")) { 
            msg += "- É obrigatório preencher o Parecer do RH justificando a devolução.\n"; 
        }
    }

    // =========================================================
    // AÇÃO SOLICITANTE / REABERTURA (Atividade 11)
    // =========================================================
    if (atividade == 11) {
        if (form.getValue("cpReaberturaChamado") == null || form.getValue("cpReaberturaChamado") == "") { 
            msg += "- Ação do Solicitante (Finalizar, Reencaminhar ou Cancelar);\n"; 
        }
    }

    if (msg != "") {
        throw "Por favor, preencha os seguintes campos obrigatórios:\n\n" + msg;
    }
}