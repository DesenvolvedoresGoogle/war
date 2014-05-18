# Hackathon War

Uma mini versão do [WAR](http://www.wargratis.com.br/static/public/pdf/war1_regras.pdf) jogada sobre o Google Maps, onde o objetivo é conquistar todos os estados do Brasil

## Para rodar o projeto

O projeto foi escrito em Node.js e usa MongoDB como servidor de banco de dados

```
# Backend setup

$ cd api
$ npm install 
$ node seed.js
$ node index.js
```

O projeto assume que o backend está escutando na porta 3000 e o MongoDB rodando localhost na porta 27017
