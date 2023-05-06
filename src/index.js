import express from "express";
//import { nextTemplateToken } from "sucrase/dist/types/parser/tokenizer";
const app = express();
app.use(express.json());

//FUNÇÃO PARA CRIAR ID'S PARA OS USUÁRIOS E RECADOS
let idUser = [];
let idNote = [];

function generateId(idArray) {
  //Vai fazer um push do ultimo valor do array + 1 (esse vai ser o ID atual)
  idArray.push(idArray.length + 1);

  // vai retornar sempre o ultimo valor incluso no array como ID
  return idArray[idArray.length - 1];
}

//FUNÇÃO PARA VALIDAR SE EMAIL JÁ FOI CADASTRADO ANTERIORMENTE
function validateEmail(email) {
  return users.some((userData) => userData.email === email);
}

//FUNÇÃO PRA VALIDAR SE ID DA NOTA ESTÁ NA LISTA DO USUARIO ATUAL
function noteBelongsToUser(user, id) {
  return user.notes.some((userNote) => userNote.id == id);
}

//BOAS VINDAS
app.get("/", (req, res) => {
  return res.status(400).json({
    Success: true,
    Data: null,
    Message:
      "Bem vindo ao CRUD de Recados. Crie sua conta ou faça login para acessar seus recados =D",
  });
});

//MIDDLEWARES PARA VALIDAR DADOS DA CONTA (deixei os nomes dos dados em pt-BR pra facilitar na hora de preencher os testes)
function validateNewName(req, res, next) {
  const userData = req.body;

  if (!userData.nome) {
    return res.status(400).json({
      Success: false,
      Data: null,
      Message: "Insira um nome válido.",
    });
  }

  next();
}

function validateNewEmail(req, res, next) {
  const userData = req.body;

  if (
    !userData.email ||
    !userData.email.includes("@") ||
    !userData.email.includes(".com")
  ) {
    return res.status(400).json({
      Success: false,
      Data: null,
      Message: "Insira um e-mail válido.",
    });
  }

  if (validateEmail(userData.email)) {
    return res.status(400).json({
      Success: false,
      Data: null,
      Message:
        "E-mail já cadastrado anteriormente. Eu sugeriria clicar em 'esqueci minha senha', mas não programei essa opção.",
    });
  }

  next();
}

function validateNewPassword(req, res, next) {
  const userData = req.body;

  if (!userData.senha || userData.senha.length < 6) {
    return res.status(400).json({
      Success: false,
      Data: null,
      Message:
        "Insira uma senha válida. (É preciso conter pelo menos 6 caracteres)",
    });
  }

  next();
}

//CRIAR CONTA
let users = [];

app.post(
  "/criar-conta",
  validateNewName,
  validateNewEmail,
  validateNewPassword,
  (req, res) => {
    let userData = req.body;

    userData.id = generateId(idUser);
    userData.notes = [];

    users.push(userData);

    return res.status(200).json({
      Success: true,
      Data: userData,
      Message: "Novo usuário cadastrado com sucesso.",
    });
  }
);

//MIDDLEWARE PARA GERENCIAR LOGIN
let currentUser = false;

function login(req, res, next) {
  const userLogin = req.body;

  if (!userLogin.email || !validateEmail(userLogin.email) || !userLogin.senha) {
    return res.status(400).json({
      Success: false,
      Data: null,
      Message: "E-mail ou senha inválidos. Tente novamente.",
    });
  }

  next();
}

//LOGIN - (Troca de usuário logado, caso seja feito outro login posteriormente)

app.post("/login", login, (req, res) => {
  const userLogin = req.body;

  const userIndex = users.findIndex((user) => user.email === userLogin.email);

  if (
    userLogin.email === users[userIndex].email &&
    userLogin.senha == users[userIndex].senha
  ) {
    currentUser = users[userIndex];

    return res.status(200).json({
      Success: true,
      Data: currentUser,
      Message: "Login realizado com sucesso! Seja bem vindo(a)",
    });
  } else {
    return res.status(400).json({
      Success: false,
      Data: null,
      Message: "E-mail ou senha inválidos. Tente novamente.",
    });
  }
});

//===============================================================================================================================================
//CRUD DE RECADOS //-----------------------------------------------------------------------------------------------------------------------------

//MIDDLEWARE PARA CHECAR SE USER ESTÁ LOGADO
function loggedUser(req, res, next) {
  if (!currentUser) {
    return res.status(400).json({
      Success: false,
      Data: null,
      Message: "Faça login para gerenciar suas notas.",
    });
  }

  next();
}

//MIDDLEWARE PRA VALIDAR DADOS DO RECADO
function validateNotesData(req, res, next) {
  const noteData = req.body;

  if (!noteData.titulo) {
    return res.status(400).json({
      Success: false,
      Data: null,
      Message: "É preciso incluir um titulo para salvar seu recado.",
    });
  }

  if (!noteData.descricao) {
    return res.status(400).json({
      Success: false,
      Data: null,
      Message: "Por favor, escreva algo no recado antes de salvar",
    });
  }

  next();
}

//CRIAR RECADO
app.post("/criar-recado", loggedUser, validateNotesData, (req, res) => {
  const noteData = req.body;

  noteData.id = generateId(idNote);

  currentUser.notes.push(noteData);

  return res.status(200).json({
    Success: true,
    Data: noteData,
    Message: "Novo recado criado com sucesso.",
  });
});

//LISTAR RECADOS
app.get("/listar-meus-recados", loggedUser, (req, res) => {
  return res.status(200).json({
    Success: true,
    Data: currentUser.notes,
    Message: "Listando com sucesso todas as notas do usuário atual.",
  });
});

//EDITAR RECADOS
app.put("/editar-recado/:id", loggedUser, (req, res) => {
  const newNoteData = req.body;
  const noteIndex = currentUser.notes.findIndex(
    (notes) => notes.id == req.params.id
  );

  if (!newNoteData) {
    return res.status(400).json({
      Success: false,
      Data: null,
      Message: "Nenhum dado para ser alterado",
    });
  }

  if (noteIndex == -1 || !noteBelongsToUser(currentUser, req.params.id))
    return res.status(404).json({
      Success: false,
      Data: null,
      Message: "Recado não encontrado.",
    });

  if (newNoteData.titulo) {
    currentUser.notes[noteIndex].titulo = newNoteData.titulo;
  }

  if (newNoteData.descricao) {
    currentUser.notes[noteIndex].descricao = newNoteData.descricao;
  }

  return res.status(200).json({
    Success: true,
    Data: currentUser.notes[noteIndex],
    Message: "Recado editado com sucesso.",
  });
});

//EXCLUIR RECADO
app.delete("/remover-recado/:id", loggedUser, (req, res) => {
  const noteIndex = currentUser.notes.findIndex(
    (note) => note.id == req.params.id
  );

  if (noteIndex == -1 || !noteBelongsToUser(currentUser, req.params.id))
    return res.status(404).json({
      Success: false,
      Data: null,
      Message: "Recado não encontrado",
    });

  currentUser.notes.splice(noteIndex, 1);

  return res.status(200).json({
    Success: true,
    Data: null,
    Message: "Recado removido com sucesso.",
  });
});

app.listen(8080, () => console.log("Servidor iniciado"));
