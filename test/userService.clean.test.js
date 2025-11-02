const { UserService } = require("../src/userService");

const dadosUsuarioPadrao = {
  nome: "Fulano de Tal",
  email: "fulano@teste.com",
  idade: 25,
};

describe("UserService - Suíte de Testes Refatorada (AAA, Sem Smells)", () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  describe("Criação e busca de usuário", () => {
    test("deve criar um usuário com ID definido", () => {
      const usuarioCriado = userService.createUser(
        dadosUsuarioPadrao.nome,
        dadosUsuarioPadrao.email,
        dadosUsuarioPadrao.idade,
      );
      expect(usuarioCriado.id).toBeDefined();
    });

    test("deve retornar usuário com dados corretos ao buscar por ID", () => {
      const usuarioCriado = userService.createUser(
        dadosUsuarioPadrao.nome,
        dadosUsuarioPadrao.email,
        dadosUsuarioPadrao.idade,
      );

      const usuarioBuscado = userService.getUserById(usuarioCriado.id);

      expect(usuarioBuscado.nome).toBe(dadosUsuarioPadrao.nome);
      expect(usuarioBuscado.status).toBe("ativo");
    });
  });

  describe("Desativação de usuários", () => {
    test("deve desativar usuário comum e retornar true", () => {
      const usuario = userService.createUser("Comum", "comum@teste.com", 30);

      const resultado = userService.deactivateUser(usuario.id);
      const usuarioAtualizado = userService.getUserById(usuario.id);

      expect(resultado).toBe(true);
      expect(usuarioAtualizado.status).toBe("inativo");
    });

    test("não deve desativar usuário administrador e deve retornar false", () => {
      const admin = userService.createUser(
        "Admin",
        "admin@teste.com",
        40,
        true,
      );

      const resultado = userService.deactivateUser(admin.id);
      const usuarioAtualizado = userService.getUserById(admin.id);

      expect(resultado).toBe(false);
      expect(usuarioAtualizado.status).toBe("ativo");
    });
  });

  describe("Relatório de usuários", () => {
    test("deve incluir usuário específico no relatório com nome e status corretos", () => {
      const usuario = userService.createUser("Alice", "alice@email.com", 28);
      userService.createUser("Bob", "bob@email.com", 32); // outro usuário

      const relatorio = userService.generateUserReport();

      expect(relatorio).toContain(`Nome: Alice`);
      expect(relatorio).toContain(`Status: ativo`);
      expect(relatorio).toContain(`ID: ${usuario.id}`);
    });

    test("deve iniciar relatório com cabeçalho correto", () => {
      userService.createUser("Alice", "alice@email.com", 28);

      const relatorio = userService.generateUserReport();

      expect(relatorio.startsWith("--- Relatório de Usuários ---")).toBe(true);
    });
  });

  describe("Validação de idade", () => {
    test("deve lançar erro ao tentar criar usuário menor de idade", () => {
      expect(() =>
        userService.createUser("Menor", "menor@email.com", 17),
      ).toThrow("O usuário deve ser maior de idade.");
    });
  });

  describe("Lista de usuários vazia", () => {
    test("deve retornar apenas o cabeçalho e mensagem de vazio quando não há usuários", () => {
      const relatorio = userService.generateUserReport();

      const linhas = relatorio
        .trim()
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      expect(linhas[0]).toBe("--- Relatório de Usuários ---");
      expect(linhas).toHaveLength(2);
      expect(linhas[1]).toBe("Nenhum usuário cadastrado.");

      expect(relatorio).not.toMatch(/ID:|Nome:|Status:/);
    });
  });
});
