# CRUD DE RECADOS
## Trabalho de conclusão de módulo Back-End 1 no programa de formação Full Stack Web da GrowDev.

API que permite criar conta, fazer login e gerenciar recados, criando, visualizando, editando e excluindo.

Desenvolvido em Node JS, utilizando Express.

# Rotas

### /
Boas vindas

### /criar-conta  
Cria nova conta solicitando: nome, email, senha.

### /login
Permite logar, solicitando: email, senha.

### /criar-recado
Cria novo recado, solicitando: titulo, descricao. <br>
Precisa estar logado.

### /listar-meus-recados
Lista os recados do usuário atual logado.

### /editar-recado/:id
Permite editar os recados do usuário atual logado. <br>
É preciso passar o ID do recado por parâmetro

### /remover-recado/:id
Permite excluir um recado do usuário atual logado <br>
É preciso passar o ID do recado por parâmetro

### API rodando na url: https://crud-recados-backend1.onrender.com/

