/* eslint-disable @typescript-eslint/no-require-imports */
// Executar: node --test tests/envios.test.cjs. Sem acesso ao banco ou Storage real.
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { test } = require("node:test");
const ts = require("typescript");
function carregar(arquivo, imports = {}) {
  const modulo = { exports: {} };
  const codigo = ts.transpileModule(fs.readFileSync(path.join(__dirname, "..", arquivo), "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  new Function("require", "module", "exports", codigo)(
    (nome) => nome === "server-only" ? {} : imports[nome] ?? require(nome), modulo, modulo.exports,
  );
  return modulo.exports;
}
const arquivos = carregar("lib/arquivos.ts");
const envios = carregar("lib/envios.ts", {
  "@/lib/arquivos": arquivos, "@/lib/aluno": {}, "@/lib/turmas": {},
  "@/lib/auth": {}, "@/lib/supabase/server": {},
});
const id = (n) => "00000000-0000-4000-8000-" + String(n).padStart(12, "0");
function ambiente(papel = "aluno", pessoa = 1) {
  const banco = {
    projeto_alunos: [{ projeto_id: id(10), aluno_id: id(1) }, { projeto_id: id(10), aluno_id: id(2) }],
    projetos: [{ id: id(10), turma_id: id(20), titulo: "TCC" }],
    turmas: [{ id: id(20), professor_id: id(3) }],
    entregas: [{ id: id(30), turma_id: id(20), status: "ativa" }],
    versoes: [], devolutivas: [],
  };
  const chamadas = [];
  const supabase = { from(tabela) {
    const filtros = [];
    let operacao = "SELECT", payload;
    const query = {
      select() { return query; },
      eq(k, v) { filtros.push((r) => r[k] === v); return query; },
      in(k, v) { filtros.push((r) => v.includes(r[k])); return query; },
      order() { return query; },
      returns() { return query; },
      insert(v) { operacao = "INSERT"; payload = v; return query; },
      async maybeSingle() { const r = await query; return { ...r, data: r.data[0] ?? null }; },
      async single() { return query.maybeSingle(); },
      then(resolve, reject) {
        chamadas.push({ tabela, operacao, payload });
        if (operacao === "INSERT") banco[tabela].push({ id: id(99), ...payload });
        return Promise.resolve({ data: banco[tabela].filter((r) => filtros.every((f) => f(r))), error: null }).then(resolve, reject);
      },
    };
    return query;
  }};
  return { banco, chamadas, context: { supabase, perfil: { id: id(pessoa), papel } } };
}
test("aluno sem projeto recebe lista vazia", async () => {
  const a = ambiente("aluno", 9);
  assert.deepEqual(await envios.projetosPermitidos(a.context), []);
});
test("entrega encerrada bloqueia envio", async () => {
  const a = ambiente(); a.banco.entregas[0].status = "encerrada";
  await assert.rejects(() => envios.validarEnvio(a.context, id(10), id(30)), /encerrada/);
});
test("ambos os integrantes acessam o projeto compartilhado", async () => {
  for (const pessoa of [1, 2]) {
    const a = ambiente("aluno", pessoa);
    assert.equal((await envios.projetoAutorizado(a.context, id(10))).id, id(10));
  }
});
test("professor sem acesso e aluno de projeto alheio são bloqueados", async () => {
  for (const papel of ["aluno", "professor"]) {
    const a = ambiente(papel, 9);
    await assert.rejects(() => envios.projetoAutorizado(a.context, id(10)), /sem acesso/);
  }
});
test("entrega de outra turma não pode receber arquivo", async () => {
  const a = ambiente(); a.banco.entregas[0].turma_id = id(88);
  await assert.rejects(() => envios.validarEnvio(a.context, id(10), id(30)), /indisponível/);
});
test("arquivo inválido: extensão, MIME, tamanho e vazio", () => {
  const valido = { name: "TCC.pdf", type: "application/pdf", size: 100 };
  assert.equal(arquivos.validarArquivo(valido), "");
  for (const diff of [{ name: "a.exe" }, { type: "text/plain" }, { size: 0 }, { size: arquivos.MAX_ARQUIVO + 1 }]) {
    assert.ok(arquivos.validarArquivo({ ...valido, ...diff }));
  }
  assert.equal(arquivos.nomeSeguro("../João TCC.pdf"), "Joao-TCC.pdf");
  assert.equal(arquivos.pathValido(id(10) + "/" + id(30) + "/" + id(40) + "-TCC.pdf", id(10), id(30)), true);
  assert.equal(arquivos.pathValido(id(10) + "/../" + id(40) + "-TCC.pdf", id(10), id(30)), false);
});
test("upload: apenas arquivo recém-enviado é removido ao falhar o registro", async () => {
  let enviado, removidos;
  const file = new File(["PDF"], "TCC.pdf", { type: "application/pdf" });
  const bucket = {
    async upload(p, f, options) { enviado = p; assert.equal(f, file); assert.equal(options.upsert, false); return { error: null }; },
    async remove(paths) { removidos = paths; return { error: null, data: [{ name: paths[0] }] }; },
  };
  const resultado = await arquivos.enviarArquivo({
    supabase: { storage: { from(b) { assert.equal(b, "tcc-arquivos"); return bucket; } } },
    file, projetoId: id(10), entregaId: id(30), preparar: async () => ({}),
    registrar: async () => ({ erro: "Registro falhou." }), progresso() {},
  });
  assert.deepEqual(removidos, [enviado]);
  assert.match(resultado.erro, /Registro falhou/);
  assert.equal(arquivos.pathValido(enviado, id(10), id(30)), true);
});
test("erro principal preservado se limpeza também falha", async () => {
  const resultado = await arquivos.enviarArquivo({
    supabase: { storage: { from() { return { upload: async () => ({ error: null }), remove: async () => ({ error: { message: "RLS bloqueou" } }) }; } } },
    file: new File(["PDF"], "a.pdf", { type: "application/pdf" }), projetoId: id(10), entregaId: id(30),
    preparar: async () => ({}), registrar: async () => ({ erro: "Registro falhou." }), progresso() {},
  });
  assert.match(resultado.erro, /Registro falhou/); assert.match(resultado.erro, /RLS bloqueou/);
});
test("pré-validação negada impede qualquer upload", async () => {
  const resultado = await arquivos.enviarArquivo({
    supabase: {}, file: new File(["PDF"], "a.pdf", { type: "application/pdf" }), projetoId: id(10), entregaId: id(30),
    preparar: async () => ({ erro: "Entrega encerrada." }), registrar: async () => assert.fail(), progresso() {},
  });
  assert.equal(resultado.erro, "Entrega encerrada.");
});
