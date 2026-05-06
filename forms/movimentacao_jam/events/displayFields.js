function displayFields(form, customHTML) {
    form.setShowDisabledFields(true);
    form.setHidePrintLink(true);
    var atividade = parseInt(getValue("WKNumState"));
    var utilizador = getValue("WKUser");
    var numProcesso = getValue("WKNumProces");

    // INJETA AS VARIÁVEIS PARA O HTML EXECUTAR O CONGELAMENTO SEGURO
    customHTML.append("<script>");
    customHTML.append("  var ATIVIDADE_ATUAL = " + atividade + ";");
    customHTML.append("  var MODO_FORMULARIO = '" + form.getFormMode() + "';");
    customHTML.append("</script>");

    if (numProcesso != null && numProcesso > 0) {
        form.setValue("nSolicitacao", numProcesso);
    }

    if (atividade == 0 || atividade == 3) {
        var sdf = new java.text.SimpleDateFormat("dd/MM/yyyy");
        form.setValue("dataAbertura", sdf.format(new java.util.Date()));
        var filter = new java.util.HashMap();
        filter.put("colleaguePK.colleagueId", utilizador);
        var colleague = getDatasetValues("colleague", filter);
        
        if (colleague.size() > 0) {
            form.setValue("solicitante", colleague.get(0).get("colleagueName"));
        }
        
        customHTML.append("<script>$(function() { ");
        customHTML.append("  $('#divAnalise').hide(); ");
        customHTML.append("  $('#divReabertura').hide(); ");
        customHTML.append("  $('#divCheckList').hide(); ");
        customHTML.append("});</script>");
    }

    if (atividade == 4) {
        var filter = new java.util.HashMap();
        filter.put("colleaguePK.colleagueId", utilizador);
        var colleague = getDatasetValues("colleague", filter);
        if (colleague.size() > 0) {
            form.setValue("cpRespGestor2", colleague.get(0).get("colleagueName"));
        }
        customHTML.append("<script>$(function() { $('#divReabertura').hide(); });</script>");
    }

    if (atividade == 6) {
        customHTML.append("<script>$(function() { $('#divReabertura').hide(); });</script>");
    }
}