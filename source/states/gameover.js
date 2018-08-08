export const key = 'GAMEOVER';

export function init ({ isWinner = false } = {}) {
    this.isWinner = isWinner;
}

export function create () {
    this.cameras.main
        .setBackgroundColor(0x000000);

    const text = this.isWinner ? 'YOU WIN! :)' : 'YOU LOSE! :(';
    this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, text)
        .setOrigin(0.5, 0.5);
}