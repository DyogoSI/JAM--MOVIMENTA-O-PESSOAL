function createDataset(fields, constraints, sortFields) {
    var dataset = DatasetBuilder.newDataset();

    try {
        // --- 1. Parâmetros da Busca ---
        var folderId = 151; // Código da pasta "Integração RM"
        var fileName = "EVENTOS ADICIONAIS RESCISOES.CSV"; // NOVO ARQUIVO ALVO
        
        // Credenciais do seu usuário integrador (que tenha permissão na pasta 151)
        var adminUser = "jam-engenharia"; 
        var adminPass = "empresa2jam";  
        
        var documentId = null;
        var version = null;
        var companyId = null;
        var physicalFile = null;

        // --- 2. Percorrer a pasta 151 buscando o arquivo pelo Nome ---
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

        // --- 3. Conectar no Serviço SOAP ---
        var provider = ServiceManager.getService("ECMDocumentService");
        if (provider == null) {
            throw "Serviço 'ECMDocumentService' não cadastrado no Fluig.";
        }
        var locator = provider.instantiate("com.totvs.technology.ecm.dm.ws.ECMDocumentServiceService");
        var service = locator.getDocumentServicePort();

        // --- 4. Conversão para Tipos Primitivos do Java ---
        var jCompanyId = new java.lang.Integer(parseInt(companyId.toString())).intValue();
        var jDocumentId = new java.lang.Integer(parseInt(documentId.toString())).intValue();
        var jVersion = new java.lang.Integer(parseInt(version.toString())).intValue();
        
        var jUser = new java.lang.String(adminUser);
        var jPass = new java.lang.String(adminPass);
        var jPhysical = new java.lang.String(physicalFile);

        // --- 5. Baixar o arquivo ---
        var byteContent = service.getDocumentContent(
            jUser, jPass, jCompanyId, jDocumentId, jUser, jVersion, jPhysical
        );

        if (byteContent == null || byteContent.length === 0) {
            throw "O arquivo CSV foi encontrado, mas seu conteúdo está vazio.";
        }

        // --- 6. Converter o conteúdo para Texto ---
        // ISO-8859-1 manterá os acentos como 13º, PRÉVIO e CONTRIBUIÇÃO intactos
        var textoJava = new java.lang.String(byteContent, "ISO-8859-1"); 
        var textoJS = String(textoJava);
        
        // --- 7. Processar o CSV ---
        var linhas = textoJS.split(/\r?\n/);
        var isFirstLine = true;
        var colCount = 0;
        
        // Variáveis para guardar as posições das colunas que queremos alterar
        var idxProvDescBase = -1;
        var idxValHorDiaRef = -1;

        for (var i = 0; i < linhas.length; i++) {
            var line = String(linhas[i]).trim();
            
            // Ignora linhas em branco
            if (line === "") continue;

            var columns = line.split(";");

            if (isFirstLine) {
                // Cria as colunas baseadas no cabeçalho (CODIGO, DESCRICAO, PROVDESCBASE, VALHORDIAREF)
                colCount = columns.length;
                for (var c = 0; c < colCount; c++) {
                    var colName = String(columns[c]).replace(/^"|"$/g, '').trim();
                    dataset.addColumn(colName);
                    
                    // Identifica o índice (posição) das colunas que precisam de tratamento
                    var colNameUpper = colName.toUpperCase();
                    if (colNameUpper === "PROVDESCBASE") {
                        idxProvDescBase = c;
                    } else if (colNameUpper === "VALHORDIAREF") {
                        idxValHorDiaRef = c;
                    }
                }
                isFirstLine = false;
            } else {
                // Preenche as linhas de dados dos Eventos Adicionais
                var rowData = new Array();
                for (var c = 0; c < colCount; c++) {
                    var val = (c < columns.length && columns[c] != null) ? String(columns[c]).replace(/^"|"$/g, '').trim() : "";
                    
                    // Tratamento para a coluna PROVDESCBASE
                    if (c === idxProvDescBase && val !== "") {
                        var valUpper = val.toUpperCase();
                        if (valUpper === "P") {
                            val = "PROVENTOS";
                        } else if (valUpper === "D") {
                            val = "DESCONTO";
                        } else if (valUpper === "B") {
                            val = "B"; // Deixando o B intacto como solicitado
                        }
                    }
                    
                    // Tratamento para a coluna VALHORDIAREF
                    if (c === idxValHorDiaRef && val !== "") {
                        var valUpper = val.toUpperCase();
                        if (valUpper === "H") {
                            val = "HORA";
                        } else if (valUpper === "D") {
                            val = "DIA";
                        } else if (valUpper === "V") {
                            val = "VALOR";
                        }
                    }

                    rowData.push(val);
                }
                dataset.addRow(rowData);
            }
        }

    } catch (e) {
        dataset.addColumn("ERRO");
        dataset.addRow([e.toString()]);
        log.error("--- ERRO DATASET EVENTOS RESCISOES SOAP: " + e.toString());
    }

    return dataset;
}