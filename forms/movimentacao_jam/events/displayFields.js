function displayFields(form, customHTML) {
    form.setShowDisabledFields(true);
    form.setHidePrintLink(true);

    // Captura a atividade. Se vier vazia (novo processo não guardado), força o valor para 0
    var atividadeStr = getValue("WKNumState");
    var atividade = (atividadeStr != null && atividadeStr != "") ? parseInt(atividadeStr) : 0;
    
    var utilizador = getValue("WKUser");
    var numProcesso = getValue("WKNumProces");

    // =========================================================
    // NÚMERO DA SOLICITAÇÃO
    // =========================================================
    if (numProcesso != null && numProcesso > 0) {
        form.setValue("nSolicitacao", numProcesso);
    }

    // =========================================================
    // INÍCIO (0 ou 3) - Oculta os painéis usando CSS forçado
    // =========================================================
    if (atividade == 0 || atividade == 3) {
        var sdf = new java.text.SimpleDateFormat("dd/MM/yyyy");
        form.setValue("dataAbertura", sdf.format(new java.util.Date()));

        var filter = new java.util.HashMap();
        filter.put("colleaguePK.colleagueId", utilizador);
        var colleague = getDatasetValues("colleague", filter);
        
        if (colleague.size() > 0) {
            form.setValue("solicitante", colleague.get(0).get("colleagueName"));
            var email = colleague.get(0).get("mail");
            if (email != null) { form.setValue("emailSolicitante", email); }
        }

        // INJEÇÃO DE CSS (Garante que os painéis não aparecem de forma alguma)
        customHTML.append("<style>");
        customHTML.append("  #divAnalise, #divReabertura, #painelAprovacao { display: none !important; }");
        customHTML.append("</style>");
    }

    // =========================================================
    // RESPOSTA RH (Atividade 4)
    // =========================================================
    if (atividade == 4) {
        var filter = new java.util.HashMap();
        filter.put("colleaguePK.colleagueId", utilizador);
        var colleague = getDatasetValues("colleague", filter);
        if (colleague.size() > 0) {
            form.setValue("cpRespGestor2", colleague.get(0).get("colleagueName"));
        }

        // Oculta Reabertura e Aprovação (mantém apenas a Resposta RH)
        customHTML.append("<style>");
        customHTML.append("  #divReabertura, #painelAprovacao { display: none !important; }");
        customHTML.append("</style>");
    }

    // =========================================================
    // CORREÇÃO DA SOLICITAÇÃO (Atividade 6)
    // =========================================================
    if (atividade == 6) {
        customHTML.append("<style>");
        customHTML.append("  #divReabertura, #painelAprovacao { display: none !important; }");
        customHTML.append("</style>");
        
        customHTML.append("<script>$(function() { ");
        customHTML.append("  $('#cpDecisaoRH').css('pointer-events', 'none').attr('readonly', true); ");
        customHTML.append("  $('#cpParecercol2').attr('readonly', true); ");
        customHTML.append("});</script>");
    }

    // =========================================================
    // RESPOSTA SOLICITAÇÃO / AÇÃO FINAL (Atividade 11)
    // =========================================================
    if (atividade == 11) {
        customHTML.append("<style>");
        customHTML.append("  #painelAprovacao { display: none !important; }");
        customHTML.append("</style>");

        customHTML.append("<script>$(function() { ");
        customHTML.append("  $('#cpDecisaoRH').css('pointer-events', 'none').attr('readonly', true); ");
        customHTML.append("  $('#cpParecercol2').attr('readonly', true); ");
        customHTML.append("});</script>");
    }
}