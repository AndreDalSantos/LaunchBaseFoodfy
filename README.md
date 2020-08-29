<h1 style="text-align: center">Foodfy</h1>

<div align="center">
    <img src="./public/Foodfy.gif">
</div>

<h3 align="center">Projeto desenvolvido no curso Launchbase da <a href="https://rocketseat.com.br/launchbase">Rocketseat</a></h3>

---
## 🔖 Sobre

O **Foodfy** consiste em uma aplicação onde um usuário logado (área exclusiva) pode cadastrar chefs com nome e um avatar para cada um, também pode cadastrar receitas com título da receita, igredientes, modo de preparo, outras informações e imagens para esta receita. Na área de visitantes, um visitante pode visualizar uma listagem das receitas cadastradas, e também visualizar detalhes de uma receita escolhida como, imagens, ingredientes, modo de preparo, informações e o nome do autor da receita.

---

## 🚀 Tecnologias utilizadas
- JavaScript
- NodeJs
- CSS
- HTML
- Postgresql

---

## 📁 Download e instalação do projeto:

```bash
# clonar o projeto do repositório
$ git clone https://github.com/AndreDalSantos/LaunchBaseFoodfy.git

# entrar na pasta do projeto
$ cd LaunchBaseFoodfy

# instalar dependências
$ npm install
```

---

## Antes de iniciar o projeto

### Criar banco de dados
- Criar o banco de dados no Postgresql conforme código no arquivo '/Database.sql' com o nome de foodfy.

### Configurar arquivo com parâmetros do banco de dados
- No arquivo '/src/config/db.js' pode-se configurar usuário, senha, porta, e o nome do banco de dados.

### Nodemailer
- Neste projeto foi utilizado o Nodemailer para testes de envio de e-mails para recuperação de senha. Crie uma conta no mailtrap, depois crie uma nova inbox e a acesse. Na aba SMTP settings, em SMTP Credentials copie seu Username e Password, depois acesse o arquivo '/src/lib/mailer' e substitua os campos de username e password.

### Seed de usuários Fakes para testes
- Para fins de teste pode-se criar usuários, chefs e receitas fakes. Em '/seed.js' há um script para cria-los, execute esse arquivo:

```bash
    # Acessar a pasta do projeto
    $ cd LaunchBaseFoodfy

    # Executar o seed
    $ node seed.js
```
- Assim serão criados alguns usuários, chefs e receitas para testes. Os arquivos de imagens para os avatares dos chefs e imagens das receitas estão em '/public/images' e podem ser atribuidos até 10 chefs e até 30 receitas. A senha padrão para os usuários é '111'.

---

## Iniciar o projeto
```bash
    # Acessar a pasta do projeto
    $ cd LaunchBaseFoodfy

    # Iniciar o projeto
    $ npm start
```

### OBS:
- Acessar http://localhost:3000