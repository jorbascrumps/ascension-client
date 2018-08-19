export default SuperClass => class extends SuperClass {

    constructor (scene) {
        super(scene);

        this.on('STATE_CHANGE', this.changeState);
        this.state = null;
        this.previousState = null;
        // TODO: Emity initial state
    }

    changeState(state) {
        if (this.state) {
            this.state.onExit();
        }

        this.previousState = this.state;
        this.state = typeof state === 'function'
            ?   new state(this)
            :   new state.constructor(this);
    }

};
