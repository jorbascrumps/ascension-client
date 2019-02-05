import State from './State';

export default class ActivationState extends State {

    onEnter() {
        super.onEnter();

        this.target.sprite.setTint(0xff0000);
    }

    onExit() {
        super.onExit();

        this.target.sprite.clearTint();
    }

}
