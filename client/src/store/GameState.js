import {makeAutoObservable} from "mobx";

class gameState {
    username = ""
    sessionId = null
    socket = null
    revealedCount = 0
    players = []
    isEditing = false

    constructor() {
        makeAutoObservable(this)
    }

    setUsername(username) {
        this.username = username;
    }
    setSessionId(id) {
        this.sessionId = id;
    }
    setSocket(socket){
        this.socket = socket;
    }

    revealNext(){
        this.revealedCount += 1;
    }
    revealAll(total){
        this.revealedCount = total;
    }
    resetReveal(){
        this.revealedCount = 0;
    }
    setRevealed(count){
        this.revealedCount = count;
    }

    addPlayer(username){
        if(!this.players.includes(username)){
            this.players.push(username);
        }
    }
    removePlayer(username) {
        this.players = this.players.filter(p => p !== username);
    }
    setPlayers(players){
        this.players = players;
    }
    clearPlayers() {
        this.players = [];
    }

    enableEditing(){
        this.isEditing = true;
    }
    disableEditing(){
        this.isEditing = false;
    }
    toggleEditing(){
        this.isEditing = !this.isEditing;
    }
}

export default new gameState();