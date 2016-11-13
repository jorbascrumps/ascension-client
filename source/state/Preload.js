export default class {
    create () {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.state.start('Game');
    }
}
