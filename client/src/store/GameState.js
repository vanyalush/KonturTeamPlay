import {makeAutoObservable} from "mobx";

class gameState {
    username = ""
    sessionId = null
    socket = null
    revealedCount = 0
    syncOrder = null
    players = []
    isEditing = false
    savedMotivators = []
    timerDuration = 90
    timeLeft = 0
    cursors = {}
    readyPlayers = []


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
    setSyncOrder(order){
        this.syncOrder = order;
    }

    setSavedMotivators(items) {
        this.savedMotivators = items;
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
    setTimerDuration(seconds){
        this.timerDuration = seconds;
    }
    setTimeLeft(t){
        this.timeLeft = t;
    }
    setCursor(username, x, y){
        this.cursors[username] = {x, y};
    }
    removeCursor(username) {
        delete this.cursors[username];
    }
    addReadyPlayer(username){
        if(!this.readyPlayers.includes(username)){
            this.readyPlayers.push(username);
        }
    }
    removeReadyPlayer(username) {
        this.readyPlayers = this.readyPlayers.filter(p => p !== username);
    }
}

export default new gameState();

