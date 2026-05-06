function createDataset(fields, constraints, sortFields) {
    var dataset = DatasetBuilder.newDataset();

    // --- 1. CAPTURAR OS FILTROS (CONSTRAINTS) ENVIADOS PELO FORMULÁRIO ---
    var filtroCodHorario = null;
    var filtroCodColigada = null;

    if (constraints != null && constraints.length > 0) {
        for (var c = 0; c < constraints.length; c++) {
            if (constraints[c].fieldName.toUpperCase() == "CODHORARIO") {
                filtroCodHorario = String(constraints[c].initialValue).trim();
            }
            if (constraints[c].fieldName.toUpperCase() == "CODCOLIGADA") {
                filtroCodColigada = String(constraints[c].initialValue).trim();
            }
        }
    }

    try {
        // --- 2. Parâmetros da Busca ---
        var folderId = 151; // Código da pasta "Integração RM"
        var fileName = "IND_HOR.CSV"; // Arquivo que queremos achar
        
        var adminUser = "jam-engenharia"; 
        var adminPass = "empresa2jam";  
        
        var documentId = null;
        var version = null;
        var companyId = null;
        var physicalFile = null;

        // --- 3. Percorrer a pasta 151 buscando o arquivo pelo Nome ---
        var c1 = DatasetFactory.createConstraint("parentDocumentId", folderId, folderId, ConstraintType.MUST);
        var c2 = DatasetFactory.createConstraint("activeVersion", "true", "true", ConstraintType.MUST);
        var c3 = DatasetFactory.createConstraint("deleted", "false", "false", ConstraintType.MUST);
        var dsDocs = DatasetFactory.getDataset("document", null, [c1, c2, c3], null);

        if (dsDocs != null && dsDocs.rowsCount > 0) {
            for (var i = 0; i < dsDocs.rowsCount; i++) {
                var docDesc = String(dsDocs.getValue(i, "documentDescription")).toUpperCase();
                var fileDesc = String(dsDocs.getValue(i, "phisicalFile")).toUpperCase();

                if (docDesc === fileName.toUpperCase() || fileDesc === fileName.toUpperCase()) {
                    documentId = dsDocs.getValue(i, "documentPK.documentId");
                    version = dsDocs.getValue(i, "documentPK.version");
                    companyId = dsDocs.getValue(i, "documentPK.companyId");
                    physicalFile = dsDocs.getValue(i, "phisicalFile");
                    break;
                }
            }
        }

        if (documentId == null) {
            throw "Arquivo '" + fileName + "' não encontrado dentro da pasta " + folderId;
        }

        // --- 4. Conectar no Serviço SOAP ---
        var provider = ServiceManager.getService("ECMDocumentService");
        if (provider == null) {
            throw "Serviço 'ECMDocumentService' não cadastrado no Fluig.";
        }
        var locator = provider.instantiate("com.totvs.technology.ecm.dm.ws.ECMDocumentServiceService");
        var service = locator.getDocumentServicePort();

        var jCompanyId = new java.lang.Integer(parseInt(companyId.toString())).intValue();
        var jDocumentId = new java.lang.Integer(parseInt(documentId.toString())).intValue();
        var jVersion = new java.lang.Integer(parseInt(version.toString())).intValue();
        
        var jUser = new java.lang.String(adminUser);
        var jPass = new java.lang.String(adminPass);
        var jPhysical = new java.lang.String(physicalFile);

        var byteContent = service.getDocumentContent(
            jUser, jPass, jCompanyId, jDocumentId, jUser, jVersion, jPhysical
        );

        if (byteContent == null || byteContent.length === 0) {
            throw "O arquivo CSV foi encontrado, mas seu conteúdo está vazio.";
        }

        var textoJava = new java.lang.String(byteContent, "ISO-8859-1"); 
        var textoJS = String(textoJava);
        
        // --- 5. Processar o CSV e Aplicar os Filtros ---
        var linhas = textoJS.split(/\r?\n/);
        var isFirstLine = true;
        var colCount = 0;
        
        // Variáveis para guardar os índices dinâmicos das colunas que vamos validar
        var idxCodHorario = -1;
        var idxCodColigada = -1;

        for (var i = 0; i < linhas.length; i++) {
            var line = String(linhas[i]).trim();
            if (line === "") continue;

            var columns = line.split(";");

            if (isFirstLine) {
                colCount = columns.length;
                for (var c = 0; c < colCount; c++) {
                    var colName = String(columns[c]).replace(/^"|"$/g, '').trim();
                    dataset.addColumn(colName);
                    
                    // Descobrindo em que posição estão as colunas de validação
                    if (colName.toUpperCase() === "CODHORARIO") idxCodHorario = c;
                    if (colName.toUpperCase() === "CODCOLIGADA") idxCodColigada = c;
                }
                isFirstLine = false;
            } else {
                var rowData = new Array();
                var rowCodHorario = "";
                var rowCodColigada = "";

                for (var c = 0; c < colCount; c++) {
                    var val = (c < columns.length && columns[c] != null) ? String(columns[c]).replace(/^"|"$/g, '').trim() : "";
                    rowData.push(val);
                    
                    // Captura os valores desta linha específica do CSV para a validação
                    if (c === idxCodHorario) rowCodHorario = val;
                    if (c === idxCodColigada) rowCodColigada = val;
                }

                // --- 6. VALIDAÇÃO DO FILTRO (A Mágica acontece aqui) ---
                var adicionarLinha = true;
                
                if (filtroCodHorario != null && rowCodHorario !== filtroCodHorario) {
                    adicionarLinha = false; // Ignora se for de um horário diferente
                }
                if (filtroCodColigada != null && rowCodColigada !== filtroCodColigada) {
                    adicionarLinha = false; // Ignora se for de uma coligada diferente
                }

                // Só adiciona a linha ao retorno se passar pelas exigências do filtro
                if (adicionarLinha) {
                    dataset.addRow(rowData);
                }
            }
        }

    } catch (e) {
        dataset.addColumn("ERRO");
        dataset.addRow([e.toString()]);
        log.error("--- ERRO DATASET LER CSV SOAP: " + e.toString());
    }

    return dataset;
}