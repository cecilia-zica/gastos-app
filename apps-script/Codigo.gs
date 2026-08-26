/**
 * wert — sync de mão única (app -> planilha).
 *
 * Cola este código na planilha SANDBOX:
 *   Extensões > Apps Script > cole aqui > Salvar.
 * Depois: Implantar > Nova implantação > Tipo "App da Web":
 *   - Executar como: EU (sua conta)
 *   - Quem tem acesso: Qualquer pessoa
 *   Copie a URL do app da web e me mande.
 *
 * TROQUE o SEGREDO abaixo por uma frase secreta sua (qualquer texto).
 * Me mande o mesmo segredo — o app usa ele pra provar que é você.
 *
 * O app manda cada lançamento pra aba "Lançamentos (App)" (criada
 * automaticamente). Ações: create, update, delete — casadas pelo id.
 */

var SEGREDO = "TROQUE-ESTE-SEGREDO";
var ABA = "Lançamentos (App)";
var CABECALHO = ["id", "Data", "Descrição", "Valor", "Categoria", "Pagamento"];

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.secret !== SEGREDO) return _json({ ok: false, error: "segredo inválido" });

    var acao = body.action;
    var g = body.expense || {};
    if (acao === "create") _create(g);
    else if (acao === "update") _update(g);
    else if (acao === "delete") _delete(g.id);
    else return _json({ ok: false, error: "ação desconhecida: " + acao });

    return _json({ ok: true });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

function _sheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(ABA);
  if (!sh) {
    sh = ss.insertSheet(ABA);
    sh.appendRow(CABECALHO);
    sh.setFrozenRows(1);
  }
  return sh;
}

/** Linha (1-indexada) do id, ou -1. */
function _rowById(sh, id) {
  var ids = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 0), 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2;
  }
  return -1;
}

function _row(g) {
  return [g.id, g.date, g.description || "", (g.amountCents || 0) / 100, g.category, g.payment];
}

function _create(g) {
  var sh = _sheet();
  if (_rowById(sh, g.id) !== -1) return _update(g); // idempotente
  sh.appendRow(_row(g));
}

function _update(g) {
  var sh = _sheet();
  var r = _rowById(sh, g.id);
  if (r === -1) { sh.appendRow(_row(g)); return; }
  sh.getRange(r, 1, 1, CABECALHO.length).setValues([_row(g)]);
}

function _delete(id) {
  var sh = _sheet();
  var r = _rowById(sh, id);
  if (r !== -1) sh.deleteRow(r);
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Rode uma vez pra testar sem o app (menu: Executar > _teste). */
function _teste() {
  _create({ id: "teste-1", date: "24/08/2026", description: "café teste", amountCents: 990, category: "Lanches/cafés", payment: "Pix" });
}
