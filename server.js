const portaPadrao = 8001

const express = require('express')

// https://expressjs.com/en/4x/api.html 
const app = express()
app.use(express.static("public"))

// https://nodejs.org/api/http.html
const http = require('http').Server(app)

const serverSocket = require('socket.io')(http)
serverSocket.set('transports', ['websocket'])

//npm start PORTA
const porta = process.argv.length == 3 ? process.argv[2] : process.env.PORT || portaPadrao

const host = process.env.HEROKU_APP_NAME ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com` : "http://localhost"

http.listen(porta, () => {
    if (process.env.HEROKU_APP_NAME)
        console.log('Servidor iniciado. Abra o navegador em ' + host)
    else console.log('Servidor iniciado. Abra o navegador no endereço do balanceador de carga')
})

app.get('/', (requisicao, resposta) => resposta.sendFile(__dirname + '/index.html'))

serverSocket.on('connect', recebeConexaoUsuario)

function recebeConexaoUsuario(socket) {
    socket.on('login', (nickname) => registraLoginUsuario(socket, nickname))
    socket.on('disconnect', () => console.log('Cliente desconectado: ' + socket.nickname))
    socket.on('chat msg', (msg) => encaminhaMsgsUsuarios(socket, msg))
    socket.on('status', (msg) => encaminhaMsgStatus(socket, msg))
}

function encaminhaMsgStatus(socket, msg) {
    console.log(msg)
    socket.broadcast.emit('status', msg)
}

function encaminhaMsgsUsuarios(socket, msg) {
    serverSocket.emit('chat msg', `${socket.nickname} diz: ${msg}`)
}

function registraLoginUsuario(socket, nickname) {
    socket.nickname = nickname
    const msg = nickname + ' conectou'
    console.log(msg)
    serverSocket.emit('chat msg', msg)
}