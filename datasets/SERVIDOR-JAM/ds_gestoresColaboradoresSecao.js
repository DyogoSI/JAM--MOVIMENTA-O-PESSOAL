function createDataset(fields, constraints, sortFields) {
    var dataset = DatasetBuilder.newDataset();

    try {
        var folderId = 151; 
        var fileName = "GESTORES COLABORADORES POR SECAO.CSV"; 
        
        var adminUser = "jam-engenharia"; 
        var adminPass = "empresa2jam";  
        
        var documentId = null;
        var version = null;
        var companyId = null;
        var physicalFile = null;

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

        var byteContent = service.getDocumentContent(jUser, jPass, jCompanyId, jDocumentId, jUser, jVersion, jPhysical);

        if (byteContent == null || byteContent.length === 0) {
            throw "O arquivo CSV foi encontrado, mas seu conteúdo está vazio.";
        }

        var textoJava = new java.lang.String(byteContent, "ISO-8859-1"); 
        var textoJS = String(textoJava);
        
        var linhas = textoJS.split(/\r?\n/);
        var isFirstLine = true;
        var colCount = 0;
        var colIndices = {}; 

        for (var i = 0; i < linhas.length; i++) {
            var line = String(linhas[i]).trim();
            if (line === "") continue;

            var columns = line.split(";");

            if (isFirstLine) {
                colCount = columns.length;
                for (var c = 0; c < colCount; c++) {
                    // Limpeza rigorosa: remove aspas, espaços e BOM (caracteres invisíveis de CSV)
                    var colName = String(columns[c]).replace(/^"|"$/g, '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim().toUpperCase();
                    dataset.addColumn(colName);
                    colIndices[colName] = c;
                }
                isFirstLine = false;
            } else {
                var rowData = new Array();
                for (var c = 0; c < colCount; c++) {
                    var val = (c < columns.length && columns[c] != null) ? String(columns[c]).replace(/^"|"$/g, '').trim() : "";
                    rowData.push(val);
                }

                var addRow = true;
                
                if (constraints != null && constraints.length > 0) {
                    for (var x = 0; x < constraints.length; x++) {
                        var fieldName = "";
                        var initialValue = "";
                        
                        // Tenta ler a constraint de forma compatível com a API Java e Rhino do Fluig
                        try {
                            fieldName = String(constraints[x].getFieldName()).toUpperCase();
                            initialValue = String(constraints[x].getInitialValue()).trim().toUpperCase();
                        } catch(e) {
                            fieldName = String(constraints[x].fieldName).toUpperCase();
                            initialValue = String(constraints[x].initialValue).trim().toUpperCase();
                        }
                        
                        if (fieldName === "SQLLIMIT") continue;
                        
                        if (colIndices[fieldName] !== undefined) {
                            var rowValue = String(rowData[colIndices[fieldName]]).trim().toUpperCase();
                            
                            // Trocado de indexOf para !== para garantir igualdade exata e evitar falsos positivos
                            if (rowValue !== initialValue) {
                                addRow = false;
                                break; 
                            }
                        }
                    }
                }

                if (addRow) {
                    dataset.addRow(rowData);
                }
            }
        }

    } catch (e) {
        dataset.addColumn("ERRO");
        dataset.addRow([e.toString()]);
        log.error("--- ERRO DATASET GESTORES POR SECAO SOAP: " + e.toString());
    }

    return dataset;
}