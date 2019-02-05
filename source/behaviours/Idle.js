import State from './State';

export default class IdleState extends State {

    onEnter() {
        super.onEnter();

        this.target.sprite.setAlpha(0.5);
    }

    onExit() {
        super.onExit();

        this.target.sprite.setAlpha(1);
    }

}
