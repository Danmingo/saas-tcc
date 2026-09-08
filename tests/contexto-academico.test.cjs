/* eslint-disable @typescript-eslint/no-require-imports */
// node --test tests/contexto-academico.test.cjs — doubles locais; não valida RLS real.
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

function carregar(arquivo, imports = {}) {
  const modulo = { exports: {} };
  const codigo = ts.transpileModule(fs.readFileSync(path.join(__dirname, "..", arquivo), "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  new Function("require", "module", "exports", codigo)(
    (nome) => imports[nome] ?? require(nome), modulo, modulo.exports,
  );
  return modulo.exports;
}
const helpers = carregar("lib/contexto-academico.ts");
const projetoId = "00000000-0000-4000-8000-000000000010";
function ambiente({ alunoId = "membro-1", vinculado = true, motivo = "atualizado", erro = null, papel = "aluno", dados } = {}) {
  const chamadas = [], filtros = [], revalidacoes = [];
  const supabase = {
    from(tabela) {
      assert.equal(tabela, "projeto_alunos");
      const consulta = {
        select() { return consulta; },
        eq(campo, valor) { filtros.push([campo, valor]); return consulta; },
        async maybeSingle() { return { data: vinculado ? { projeto_id: projetoId } : null, error: null }; },
      };
      return consulta;
    },
    async rpc(nome, payload) { chamadas.push({ nome, payload }); return { data: dados === undefined ? { motivo } : dados, error: erro }; },
  };
  const actions = carregar("app/aluno/meu-projeto/actions.ts", {
    "@/lib/contexto-academico": helpers,
    "@/lib/aluno": { async getAlunoContext() { if (papel !== "aluno") throw new Error("acesso negado"); return { supabase, aluno: { id: alunoId } }; } },
    "next/cache": { revalidatePath(p) { revalidacoes.push(p); } },
    "next/navigation": { redirect() { assert.fail("redirect inesperado"); } },
  });
  return { chamadas, filtros, revalidacoes, salvar: (form = formulario(), id = projetoId) => actions.atualizarContextoAcademicoProjetoAluno(id, {}, form) };
}
function formulario(valores = {}) {
  const form = new FormData();
  for (const [nome, valor] of Object.entries({ grande_area: " Ciências da Saúde ", curso: " Farmácia ", palavras_chave: " hipertensão, , adesão , atenção farmacêutica,", ...valores })) form.set(nome, valor);
  return form;
}

test("ambos os membros salvam contexto no mesmo projeto sem identidade do cliente no payload", async () => {
  for (const alunoId of ["membro-1", "membro-2"]) {
    const a = ambiente({ alunoId });
    assert.deepEqual(await a.salvar(formulario({ aluno_id: "outro", professor_id: "outro" })), { sucesso: true });
    assert.deepEqual(a.filtros, [["projeto_id", projetoId], ["aluno_id", alunoId]]);
    assert.deepEqual(a.chamadas, [{ nome: "atualizar_contexto_academico_projeto_aluno", payload: {
      projeto_uuid: projetoId, grande_area_texto: "Ciências da Saúde", curso_texto: "Farmácia",
      subarea_texto: null, linha_pesquisa_texto: null, tipo_trabalho_texto: null,
      palavras_chave_texto: ["hipertensão", "adesão", "atenção farmacêutica"],
    } }]);
    assert.deepEqual(a.revalidacoes, ["/aluno/meu-projeto", `/professor/projetos/${projetoId}`]);
  }
});
test("obrigatórios, espaços, arquivos e 13 palavras são rejeitados antes da RPC", async () => {
  for (const valores of [{ grande_area: " " }, { curso: "" }, { curso: new File(["x"], "x.txt") }, { palavras_chave: Array.from({ length: 13 }, (_, n) => `p${n}`).join(",") }]) {
    const a = ambiente();
    assert.ok((await a.salvar(formulario(valores))).erro);
    assert.equal(a.chamadas.length, 0);
  }
});
test("aceita 12 palavras, lista vazia e valores fora das sugestões", async () => {
  for (const palavras of [", ,", Array.from({ length: 12 }, (_, n) => `p${n}`).join(",")]) {
    const a = ambiente();
    assert.equal((await a.salvar(formulario({ palavras_chave: palavras, grande_area: "Área livre", tipo_trabalho: "Dissertação" }))).sucesso, true);
    assert.equal(a.chamadas[0].payload.tipo_trabalho_texto, "Dissertação");
    assert.equal(a.chamadas[0].payload.palavras_chave_texto.length, palavras === ", ," ? 0 : 12);
  }
});
test("sem participação, professor e UUID inválido não chamam RPC", async () => {
  const semAcesso = ambiente({ vinculado: false });
  assert.match((await semAcesso.salvar()).erro, /sem acesso/);
  assert.equal(semAcesso.chamadas.length, 0);
  const professor = ambiente({ papel: "professor" });
  await assert.rejects(() => professor.salvar(), /acesso negado/);
  assert.equal(professor.chamadas.length, 0);
  const invalido = ambiente();
  assert.ok((await invalido.salvar(formulario(), "-".repeat(36))).erro);
  assert.equal(invalido.chamadas.length, 0);
});
test("todos os motivos de falha, resposta desconhecida e erro de transporte impedem sucesso", async () => {
  for (const motivo of ["nao_autenticado", "papel_invalido", "sem_acesso", "grande_area_obrigatoria", "curso_obrigatorio", "muitas_palavras_chave", "palavra_chave_muito_longa", "campo_muito_longo", "projeto_inexistente", "desconhecido"]) {
    const a = ambiente({ motivo });
    assert.ok((await a.salvar()).erro, motivo);
    assert.deepEqual(a.revalidacoes, []);
  }
  for (const config of [{ dados: null }, { erro: { message: "falha" } }]) assert.ok((await ambiente(config).salvar()).erro);
  assert.equal((await ambiente({ dados: [{ motivo: "atualizado" }] }).salvar()).sucesso, true);
});
test("contexto vazio e contexto salvo renderizam em somente leitura", () => {
  const Componente = carregar("app/components/ContextoAcademico.tsx", { "@/lib/contexto-academico": helpers }).default;
  const vazio = { grande_area: null, curso: null, subarea: null, linha_pesquisa: null, tipo_trabalho: null, palavras_chave: [] };
  const render = (contexto) => renderToStaticMarkup(React.createElement(Componente, { contexto }));
  assert.match(render(vazio), /Contexto acadêmico ainda não informado/);
  const html = render({ ...vazio, curso: "Farmácia", palavras_chave: ["hipertensão", "adesão"] });
  assert.match(html, /Farmácia/);
  assert.match(html, /hipertensão, adesão/);
  assert.doesNotMatch(html, /<form|<input|<button/);
});
